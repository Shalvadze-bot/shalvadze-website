(() => {
    const pageContext = () => ({
        page_language: document.documentElement.lang === "zh-Hans" ? "zh-Hans" : "en",
        page_path: window.location.pathname
    });

    const sendAnalyticsEvent = (eventName, parameters = {}) => {
        const eventParameters = {
            ...pageContext(),
            ...parameters
        };

        if (["localhost", "127.0.0.1", "::1"].includes(window.location.hostname)) {
            console.debug("[SHALVADZE GA4]", eventName, eventParameters);
        }

        if (typeof window.gtag !== "function") {
            return;
        }

        window.gtag("event", eventName, eventParameters);
    };

    document.addEventListener("product_request_start", (event) => {
        sendAnalyticsEvent("product_request_start", {
            form_id: event.detail?.formId || "product-request-form"
        });
    });

    document.addEventListener("product_request_submit", (event) => {
        sendAnalyticsEvent("product_request_submit", {
            form_id: event.detail?.formId || "product-request-form"
        });
    });

    document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const contactCta = event.target.closest(
            'a[href^="mailto:"], [data-contact-action="chat"], [data-product-request-link], [data-contact-method]'
        );

        if (!contactCta) {
            return;
        }

        let contactMethod = contactCta.dataset.contactMethod;

        if (!contactMethod && contactCta.matches('a[href^="mailto:"]')) {
            contactMethod = "email";
        } else if (!contactMethod && contactCta.dataset.contactAction === "chat") {
            contactMethod = "chat";
        } else if (!contactMethod && contactCta.hasAttribute("data-product-request-link")) {
            contactMethod = "product_request";
        }

        const linkText = contactMethod === "email"
            ? "email_link"
            : (contactCta.textContent || "contact_cta").replace(/\s+/g, " ").trim().slice(0, 80);

        sendAnalyticsEvent("contact_click", {
            contact_method: contactMethod || "contact",
            link_text: linkText || "contact_cta"
        });
    });
})();
