const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const backToTop = document.querySelector(".back-to-top");
const mobileNavigation = window.matchMedia("(max-width: 1024px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const interfaceLanguage = document.documentElement.lang === "zh-Hans" ? "zh" : "en";
const navigationLabels = interfaceLanguage === "zh"
    ? { open: "打开导航菜单", close: "关闭导航菜单" }
    : { open: "Open navigation menu", close: "Close navigation menu" };

if (hamburger && navLinks) {
    const logoLink = document.querySelector(".logo a");
    let menuScrollPosition = 0;

    const setPageScrollLock = (shouldLock) => {
        if (shouldLock && !document.body.classList.contains("navigation-open")) {
            menuScrollPosition = window.scrollY;
            document.body.style.top = `-${menuScrollPosition}px`;
            document.body.classList.add("navigation-open");
            return;
        }

        if (!shouldLock && document.body.classList.contains("navigation-open")) {
            const previousScrollBehavior = document.documentElement.style.scrollBehavior;

            document.body.classList.remove("navigation-open");
            document.body.style.top = "";
            document.documentElement.style.scrollBehavior = "auto";
            window.scrollTo(0, menuScrollPosition);
            document.documentElement.style.scrollBehavior = previousScrollBehavior;
        }
    };

    const setMenuState = (isOpen) => {
        const shouldOpen = isOpen && mobileNavigation.matches;

        navLinks.classList.toggle("active", shouldOpen);
        hamburger.classList.toggle("active", shouldOpen);
        hamburger.setAttribute("aria-expanded", String(shouldOpen));
        hamburger.setAttribute(
            "aria-label",
            shouldOpen ? navigationLabels.close : navigationLabels.open
        );

        if (mobileNavigation.matches) {
            navLinks.setAttribute("aria-hidden", String(!shouldOpen));
        } else {
            navLinks.removeAttribute("aria-hidden");
        }

        setPageScrollLock(shouldOpen);

        if (shouldOpen) {
            window.requestAnimationFrame(() => navLinks.querySelector("a")?.focus());
        }
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
            return;
        }

        if (event.key === "Tab" && hamburger.getAttribute("aria-expanded") === "true") {
            if (event.shiftKey && document.activeElement === logoLink) {
                event.preventDefault();
                hamburger.focus();
            } else if (!event.shiftKey && document.activeElement === hamburger) {
                event.preventDefault();
                logoLink?.focus();
            }
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

    setMenuState(false);
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

const productTabs = Array.from(document.querySelectorAll("[data-products-panel]"));
const productPanels = Array.from(document.querySelectorAll("[data-products-content]"));

if (productTabs.length > 0 && productPanels.length > 0) {
    const activateProductsPanel = (panelName, moveFocus = false) => {
        productTabs.forEach((tab) => {
            const isActive = tab.dataset.productsPanel === panelName;

            tab.classList.toggle("is-active", isActive);
            tab.setAttribute("aria-selected", String(isActive));
            tab.tabIndex = isActive ? 0 : -1;

            if (isActive && moveFocus) {
                tab.focus();
            }
        });

        productPanels.forEach((panel) => {
            const isActive = panel.dataset.productsContent === panelName;

            panel.classList.toggle("is-active", isActive);
            panel.hidden = !isActive;
        });
    };

    productTabs.forEach((tab, index) => {
        tab.addEventListener("click", () => {
            activateProductsPanel(tab.dataset.productsPanel);
        });

        tab.addEventListener("keydown", (event) => {
            const supportedKeys = ["ArrowLeft", "ArrowRight", "Home", "End"];

            if (!supportedKeys.includes(event.key)) {
                return;
            }

            event.preventDefault();

            let nextIndex = index;

            if (event.key === "ArrowLeft") {
                nextIndex = (index - 1 + productTabs.length) % productTabs.length;
            } else if (event.key === "ArrowRight") {
                nextIndex = (index + 1) % productTabs.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = productTabs.length - 1;
            }

            activateProductsPanel(productTabs[nextIndex].dataset.productsPanel, true);
        });
    });
}

// Keep the existing fixed navigation readable once it leaves the homepage hero.
const homepageHero = document.querySelector(".warm-home-page .hero");
if (homepageHero) {
    const homepageHeader = document.querySelector("header");
    const updateHeroNavigation = () => {
        document.body.classList.toggle("hero-past",
            window.scrollY >= homepageHero.offsetTop + homepageHero.offsetHeight - homepageHeader.offsetHeight);
    };
    window.addEventListener("scroll", updateHeroNavigation, { passive: true });
    window.addEventListener("resize", updateHeroNavigation);
    updateHeroNavigation();
}
