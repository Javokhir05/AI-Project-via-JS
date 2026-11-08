(() => {
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");

    // Auth-aware buttons
    const user = Auth.currentUser();
    document.querySelectorAll("[data-auth-slot]").forEach((slot) => {
        slot.innerHTML = user
            ? `<a class="btn btn-primary" href="pages/chat.html"><span class="ms">chat</span> Open chat</a>`
            : `<a class="btn btn-ghost" href="pages/login.html">Log in</a><a class="btn btn-primary" href="pages/register.html">Sign up</a>`;
    });
    if (user) {
        document.querySelectorAll("[data-cta-primary]").forEach((a) => {
            a.href = "pages/chat.html";
            a.textContent = "Open chat";
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

    // Typing animation (types, pauses, deletes, repeats)
    const typed = document.getElementById("typed");
    const words = ["Hi there...", "Hola...", "Cześć...", "Hello..."];
    let w = 0, i = 0, deleting = false;
    const tick = () => {
        const word = words[w];
        if (!deleting) {
            typed.textContent = word.slice(0, ++i);
            if (i === word.length) { deleting = true; return setTimeout(tick, 1400); }
            return setTimeout(tick, 100);
        }
        typed.textContent = word.slice(0, --i);
        if (i === 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
        setTimeout(tick, 50);
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) typed.textContent = words[0];
    else tick();

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
