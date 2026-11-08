/*
 * The only file that talks to the AI provider.
 * To use a different API later, keep the signature ChatAPI.send(messages, file) -> Promise<string>
 *   messages: [{ role: "user" | "model", text: string }, ...]  (last item is the new user message)
 *   file:     { data: base64, mime_type } | null                (image attached to the last message)
 */
const tr = (k, v) => (typeof I18n !== "undefined" ? I18n.t(k, v) : k);

const ChatAPI = {
    async send(messages, file) {
        const cfg = window.APP_CONFIG || {};
        if (!cfg.PROXY_URL && !cfg.API_KEY) {
            throw new Error(tr("api.noKey"));
        }
        const url = cfg.PROXY_URL || `${cfg.API_BASE}/${cfg.MODEL}:generateContent?key=${cfg.API_KEY}`;

        const contents = messages.map((m, i) => {
            const parts = [{ text: m.text }];
            if (file && i === messages.length - 1 && m.role === "user") parts.push({ inline_data: file });
            return { role: m.role, parts };
        });

        let res;
        try {
            res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contents }),
            });
        } catch (e) {
            throw new Error(tr("api.network"));
        }

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error((data.error && data.error.message) || tr("api.failed", { status: res.status }));

        const parts = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts;
        const text = (parts || []).map((p) => p.text || "").join("").trim();
        if (!text) throw new Error(tr("api.empty"));
        return text;
    },
};
