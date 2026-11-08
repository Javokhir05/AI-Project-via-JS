(() => {
    const user = Auth.requireAuth();
    if (!user) return; // redirected to login

    const $ = (s) => document.querySelector(s);
    const app = $("#app");
    const messagesEl = $("#messages");
    const historyEl = $("#history");
    const input = $("#input");
    const sendBtn = $("#send");
    const composer = $("#composer");
    const fileInput = $("#file-input");
    const attachPreview = $("#attach-preview");
    const searchEl = $("#search");
    const titleEl = $("#chat-title");
    const toastEl = $("#toast");
    const t = (k, v) => I18n.t(k, v);

    const STORAGE_KEY = "chatbot_history_" + user.email;
    const SUGGESTIONS = [["lightbulb", "sug.1"], ["mail", "sug.2"], ["code", "sug.3"], ["restaurant", "sug.4"]];

    let chats = loadChats();
    let activeId = null;
    let pendingFile = null; // { data, mime_type, name, preview }
    let busy = false;

    /* ---------------- Storage ---------------- */
    function loadChats() {
        try {
            const d = JSON.parse(localStorage.getItem(STORAGE_KEY));
            return Array.isArray(d) ? d : [];
        } catch (e) { return []; }
    }
    function saveChats() {
        try {
            // Image data is kept in memory only (it would quickly fill localStorage)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(chats, (k, v) => (k === "image" ? undefined : v)));
        } catch (e) {
            toast(t("chat.storageFull"), true);
        }
    }
    const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const activeChat = () => chats.find((c) => c.id === activeId) || null;

    /* ---------------- Helpers ---------------- */
    function toast(msg, isError) {
        toastEl.textContent = msg;
        toastEl.classList.toggle("error", !!isError);
        toastEl.classList.add("show");
        clearTimeout(toast.t);
        toast.t = setTimeout(() => toastEl.classList.remove("show"), 4200);
    }

    function escapeHtml(s) {
        return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
    }

    // Tiny, safe Markdown renderer (HTML is escaped first)
    function renderMarkdown(src) {
        const blocks = [];
        const text = escapeHtml(src).replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, code) => {
            blocks.push(`<pre><code>${code.replace(/\n$/, "")}</code></pre>`);
            return `\u0000${blocks.length - 1}\u0000`;
        });
        const inline = (t) => t
            .replace(/`([^`\n]+)`/g, "<code>$1</code>")
            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
            .replace(/(^|[^*])\*(?!\s)([^*\n]+?)\*(?!\*)/g, "$1<em>$2</em>")
            .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        let out = "", list = null, para = [];
        const flushPara = () => { if (para.length) { out += `<p>${inline(para.join("<br>"))}</p>`; para = []; } };
        const flushList = () => { if (list) { out += `</${list}>`; list = null; } };

        for (const line of text.split("\n")) {
            let m;
            if (/^\u0000\d+\u0000$/.test(line.trim())) { flushPara(); flushList(); out += line.trim(); continue; }
            if ((m = line.match(/^\s*[-*•]\s+(.*)/))) {
                flushPara(); if (list !== "ul") { flushList(); out += "<ul>"; list = "ul"; }
                out += `<li>${inline(m[1])}</li>`; continue;
            }
            if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) {
                flushPara(); if (list !== "ol") { flushList(); out += "<ol>"; list = "ol"; }
                out += `<li>${inline(m[1])}</li>`; continue;
            }
            if ((m = line.match(/^#{1,4}\s+(.*)/))) { flushPara(); flushList(); out += `<h4>${inline(m[1])}</h4>`; continue; }
            if (!line.trim()) { flushPara(); flushList(); continue; }
            flushList(); para.push(line);
        }
        flushPara(); flushList();
        return out.replace(/\u0000(\d+)\u0000/g, (_, i) => blocks[i]);
    }

    /* ---------------- Rendering: messages ---------------- */
    function messageNode(m) {
        const row = document.createElement("div");
        row.className = "msg " + (m.role === "user" ? "user" : "bot");

        if (m.role !== "user") {
            row.innerHTML = '<div class="bot-avatar"><img src="../assets/logo.svg" alt=""></div>';
        }
        const bubble = document.createElement("div");
        bubble.className = "bubble";

        if (m.role === "user") {
            if (m.image) {
                const img = document.createElement("img");
                img.className = "attachment"; img.src = m.image; img.alt = "Attached image";
                bubble.appendChild(img);
            } else if (m.hasImage) {
                bubble.insertAdjacentHTML("beforeend", `<div class="img-chip"><span class="ms">image</span> ${escapeHtml(t("chat.imageAttached"))}</div>`);
            }
            const t = document.createElement("div");
            t.textContent = m.text;
            bubble.appendChild(t);
        } else {
            bubble.innerHTML = renderMarkdown(m.text);
            const tools = document.createElement("div");
            tools.className = "msg-tools";
            tools.innerHTML = `<button class="icon-btn" title="${escapeHtml(t("chat.copy"))}" aria-label="${escapeHtml(t("chat.copy"))}"><span class="ms">content_copy</span></button>`;
            tools.firstChild.addEventListener("click", async () => {
                try { await navigator.clipboard.writeText(m.text); toast(t("chat.copied")); }
                catch (e) { toast(t("chat.copyFail"), true); }
            });
            bubble.appendChild(tools);
        }
        row.appendChild(bubble);
        return row;
    }

    function renderMessages() {
        const chat = activeChat();
        messagesEl.innerHTML = "";
        const inner = document.createElement("div");
        inner.className = "messages-inner";

        if (!chat || !chat.messages.length) {
            inner.innerHTML = `
                <div class="welcome">
                    <div class="logo-mark"><img src="../assets/logo.svg" alt=""></div>
                    <h2>${escapeHtml(t("chat.welcome", { name: user.name.split(" ")[0] }))}</h2>
                    <p>${escapeHtml(t("chat.welcomeSub"))}</p>
                    <div class="suggestions"></div>
                </div>`;
            const wrap = inner.querySelector(".suggestions");
            SUGGESTIONS.forEach(([icon, key]) => {
                const text = t(key);
                const b = document.createElement("button");
                b.className = "suggestion"; b.type = "button";
                b.innerHTML = `<span class="ms">${icon}</span><span></span>`;
                b.lastChild.textContent = text;
                b.addEventListener("click", () => sendMessage(text));
                wrap.appendChild(b);
            });
        } else {
            chat.messages.forEach((m) => inner.appendChild(messageNode(m)));
        }
        messagesEl.appendChild(inner);
        titleEl.textContent = chat ? chat.title : t("chat.new");
        document.title = (chat ? chat.title + " – " : "") + "ChatBot";
        scrollToBottom(false);
    }

    function showTyping() {
        const inner = messagesEl.querySelector(".messages-inner");
        if (!inner) return;
        const row = document.createElement("div");
        row.className = "msg bot"; row.id = "typing-row";
        row.innerHTML = '<div class="bot-avatar"><img src="../assets/logo.svg" alt=""></div><div class="bubble"><div class="typing"><i></i><i></i><i></i></div></div>';
        inner.appendChild(row);
        scrollToBottom(true);
    }
    const hideTyping = () => { const t = $("#typing-row"); if (t) t.remove(); };
    const scrollToBottom = (smooth) => messagesEl.scrollTo({ top: messagesEl.scrollHeight, behavior: smooth ? "smooth" : "auto" });

    /* ---------------- Rendering: history sidebar ---------------- */
    function groupLabel(ts) {
        const sod = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const diff = Math.round((sod(new Date()) - sod(new Date(ts))) / 864e5);
        if (diff <= 0) return t("chat.today");
        if (diff === 1) return t("chat.yesterday");
        if (diff <= 7) return t("chat.week");
        return t("chat.older");
    }

    function renderSidebar() {
        const q = searchEl.value.trim().toLowerCase();
        const list = chats
            .filter((c) => !q || c.title.toLowerCase().includes(q) || c.messages.some((m) => m.text.toLowerCase().includes(q)))
            .sort((a, b) => b.updated - a.updated);

        historyEl.innerHTML = "";
        if (!list.length) {
            historyEl.innerHTML = `<p class="empty">${q ? escapeHtml(t("chat.noMatch")) : t("chat.noChats")}</p>`;
            return;
        }
        let lastGroup = "";
        list.forEach((c) => {
            const g = groupLabel(c.updated);
            if (g !== lastGroup) {
                const h = document.createElement("h3"); h.textContent = g; historyEl.appendChild(h); lastGroup = g;
            }
            const item = document.createElement("div");
            item.className = "chat-item" + (c.id === activeId ? " active" : "");
            item.innerHTML = `<button class="open"></button><button class="icon-btn del" title="${escapeHtml(t("chat.delete"))}" aria-label="${escapeHtml(t("chat.delete"))}"><span class="ms">delete</span></button>`;
            const open = item.querySelector(".open");
            open.textContent = c.title; open.title = c.title;
            open.addEventListener("click", () => openChat(c.id));
            item.querySelector(".del").addEventListener("click", () => deleteChat(c.id));
            historyEl.appendChild(item);
        });
    }

    /* ---------------- Chat actions ---------------- */
    function openChat(id) {
        activeId = id;
        renderSidebar(); renderMessages(); closeSidebar();
        if (window.innerWidth > 860) input.focus();
    }

    function newChat() {
        activeId = null;
        clearFile(); input.value = ""; autosize(); updateSend();
        renderSidebar(); renderMessages(); closeSidebar();
        if (window.innerWidth > 860) input.focus();
    }

    function deleteChat(id) {
        const c = chats.find((x) => x.id === id);
        if (!c || !confirm(t("chat.confirmDelete", { title: c.title }))) return;
        chats = chats.filter((x) => x.id !== id);
        saveChats();
        if (activeId === id) activeId = null;
        renderSidebar(); renderMessages();
    }

    function clearAll() {
        if (!chats.length) return toast(t("chat.nothingToClear"));
        if (!confirm(t("chat.confirmClear"))) return;
        chats = []; activeId = null; saveChats();
        renderSidebar(); renderMessages();
    }

    async function sendMessage(rawText) {
        let text = (rawText ?? input.value).trim();
        if (busy || (!text && !pendingFile)) return;
        if (!text) text = t("chat.imageQuestion");

        let chat = activeChat();
        if (!chat) {
            chat = { id: uid(), title: text.length > 46 ? text.slice(0, 46).trim() + "…" : text, created: Date.now(), updated: Date.now(), messages: [] };
            chats.unshift(chat);
            activeId = chat.id;
        }

        const file = pendingFile ? { data: pendingFile.data, mime_type: pendingFile.mime_type } : null;
        const userMsg = { role: "user", text, ts: Date.now() };
        if (pendingFile) { userMsg.hasImage = true; userMsg.image = pendingFile.preview; }

        chat.messages.push(userMsg);
        chat.updated = Date.now();
        saveChats();

        input.value = ""; clearFile(); autosize(); updateSend();
        setBusy(true);
        renderSidebar(); renderMessages(); showTyping();

        try {
            const reply = await ChatAPI.send(chat.messages, file);
            chat.messages.push({ role: "model", text: reply, ts: Date.now() });
            chat.updated = Date.now();
        } catch (err) {
            // Roll back the unanswered message so the stored history stays valid
            chat.messages.pop();
            if (!chat.messages.length) {
                chats = chats.filter((c) => c !== chat);
                if (activeId === chat.id) activeId = null;
            }
            if (!input.value) { input.value = text; autosize(); }
            toast(err.message || t("chat.wrong"), true);
        } finally {
            setBusy(false);
            saveChats();
            renderSidebar();
            if (activeId === chat.id || activeId === null) renderMessages();
            updateSend();
        }
    }

    function setBusy(b) { busy = b; updateSend(); }
    function updateSend() { sendBtn.disabled = busy || (!input.value.trim() && !pendingFile); }

    /* ---------------- Composer ---------------- */
    function autosize() {
        input.style.height = "auto";
        input.style.height = Math.min(input.scrollHeight, 180) + "px";
    }
    input.addEventListener("input", () => { autosize(); updateSend(); });
    input.addEventListener("keydown", (e) => {
        const touch = window.matchMedia("(pointer: coarse)").matches;
        if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !touch) {
            e.preventDefault();
            sendMessage();
        }
    });
    composer.addEventListener("submit", (e) => { e.preventDefault(); sendMessage(); });

    // Image attachment
    $("#file-btn").addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
        const f = fileInput.files[0];
        fileInput.value = "";
        if (!f) return;
        if (!f.type.startsWith("image/")) return toast(t("chat.notImage"), true);
        if (f.size > 8 * 1024 * 1024) return toast(t("chat.tooBig"), true);
        const reader = new FileReader();
        reader.onload = (e) => {
            pendingFile = { data: e.target.result.split(",")[1], mime_type: f.type, name: f.name, preview: e.target.result };
            $("#attach-img").src = pendingFile.preview;
            $("#attach-name").textContent = f.name;
            attachPreview.hidden = false;
            updateSend();
        };
        reader.readAsDataURL(f);
    });
    function clearFile() { pendingFile = null; attachPreview.hidden = true; $("#attach-img").removeAttribute("src"); }
    $("#attach-remove").addEventListener("click", () => { clearFile(); updateSend(); });

    // Emoji picker (created on first use)
    let picker = null;
    const emojiBtn = $("#emoji-btn");
    if (typeof EmojiMart === "undefined") emojiBtn.hidden = true;
    emojiBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!picker) {
            picker = new EmojiMart.Picker({
                theme: document.documentElement.getAttribute("data-theme"),
                skinTonePosition: "none", previewPosition: "none",
                onEmojiSelect: (emoji) => {
                    const { selectionStart: s, selectionEnd: en } = input;
                    input.setRangeText(emoji.native, s, en, "end");
                    input.focus(); autosize(); updateSend();
                },
            });
            picker.style.display = "none";
            $(".composer-wrap").appendChild(picker);
        }
        picker.style.display = picker.style.display === "none" ? "block" : "none";
    });
    document.addEventListener("click", (e) => {
        if (picker && picker.style.display !== "none" && !e.target.closest("em-emoji-picker")) picker.style.display = "none";
    });

    /* ---------------- Sidebar / account ---------------- */
    const openSidebar = () => app.classList.add("sidebar-open");
    function closeSidebar() { app.classList.remove("sidebar-open"); }
    $("#open-sb").addEventListener("click", openSidebar);
    $("#sb-close").addEventListener("click", closeSidebar);
    $("#scrim").addEventListener("click", closeSidebar);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSidebar(); });
    window.addEventListener("resize", () => { if (window.innerWidth > 860) closeSidebar(); });

    $("#new-chat").addEventListener("click", newChat);
    $("#top-new").addEventListener("click", newChat);
    $("#clear-all").addEventListener("click", clearAll);
    $("#logout").addEventListener("click", () => { Auth.logout(); location.href = "../index.html"; });
    searchEl.addEventListener("input", renderSidebar);

    $("#user-name").textContent = user.name;
    $("#user-email").textContent = user.email;
    $("#user-avatar").textContent = user.name.trim().charAt(0).toUpperCase();

    // Keep several tabs in sync
    window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && !busy) { chats = loadChats(); renderSidebar(); if (!activeChat()) activeId = null; renderMessages(); }
    });

    // Re-render everything when the language changes
    I18n.onChange(() => {
        renderSidebar();
        renderMessages();
        if (busy) showTyping();
    });

    /* ---------------- Init ---------------- */
    renderSidebar();
    renderMessages();
    updateSend();
})();
