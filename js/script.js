const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const mobileNavigation = window.matchMedia("(max-width: 1024px)");
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

// Keep the approved desktop grid; enhance the mobile services section in place.
(() => {
    const section = document.querySelector('.warm-home-page #services');
    if (!section) return;
    const grid = section.querySelector('.services-grid');
    const cards = [...grid.querySelectorAll('.service-card')];
    const mobile = window.matchMedia('(max-width: 800px)');
    const chinese = document.documentElement.lang.startsWith('zh');
    let active = 0;
    let gesture = null;
    let suppressClick = false;
    const controls = document.createElement('div');
    controls.className = 'services-carousel-controls';
    const button = (label, text, action, className = '') => {
        const element = document.createElement('button');
        element.type = 'button';
        element.className = className;
        element.setAttribute('aria-label', label);
        element.textContent = text;
        element.addEventListener('click', action);
        controls.append(element);
        return element;
    };
    button(chinese ? '上一个服务模式' : 'Previous business model', '←', () => select(active - 1));
    const dots = cards.map((card, index) => button(
        `${chinese ? '显示' : 'Show'} ${card.querySelector('h3').textContent}`,
        '', () => select(index), 'services-dot'
    ));
    button(chinese ? '下一个服务模式' : 'Next business model', '→', () => select(active + 1));
    grid.after(controls);
    const status = document.createElement('span');
    status.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap';
    status.setAttribute('aria-live', 'polite');
    status.setAttribute('aria-atomic', 'true');
    controls.append(status);
    function select(index, announce = true) {
        active = (index + cards.length) % cards.length;
        cards.forEach((card, i) => {
            card.dataset.position = i === active ? 'active' : i === (active + 1) % cards.length ? 'next' : 'previous';
            if (mobile.matches) card.setAttribute('aria-hidden', String(i !== active));
            else card.removeAttribute('aria-hidden');
            dots[i].setAttribute('aria-current', String(i === active));
        });
        if (announce) status.textContent = `${active + 1} / ${cards.length}: ${cards[active].querySelector('h3').textContent}`;
    }
    function sync() {
        section.classList.toggle('carousel-enabled', mobile.matches);
        if (mobile.matches) {
            grid.tabIndex = 0;
            grid.setAttribute('role', 'group');
            grid.setAttribute('aria-roledescription', chinese ? '轮播' : 'carousel');
            grid.setAttribute('aria-label', chinese ? '服务模式，使用左右方向键浏览' : 'Business models, use left and right arrow keys to explore');
        } else {
            ['tabindex', 'role', 'aria-roledescription', 'aria-label'].forEach(name => grid.removeAttribute(name));
        }
        select(active, false);
    }
    section.addEventListener('keydown', event => {
        if (!mobile.matches || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        select(event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
    });
    grid.addEventListener('pointerdown', event => {
        if (!mobile.matches || !event.isPrimary || event.button !== 0) return;
        gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
        suppressClick = false;
        grid.setPointerCapture(event.pointerId);
    });
    grid.addEventListener('pointerup', event => {
        if (!gesture || gesture.id !== event.pointerId) return;
        const dx = event.clientX - gesture.x;
        const dy = event.clientY - gesture.y;
        gesture = null;
        if (Math.abs(dx) > 35 && Math.abs(dx) > Math.abs(dy)) {
            suppressClick = true;
            select(active + (dx < 0 ? 1 : -1));
        } else {
            const card = document.elementFromPoint(event.clientX, event.clientY)?.closest('.service-card');
            if (card && cards.includes(card)) select(cards.indexOf(card));
        }
    });
    grid.addEventListener('pointercancel', () => { gesture = null; });
    grid.addEventListener('click', event => {
        if (suppressClick) { event.preventDefault(); suppressClick = false; }
    }, true);
    mobile.addEventListener('change', sync);
    sync();
})();
