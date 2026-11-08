/*
 * Client-side auth (DEMO ONLY).
 * Accounts live in this browser's localStorage, so they are not shared between
 * devices and are not secure against someone with access to the browser.
 * For a real product, replace the functions below with calls to your backend
 * (the page code only uses the public API at the bottom of this file).
 */
const Auth = (() => {
    const USERS_KEY = "chatbot_users";
    const SESSION_KEY = "chatbot_session";
    const ALLOWED_NEXT = ["chat.html"];
    const enc = new TextEncoder();

    const readJSON = (store, key) => {
        try { return JSON.parse(store.getItem(key)); } catch (e) { return null; }
    };
    const getUsers = () => readJSON(localStorage, USERS_KEY) || {};
    const setUsers = (u) => localStorage.setItem(USERS_KEY, JSON.stringify(u));

    const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
    const fromB64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
    const randomSalt = () => toB64(crypto.getRandomValues(new Uint8Array(16)));

    async function hashPassword(password, saltB64) {
        if (window.crypto && crypto.subtle) {
            const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
            const bits = await crypto.subtle.deriveBits(
                { name: "PBKDF2", salt: fromB64(saltB64), iterations: 150000, hash: "SHA-256" },
                key, 256
            );
            return toB64(bits);
        }
        // Weak fallback for non-secure contexts (e.g. plain http on a LAN address)
        let h = 5381;
        const s = saltB64 + password;
        for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
        return "weak" + h;
    }

    const normEmail = (e) => String(e || "").trim().toLowerCase();
    const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);

    function startSession(email, remember) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
        (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify({ email }));
    }

    function currentUser() {
        const s = readJSON(localStorage, SESSION_KEY) || readJSON(sessionStorage, SESSION_KEY);
        if (!s) return null;
        const u = getUsers()[s.email];
        return u ? { name: u.name, email: u.email } : null;
    }

    function safeNext() {
        const n = new URLSearchParams(location.search).get("next");
        return ALLOWED_NEXT.includes(n) ? n : "chat.html";
    }

    return {
        async register({ name, email, password }) {
            name = String(name || "").trim();
            email = normEmail(email);
            if (name.length < 2) return { ok: false, field: "name", error: "Please enter your name." };
            if (!validEmail(email)) return { ok: false, field: "email", error: "Enter a valid email address." };
            if (!password || password.length < 8) return { ok: false, field: "password", error: "Use at least 8 characters." };
            const users = getUsers();
            if (users[email]) return { ok: false, field: "email", error: "An account with this email already exists." };
            const salt = randomSalt();
            users[email] = { name, email, salt, hash: await hashPassword(password, salt), created: Date.now() };
            setUsers(users);
            startSession(email, true);
            return { ok: true };
        },

        async login({ email, password, remember }) {
            email = normEmail(email);
            const u = getUsers()[email];
            if (!u || (await hashPassword(password || "", u.salt)) !== u.hash) {
                return { ok: false, error: "Incorrect email or password." };
            }
            startSession(email, !!remember);
            return { ok: true };
        },

        logout() {
            localStorage.removeItem(SESSION_KEY);
            sessionStorage.removeItem(SESSION_KEY);
        },

        currentUser,

        /** Use on protected pages. Returns the user, or redirects to login and returns null. */
        requireAuth() {
            const u = currentUser();
            if (!u) {
                const page = location.pathname.split("/").pop() || "chat.html";
                location.replace("login.html?next=" + encodeURIComponent(page));
                return null;
            }
            return u;
        },

        /** Use on login/register pages: skip them when already signed in. */
        redirectIfAuthed() {
            if (currentUser()) location.replace(safeNext());
        },

        safeNext,
    };
})();
