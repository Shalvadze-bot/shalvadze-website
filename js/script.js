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

const servicesCarousel = document.querySelector("[data-services-carousel]");

if (servicesCarousel) {
    const serviceCards = Array.from(servicesCarousel.querySelectorAll("[data-service-index]"));
    const serviceControls = Array.from(servicesCarousel.querySelectorAll("[data-service-control]"));
    const serviceSelectors = Array.from(servicesCarousel.querySelectorAll("[data-service-select]"));
    const serviceStatus = servicesCarousel.querySelector("[data-service-status]");

    if (serviceCards.length > 0) {
        let activeServiceIndex = Math.min(1, serviceCards.length - 1);
        const wrapServiceIndex = (index) => (index + serviceCards.length) % serviceCards.length;

        const showService = (nextIndex) => {
            activeServiceIndex = wrapServiceIndex(nextIndex);
            const previousIndex = wrapServiceIndex(activeServiceIndex - 1);
            const followingIndex = wrapServiceIndex(activeServiceIndex + 1);

            serviceCards.forEach((card, index) => {
                const isActive = index === activeServiceIndex;
                const isPrevious = index === previousIndex;
                const isNext = index === followingIndex;
                const isVisible = isActive || isPrevious || isNext;
                const selector = card.querySelector("[data-service-select]");

                card.classList.toggle("is-active", isActive);
                card.classList.toggle("is-previous", isPrevious);
                card.classList.toggle("is-next", isNext);
                card.classList.toggle("is-hidden", !isVisible);

                if (isActive) {
                    card.setAttribute("aria-current", "true");
                } else {
                    card.removeAttribute("aria-current");
                }

                if (isVisible) {
                    card.removeAttribute("aria-hidden");
                } else {
                    card.setAttribute("aria-hidden", "true");
                }

                if (selector) {
                    selector.tabIndex = isVisible ? 0 : -1;
                    selector.setAttribute("aria-pressed", String(isActive));
                }
            });

            if (serviceStatus) {
                const activeTitle = serviceCards[activeServiceIndex].querySelector("h3")?.textContent.trim();
                serviceStatus.textContent = `Service ${activeServiceIndex + 1} of ${serviceCards.length}: ${activeTitle || "Service"}`;
            }
        };

        serviceControls.forEach((control) => {
            control.addEventListener("click", () => {
                const direction = control.dataset.serviceControl === "previous" ? -1 : 1;
                showService(activeServiceIndex + direction);
            });
        });

        serviceSelectors.forEach((selector) => {
            selector.addEventListener("click", () => {
                const selectedIndex = Number(selector.dataset.serviceSelect);

                if (Number.isInteger(selectedIndex) && selectedIndex !== activeServiceIndex) {
                    showService(selectedIndex);
                }
            });
        });

        servicesCarousel.addEventListener("keydown", (event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                return;
            }

            event.preventDefault();
            showService(activeServiceIndex + (event.key === "ArrowLeft" ? -1 : 1));
        });

        showService(activeServiceIndex);
    }
}
