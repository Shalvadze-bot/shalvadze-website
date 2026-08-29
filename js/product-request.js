const productRequestForm = document.querySelector("#product-request-form");
const productReferenceInput = document.querySelector("#product-request-reference");
const productReferenceZone = document.querySelector("[data-upload-zone]");
const productReferenceTitle = document.querySelector("[data-upload-title]");
const productReferenceMessage = document.querySelector("#product-request-file-message");
const productRequestStatus = document.querySelector("#product-request-status");
const productRequestSubmitButton = document.querySelector("#product-request-submit");
const productUrlInput = document.querySelector("#product-request-url");
const productUrlError = document.querySelector("#product-request-url-error");

const productRequestEndpoint = "https://script.google.com/macros/s/AKfycbyIEQy_iecLD6obZ2zZ1vG59F1oAljMOSQKM4zkazLWx6r32_yBpxucQH3-X6d8cYID/exec";
const invalidProductUrlMessage = "Please enter a valid product link or leave this field empty.";

const normalizeProductUrl = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        return "";
    }

    const valueWithProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedValue)
        ? trimmedValue
        : `https://${trimmedValue}`;

    try {
        const normalizedUrl = new URL(valueWithProtocol);
        const hasSupportedProtocol = normalizedUrl.protocol === "http:" || normalizedUrl.protocol === "https:";
        const hostnameLabels = normalizedUrl.hostname.split(".");
        const hasReasonableHostname = hostnameLabels.length > 1
            && hostnameLabels.every((label) => /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i.test(label));

        if (!hasSupportedProtocol || !hasReasonableHostname) {
            return null;
        }

        return normalizedUrl.href;
    } catch (error) {
        return null;
    }
};

const normalizeAndValidateProductUrl = () => {
    const normalizedUrl = normalizeProductUrl(productUrlInput.value);
    const isValid = normalizedUrl !== null;

    productUrlInput.setCustomValidity(isValid ? "" : invalidProductUrlMessage);
    productUrlError.textContent = isValid ? "" : invalidProductUrlMessage;
    productUrlError.classList.toggle("is-visible", !isValid);

    if (isValid) {
        productUrlInput.value = normalizedUrl;
    }

    return isValid;
};

const maximumReferenceSize = 5 * 1024 * 1024;
const acceptedReferenceTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
];
const referenceTypeByExtension = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp"
};

const getReferenceMimeType = (file) => {
    if (acceptedReferenceTypes.includes(file.type)) {
        return file.type;
    }

    if (file.type) {
        return null;
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    return referenceTypeByExtension[fileExtension] || null;
};

const readReferenceFileAsBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => {
        if (typeof reader.result !== "string" || !reader.result.includes(",")) {
            reject(new Error("The selected image could not be encoded."));
            return;
        }

        resolve(reader.result.slice(reader.result.indexOf(",") + 1));
    });
    reader.addEventListener("error", () => reject(new Error("The selected image could not be read.")));
    reader.addEventListener("abort", () => reject(new Error("Reading the selected image was cancelled.")));
    reader.readAsDataURL(file);
});

const announceReferenceFile = (file) => {
    if (!file) {
        productReferenceTitle.textContent = "Choose a file or drag it here";
        productReferenceMessage.textContent = "";
        productReferenceInput.setCustomValidity("");
        return true;
    }

    if (!getReferenceMimeType(file)) {
        productReferenceTitle.textContent = "Choose a supported file";
        productReferenceMessage.textContent = "Please upload a JPG, PNG or WEBP image.";
        productReferenceInput.setCustomValidity("Please upload a JPG, PNG or WEBP image.");
        return false;
    }

    if (file.size > maximumReferenceSize) {
        productReferenceTitle.textContent = "Choose a smaller file";
        productReferenceMessage.textContent = "Please upload an image smaller than 5 MB.";
        productReferenceInput.setCustomValidity("Please upload an image smaller than 5 MB.");
        return false;
    }

    productReferenceTitle.textContent = file.name;
    productReferenceMessage.textContent = "File selected.";
    productReferenceMessage.style.color = "#555";
    productReferenceInput.setCustomValidity("");
    return true;
};

if (productReferenceInput && productReferenceZone && productReferenceTitle && productReferenceMessage) {
    productReferenceInput.addEventListener("change", () => {
        productReferenceMessage.style.color = "";
        announceReferenceFile(productReferenceInput.files[0]);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
        productReferenceZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            productReferenceZone.classList.add("is-dragging");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        productReferenceZone.addEventListener(eventName, (event) => {
            event.preventDefault();
            productReferenceZone.classList.remove("is-dragging");
        });
    });

    productReferenceZone.addEventListener("drop", (event) => {
        const file = event.dataTransfer.files[0];

        if (!file) {
            return;
        }

        const transfer = new DataTransfer();
        transfer.items.add(file);
        productReferenceInput.files = transfer.files;
        productReferenceMessage.style.color = "";
        announceReferenceFile(file);
    });
}

