(() => {
    Auth.redirectIfAuthed();

    const t = (k, v) => I18n.t(k, v);
    const form = document.getElementById("auth-form");
    const mode = form.dataset.mode; // "login" | "register"
    const submitBtn = document.getElementById("submit");
    const formError = document.getElementById("form-error");
    const formErrorText = document.getElementById("form-error-text");
    const field = (name) => form.elements[name];

    // Keep ?next= when switching between login and register
    const next = new URLSearchParams(location.search).get("next");
    const switchLink = document.getElementById("switch-link");
    if (next && switchLink) switchLink.href += "?next=" + encodeURIComponent(next);

    // Show / hide password
    const updateReveal = () => {
        document.querySelectorAll("[data-reveal]").forEach((btn) => {
            const shown = field(btn.dataset.reveal).type !== "password";
            btn.querySelector(".ms").textContent = shown ? "visibility_off" : "visibility";
            btn.setAttribute("aria-label", t(shown ? "form.hidePassword" : "form.showPassword"));
        });
    };
    document.querySelectorAll("[data-reveal]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const input = field(btn.dataset.reveal);
            input.type = input.type === "password" ? "text" : "password";
            updateReveal();
        });
    });
    updateReveal();

    // Errors
    const setFieldError = (name, msg) => {
        const slot = form.querySelector(`[data-error-for="${name}"]`);
        const input = field(name);
        if (slot) slot.textContent = msg || "";
        if (input) input.classList.toggle("invalid", !!msg);
    };
    const clearErrors = () => {
        form.querySelectorAll("[data-error-for]").forEach((s) => setFieldError(s.dataset.errorFor, ""));
        formError.classList.remove("show");
    };
    const showFormError = (msg) => {
        formErrorText.textContent = msg;
        formError.classList.add("show");
    };
    form.addEventListener("input", (e) => {
        if (e.target.name) setFieldError(e.target.name, "");
        formError.classList.remove("show");
    });

    // Password strength (register only)
    const strength = document.getElementById("strength");
    const strengthLabel = document.getElementById("strength-label");
    const strengthKeys = ["", "strength.weak", "strength.fair", "strength.good", "strength.strong"];
    const updateStrength = () => {
        if (!strength) return;
        const p = field("password").value;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
        if (/\d/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p) || p.length >= 14) score++;
        if (!p) score = 0;
        strength.dataset.level = score;
        strengthLabel.textContent = p ? t(strengthKeys[score] || strengthKeys[1]) : "";
    };
    if (strength) field("password").addEventListener("input", updateStrength);

    const setLoading = (loading) => {
        submitBtn.disabled = loading;
        if (loading) {
            submitBtn.innerHTML = '<span class="spinner"></span>';
            submitBtn.append(" " + t("form.wait"));
        } else {
            submitBtn.textContent = t(mode === "login" ? "common.login" : "common.createAccount");
        }
    };

    I18n.onChange(() => {
        updateReveal();
        updateStrength();
        clearErrors();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();

        const email = field("email").value;
        const password = field("password").value;
        let result;

        if (mode === "register") {
            const confirm = field("confirm").value;
            if (password !== confirm) {
                setFieldError("confirm", t("err.mismatch"));
                return;
            }
            setLoading(true);
            result = await Auth.register({ name: field("name").value, email, password });
        } else {
            if (!email.trim()) return setFieldError("email", t("err.enterEmail"));
            if (!password) return setFieldError("password", t("err.enterPassword"));
            setLoading(true);
            result = await Auth.login({ email, password, remember: document.getElementById("remember").checked });
        }

        if (result.ok) {
            location.href = Auth.safeNext();
            return;
        }
        setLoading(false);
        if (result.field) setFieldError(result.field, result.error);
        else showFormError(result.error);
    });
})();
