// Load this in <head> (no defer) so the theme is applied before first paint.
(function () {
    var KEY = "chatbot_theme";
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    var dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");

    document.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-theme-toggle]");
        if (!btn) return;
        var next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", next);
        try { localStorage.setItem(KEY, next); } catch (err) {}
    });
})();
