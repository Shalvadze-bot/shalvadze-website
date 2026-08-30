import { readFileSync } from "node:fs";
import vm from "node:vm";

const productRequestSource = readFileSync("js/product-request.js", "utf8");
const expectedEndpoint = "https://script.google.com/macros/s/AKfycbyIEQy_iecLD6obZ2zZ1vG59F1oAljMOSQKM4zkazLWx6r32_yBpxucQH3-X6d8cYID/exec";

const createClassList = () => {
    const classes = new Set();

    return {
        add: (...names) => names.forEach((name) => classes.add(name)),
        contains: (name) => classes.has(name),
        remove: (...names) => names.forEach((name) => classes.delete(name)),
        toggle: (name, force) => force ? classes.add(name) : classes.delete(name)
    };
};

const assert = (condition, message) => {
    if (!condition) {
        throw new Error(message);
    }
};

const testSubmission = async (lang, responseState = "success") => {
    const handlers = new Map();
    const analyticsEvents = [];
    const productReferenceInput = {
        addEventListener: () => {},
        files: responseState === "upload_error"
            ? [{ name: "oversized.png", size: (5 * 1024 * 1024) + 1, type: "image/png" }]
            : [],
        reportValidity() {
            this.wasReported = true;
        },
        setCustomValidity(message) {
            this.validationMessage = message;
        },
        validationMessage: "",
        wasReported: false
    };
    const productReferenceZone = {
        addEventListener: () => {},
        classList: createClassList()
    };
    const productReferenceTitle = { textContent: "" };
    const productReferenceMessage = { style: {}, textContent: "" };
    const urlError = { classList: createClassList(), textContent: "" };
    const urlInput = {
        addEventListener: () => {},
        classList: createClassList(),
        focus: () => {},
        setCustomValidity(message) {
            this.validationMessage = message;
        },
        validationMessage: "",
        value: "example.com/item"
    };
    const status = {
        classList: createClassList(),
        focus: () => {},
        textContent: ""
    };
    const submitButton = {
        attributes: new Map(),
        disabled: false,
        innerHTML: lang === "zh-Hans" ? "提交产品需求 <span>→</span>" : "SUBMIT PRODUCT REQUEST <span>→</span>",
        removeAttribute(name) {
            this.attributes.delete(name);
        },
        setAttribute(name, value) {
            this.attributes.set(name, value);
        },
        textContent: ""
    };
    const formValues = {
        companyName: "Example Company",
        customerEmail: "buyer@example.com",
        customerName: "Example Buyer",
        destination: "Hong Kong",
        message: "Sample request",
        productName: "Sample product",
        productUrl: "example.com/item",
        quantity: "500",
        targetPrice: "USD 2.50"
    };
    const elements = Object.fromEntries(
        Object.entries(formValues).map(([name, value]) => [name, { value }])
    );
    elements.productUrl = urlInput;
    const form = {
        addEventListener(name, handler) {
            handlers.set(name, handler);
        },
        checkValidity: () => true,
        dataset: {
            gaStartEvent: "product_request_start",
            gaSubmitEvent: "product_request_submit"
        },
        dispatchEvent(event) {
            analyticsEvents.push(event.type);
        },
        elements,
        id: "product-request-form",
        querySelectorAll: () => [],
        reportValidity: () => {},
        reset() {
            this.wasReset = true;
        },
        wasReset: false
    };
    const selectors = new Map([
        ["#product-request-form", form],
        ["#product-request-reference", productReferenceInput],
        ["[data-upload-zone]", productReferenceZone],
        ["[data-upload-title]", productReferenceTitle],
        ["#product-request-file-message", productReferenceMessage],
        ["#product-request-status", status],
        ["#product-request-submit", submitButton],
        ["#product-request-url", urlInput],
        ["#product-request-url-error", urlError]
    ]);
    let request;

    const context = {
        console: {
            ...console,
            error: responseState === "error" ? () => {} : console.error
        },
        CustomEvent: class {
            constructor(type, options) {
                this.type = type;
                this.detail = options.detail;
            }
        },
        document: {
            documentElement: { lang },
            querySelector: (selector) => selectors.get(selector)
        },
        fetch: async (endpoint, options) => {
            request = { endpoint, options };

            if (responseState === "error") {
                throw new Error("Simulated network failure");
            }

            return {
                headers: { get: () => "application/json" },
                json: async () => ({ success: true }),
                ok: true
            };
        },
        URL,
        URLSearchParams
    };

    vm.runInNewContext(productRequestSource, context, { filename: "js/product-request.js" });
    assert(analyticsEvents.length === 0, `${lang}: start event fired during page load`);
    handlers.get("focusin")();
    handlers.get("focusin")();
    assert(
        analyticsEvents.filter((eventName) => eventName === "product_request_start").length === 1,
        `${lang}: start event did not fire exactly once after interaction`
    );
    await handlers.get("submit")({ preventDefault: () => {} });

    if (responseState === "upload_error") {
        const expectedUploadError = lang === "zh-Hans"
            ? "请上传小于 5 MB 的图片。"
            : "Please upload an image smaller than 5 MB.";

        assert(!request, `${lang}: upload validation failure reached the backend`);
        assert(productReferenceInput.wasReported, `${lang}: upload validation was not reported`);
        assert(productReferenceMessage.textContent === expectedUploadError, `${lang}: upload error message is incorrect`);
        assert(!analyticsEvents.includes("product_request_submit"), `${lang}: upload failure dispatched submit analytics`);
        return;
    }

    const submittedData = request.options.body;
    const expectedSuccessMessage = lang === "zh-Hans"
        ? "感谢您。产品需求已成功提交。我们会审核您的需求并尽快与您联系。"
        : "Thank you. Your product request has been submitted successfully. We’ll review your request and get back to you.";
    const expectedErrorMessage = lang === "zh-Hans"
        ? "产品需求未能提交。请检查网络连接后重试。"
        : "We couldn’t submit your product request. Please check your connection and try again.";

    assert(request.endpoint === expectedEndpoint, `${lang}: endpoint changed`);
    assert(request.options.method === "POST", `${lang}: request method is not POST`);
    assert(submittedData.get("productName") === formValues.productName, `${lang}: product name missing from payload`);
    assert(submittedData.get("productUrl") === "https://example.com/item", `${lang}: URL was not normalized`);
    assert(submittedData.get("quantity") === formValues.quantity, `${lang}: quantity missing from payload`);
    assert(submittedData.get("customerEmail") === formValues.customerEmail, `${lang}: email missing from payload`);
    if (responseState === "success") {
        assert(status.textContent === expectedSuccessMessage, `${lang}: success message is incorrect`);
        assert(status.classList.contains("is-success"), `${lang}: success state was not applied`);
        assert(form.wasReset, `${lang}: form was not reset after success`);
        assert(analyticsEvents.includes("product_request_submit"), `${lang}: submit analytics event was not dispatched`);
        assert(
            analyticsEvents.filter((eventName) => eventName === "product_request_submit").length === 1,
            `${lang}: submit analytics event fired more than once`
        );
    } else {
        assert(status.textContent === expectedErrorMessage, `${lang}: error message is incorrect`);
        assert(status.classList.contains("is-error"), `${lang}: error state was not applied`);
        assert(!form.wasReset, `${lang}: failed submission reset the form`);
        assert(!analyticsEvents.includes("product_request_submit"), `${lang}: failed submission dispatched submit analytics`);
    }

    assert(!submitButton.disabled, `${lang}: submit button remained disabled`);
};

await testSubmission("en");
await testSubmission("zh-Hans");
await testSubmission("en", "error");
await testSubmission("zh-Hans", "error");
await testSubmission("en", "upload_error");
await testSubmission("zh-Hans", "upload_error");

console.log("Product request success/failure analytics gates passed in English and Simplified Chinese.");
