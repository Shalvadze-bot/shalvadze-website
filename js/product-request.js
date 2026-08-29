const productRequestForm = document.querySelector("#product-request-form");
const productReferenceInput = document.querySelector("#product-request-reference");
const productReferenceZone = document.querySelector("[data-upload-zone]");
const productReferenceTitle = document.querySelector("[data-upload-title]");
const productReferenceMessage = document.querySelector("#product-request-file-message");
const productRequestStatus = document.querySelector("#product-request-status");

const maximumReferenceSize = 10 * 1024 * 1024;
const acceptedReferenceTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf"
];

const announceReferenceFile = (file) => {
    if (!file) {
        productReferenceTitle.textContent = "Choose a file or drag it here";
        productReferenceMessage.textContent = "";
        productReferenceInput.setCustomValidity("");
        return true;
    }

    if (!acceptedReferenceTypes.includes(file.type)) {
        productReferenceTitle.textContent = "Choose a supported file";
        productReferenceMessage.textContent = "Please use JPG, PNG, WEBP, GIF or PDF.";
        productReferenceInput.setCustomValidity("Please choose a supported image or PDF file.");
        return false;
    }

    if (file.size > maximumReferenceSize) {
        productReferenceTitle.textContent = "Choose a smaller file";
        productReferenceMessage.textContent = "The selected file is larger than 10 MB.";
        productReferenceInput.setCustomValidity("Please choose a file that is no larger than 10 MB.");
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

if (productRequestForm && productRequestStatus) {
    let hasStarted = false;

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

    productRequestForm.addEventListener("submit", (event) => {
        event.preventDefault();
        productRequestStatus.classList.remove("is-visible");

        if (productReferenceInput && !announceReferenceFile(productReferenceInput.files[0])) {
            productReferenceInput.reportValidity();
            return;
        }

        if (!productRequestForm.checkValidity()) {
            productRequestForm.reportValidity();
            return;
        }

        dispatchAnalyticsHook(productRequestForm.dataset.gaSubmitEvent);
        productRequestStatus.innerHTML = "The form is ready for submission handling to be connected. To send your request now, email <a href=\"mailto:info@shalvadze.com\">info@shalvadze.com</a>.";
        productRequestStatus.classList.add("is-visible");
        productRequestStatus.focus({ preventScroll: true });
    });
}
