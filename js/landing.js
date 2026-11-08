(() => {
    const t = (k) => I18n.t(k);
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");

    // Auth-aware buttons
    const user = Auth.currentUser();
    document.querySelectorAll("[data-auth-slot]").forEach((slot) => {
        slot.innerHTML = user
            ? `<a class="btn btn-primary" href="pages/chat.html"><span class="ms">chat</span> <span data-i18n="common.openChat"></span></a>`
            : `<a class="btn btn-ghost" href="pages/login.html" data-i18n="common.login"></a><a class="btn btn-primary" href="pages/register.html" data-i18n="common.signup"></a>`;
        I18n.apply(slot);
    });
    if (user) {
        document.querySelectorAll("[data-cta-primary]").forEach((a) => {
            a.href = "pages/chat.html";
            a.dataset.i18n = "common.openChat";
            a.textContent = t("common.openChat");
        });
    }

    // Mobile menu
    const setMenu = (open) => {
        nav.classList.toggle("open", open);
        burger.setAttribute("aria-expanded", String(open));
        burger.querySelector(".ms").textContent = open ? "close" : "menu";
    };
    burger.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
    document.querySelectorAll(".nav-links a[href^='#']").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    window.addEventListener("resize", () => { if (window.innerWidth > 820) setMenu(false); });

    // Nav border on scroll
    const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Typing animation (types, pauses, deletes, repeats); words follow the chosen language
    const typed = document.getElementById("typed");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let words = I18n.typedWords();
    let w = 0, i = 0, deleting = false;
    const tick = () => {
        const word = words[w % words.length];
        if (!deleting) {
            typed.textContent = word.slice(0, ++i);
            if (i >= word.length) { deleting = true; return setTimeout(tick, 1400); }
            return setTimeout(tick, 100);
        }
        typed.textContent = word.slice(0, --i);
        if (i <= 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
        setTimeout(tick, 50);
    };
    if (reduceMotion) typed.textContent = words[0];
    else tick();

    I18n.onChange(() => {
        words = I18n.typedWords();
        w = 0; i = 0; deleting = false;
        typed.textContent = reduceMotion ? words[0] : "";
    });

    // Scroll reveal
    const items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
        }, { threshold: 0.12 });
        items.forEach((el) => io.observe(el));
    } else {
        items.forEach((el) => el.classList.add("in"));
    }

    document.getElementById("year").textContent = new Date().getFullYear();
})();
