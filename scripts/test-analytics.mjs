import { readFileSync } from "node:fs";
import vm from "node:vm";

const analyticsSource = readFileSync("js/analytics.js", "utf8");

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};

class MockElement {
    constructor(contactCta = null) {
        this.contactCta = contactCta;
    }

    closest() {
        return this.contactCta;
    }
}

const createContactCta = ({ dataset = {}, email = false, text = "" }) => ({
    dataset,
    hasAttribute: (name) => name === "data-product-request-link" && "productRequestLink" in dataset,
    matches: (selector) => email && selector === 'a[href^="mailto:"]',
    textContent: text
});

const createAnalyticsHarness = ({ gtagAvailable = true, lang, path }) => {
    const handlers = new Map();
    const calls = [];
    const document = {
        addEventListener(name, handler) {
            handlers.set(name, handler);
        },
        documentElement: { lang }
    };
    const window = { location: { pathname: path } };

    if (gtagAvailable) {
        window.gtag = (...args) => calls.push(args);
    }

    vm.runInNewContext(analyticsSource, {
        document,
        Element: MockElement,
        window
    }, { filename: "js/analytics.js" });

    return { calls, handlers };
};

const english = createAnalyticsHarness({ lang: "en", path: "/product-request.html" });

assert(english.calls.length === 0, "Analytics fired during page load");

english.handlers.get("product_request_start")({ detail: { formId: "product-request-form" } });
english.handlers.get("product_request_submit")({ detail: { formId: "product-request-form" } });

assert(english.calls[0][0] === "event" && english.calls[0][1] === "product_request_start", "Start event was not forwarded");
assert(english.calls[1][0] === "event" && english.calls[1][1] === "product_request_submit", "Submit event was not forwarded");
assert(english.calls[0][2].form_id === "product-request-form", "Form ID parameter is missing");
assert(english.calls[0][2].page_path === "/product-request.html", "English page path is incorrect");
assert(english.calls[0][2].page_language === "en", "English language parameter is incorrect");

const emailCta = createContactCta({ email: true, text: "info@shalvadze.com" });
english.handlers.get("click")({ target: new MockElement(emailCta) });

const emailEvent = english.calls.at(-1);
assert(emailEvent[1] === "contact_click", "Email click was not tracked");
assert(emailEvent[2].contact_method === "email", "Email contact method is incorrect");
assert(emailEvent[2].link_text === "email_link", "Email address leaked into analytics link text");

const callCountBeforeNavigation = english.calls.length;
english.handlers.get("click")({ target: new MockElement(null) });
assert(english.calls.length === callCountBeforeNavigation, "Ordinary navigation was tracked as a contact click");

const unavailableGtag = createAnalyticsHarness({ gtagAvailable: false, lang: "en", path: "/" });
unavailableGtag.handlers.get("product_request_start")({ detail: { formId: "product-request-form" } });
assert(unavailableGtag.calls.length === 0, "Unavailable gtag did not fail safely");

const chinese = createAnalyticsHarness({ lang: "zh-Hans", path: "/zh/" });
const chatCta = createContactCta({ dataset: { contactAction: "chat" }, text: "开始沟通" });
chinese.handlers.get("click")({ target: new MockElement(chatCta) });

const chineseContactEvent = chinese.calls[0];
assert(chineseContactEvent[1] === "contact_click", "Chinese contact click was not tracked");
assert(chineseContactEvent[2].contact_method === "chat", "Chinese chat method is incorrect");
assert(chineseContactEvent[2].link_text === "开始沟通", "Chinese CTA label is incorrect");
assert(chineseContactEvent[2].page_language === "zh-Hans", "Chinese language parameter is incorrect");
assert(chineseContactEvent[2].page_path === "/zh/", "Chinese page path is incorrect");

const serializedCalls = JSON.stringify([...english.calls, ...chinese.calls]);
for (const forbiddenKey of ["customerName", "customerEmail", "companyName", "productName", "message", "targetPrice", "productPhotoName"]) {
    assert(!serializedCalls.includes(forbiddenKey), `PII/form field key found in analytics payload: ${forbiddenKey}`);
}

console.log("GA4 event bridge passed for English and Simplified Chinese.");
