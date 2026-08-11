const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const mobileNavigation = window.matchMedia("(max-width: 1024px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (hamburger && navLinks) {
    const setMenuState = (isOpen) => {
        navLinks.classList.toggle("active", isOpen);
        hamburger.classList.toggle("active", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        hamburger.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );
    };

    hamburger.addEventListener("click", () => {
        const isOpen = hamburger.getAttribute("aria-expanded") === "true";
        setMenuState(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && hamburger.getAttribute("aria-expanded") === "true") {
            setMenuState(false);
            hamburger.focus();
        }
    });

    document.addEventListener("click", (event) => {
        if (
            mobileNavigation.matches &&
            hamburger.getAttribute("aria-expanded") === "true" &&
            !navLinks.contains(event.target) &&
            !hamburger.contains(event.target)
        ) {
            setMenuState(false);
        }
    });

    if (typeof mobileNavigation.addEventListener === "function") {
        mobileNavigation.addEventListener("change", () => setMenuState(false));
    } else {
        mobileNavigation.addListener(() => setMenuState(false));
    }
}

if (backToTop) {
    let scrollUpdatePending = false;

    const updateBackToTop = () => {
        const isVisible = window.scrollY > 400;

        backToTop.classList.toggle("visible", isVisible);
        backToTop.setAttribute("aria-hidden", String(!isVisible));
        backToTop.tabIndex = isVisible ? 0 : -1;
        scrollUpdatePending = false;
    };

    window.addEventListener("scroll", () => {
        if (!scrollUpdatePending) {
            window.requestAnimationFrame(updateBackToTop);
            scrollUpdatePending = true;
        }
    }, { passive: true });

    backToTop.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    });

    updateBackToTop();
}
