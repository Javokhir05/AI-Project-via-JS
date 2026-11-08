// App configuration. Swapping to a different AI API only needs changes here and in api.js.
window.APP_CONFIG = {
    // Paste your Gemini key here for local testing ONLY.
    // Anything in front-end JS is visible to every visitor, so for a public site
    // set PROXY_URL (below) to a small backend/serverless function that holds the key.
    API_KEY: "",

    // Current Gemini model name. Change it if Google retires or renames it.
    MODEL: "gemini-2.5-flash",

    API_BASE: "https://generativelanguage.googleapis.com/v1beta/models",

    // Optional: URL of your own endpoint. It receives the same JSON body as Gemini's
    // generateContent and should forward it using a server-side key.
    PROXY_URL: "/.netlify/functions/chat",
};