if (productUrlInput && productUrlError) {
    productUrlInput.addEventListener("input", () => {
        productUrlInput.setCustomValidity("");
        productUrlError.textContent = "";
        productUrlError.classList.remove("is-visible");
    });

    productUrlInput.addEventListener("blur", normalizeAndValidateProductUrl);
}

if (productRequestForm && productRequestStatus && productRequestSubmitButton && productUrlInput && productUrlError) {
    let hasStarted = false;
    let isSubmitting = false;
    const submitButtonContent = productRequestSubmitButton.innerHTML;

    const dispatchAnalyticsHook = (eventName) => {
        productRequestForm.dispatchEvent(new CustomEvent(eventName, {
            bubbles: true,
            detail: {
                formId: productRequestForm.id
            }
        }));
    };

    const markProductRequestStarted = () => {
        if (hasStarted) {
            return;
        }

        hasStarted = true;
        dispatchAnalyticsHook(productRequestForm.dataset.gaStartEvent);
    };

    productRequestForm.addEventListener("focusin", markProductRequestStarted);
    productRequestForm.addEventListener("input", markProductRequestStarted);

    const showSubmissionStatus = (message, state) => {
        productRequestStatus.textContent = message;
        productRequestStatus.classList.remove("is-error", "is-success");
        productRequestStatus.classList.add("is-visible", state);
        productRequestStatus.focus({ preventScroll: true });
    };

    productRequestForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        productRequestStatus.classList.remove("is-visible", "is-error", "is-success");

        if (isSubmitting) {
            return;
        }

        if (productReferenceInput && !announceReferenceFile(productReferenceInput.files[0])) {
            productReferenceInput.reportValidity();
            return;
        }

        const isProductUrlValid = normalizeAndValidateProductUrl();

        if (!productRequestForm.checkValidity()) {
            productRequestForm.reportValidity();

            if (!isProductUrlValid) {
                productUrlInput.focus();
            }

            return;
        }

        const submissionData = new URLSearchParams({
            productName: productRequestForm.elements.productName.value.trim(),
            productUrl: productRequestForm.elements.productUrl.value.trim(),
            quantity: productRequestForm.elements.quantity.value.trim(),
            targetPrice: productRequestForm.elements.targetPrice.value.trim(),
            destination: productRequestForm.elements.destination.value.trim(),
            customerName: productRequestForm.elements.customerName.value.trim(),
            customerEmail: productRequestForm.elements.customerEmail.value.trim(),
            companyName: productRequestForm.elements.companyName.value.trim(),
            message: productRequestForm.elements.message.value.trim()
        });

        isSubmitting = true;
        productRequestSubmitButton.disabled = true;
        productRequestSubmitButton.setAttribute("aria-busy", "true");
        productRequestSubmitButton.textContent = "SUBMITTING…";

        try {
            const selectedReferenceFile = productReferenceInput?.files[0];

            if (selectedReferenceFile) {
                const productPhoto = await readReferenceFileAsBase64(selectedReferenceFile);

                submissionData.set("productPhoto", productPhoto);
                submissionData.set("productPhotoName", selectedReferenceFile.name);
                submissionData.set("productPhotoType", getReferenceMimeType(selectedReferenceFile));
            }

            const response = await fetch(productRequestEndpoint, {
                method: "POST",
                body: submissionData,
                redirect: "follow"
            });

            if (!response.ok) {
                throw new Error(`Product request submission failed with status ${response.status}.`);
            }

            const responseContentType = response.headers.get("content-type") || "";

            if (responseContentType.includes("application/json")) {
                const responseData = await response.json();

                if (responseData.success === false || responseData.status === "error") {
                    throw new Error(responseData.message || "The Apps Script endpoint reported an error.");
                }
            }

            dispatchAnalyticsHook(productRequestForm.dataset.gaSubmitEvent);
            showSubmissionStatus(
                "Thank you. Your product request has been submitted successfully. We’ll review your request and get back to you.",
                "is-success"
            );
            productRequestForm.reset();
            hasStarted = false;

            if (productReferenceInput) {
                productReferenceMessage.style.color = "";
                announceReferenceFile();
            }
        } catch (error) {
            console.error("Product request submission error:", error);
            showSubmissionStatus(
                "We couldn’t submit your product request. Please check your connection and try again.",
                "is-error"
            );
        } finally {
            isSubmitting = false;
            productRequestSubmitButton.disabled = false;
            productRequestSubmitButton.removeAttribute("aria-busy");
            productRequestSubmitButton.innerHTML = submitButtonContent;
        }
    });
}
