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
    const setMenuState = (isOpen) => {
        navLinks.classList.toggle("active", isOpen);
        hamburger.classList.toggle("active", isOpen);
        hamburger.setAttribute("aria-expanded", String(isOpen));
        hamburger.setAttribute(
            "aria-label",
            isOpen ? navigationLabels.close : navigationLabels.open
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
