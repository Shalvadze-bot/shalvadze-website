const languagePreferenceKey = "shalvadze-language";
const languageLinks = Array.from(document.querySelectorAll("[data-language]"));
const currentLanguage = document.documentElement.lang === "zh-Hans" ? "zh" : "en";

languageLinks.forEach((link) => {
    const targetLanguage = link.dataset.language;

    if (targetLanguage !== currentLanguage && window.location.hash) {
        const targetUrl = new URL(link.href, window.location.href);
        targetUrl.hash = window.location.hash;
        link.href = targetUrl.href;
    }

    link.addEventListener("click", () => {
        try {
            window.localStorage.setItem(languagePreferenceKey, targetLanguage);
        } catch (error) {
            // Navigation still works when browser storage is unavailable.
        }
    });
});

try {
    const savedLanguage = window.localStorage.getItem(languagePreferenceKey);
    const isEnglishHomepage = currentLanguage === "en"
        && (window.location.pathname === "/" || window.location.pathname.endsWith("/index.html"));

    if (savedLanguage === "zh" && isEnglishHomepage) {
        const chineseLink = languageLinks.find((link) => link.dataset.language === "zh");

        if (chineseLink) {
            window.location.replace(chineseLink.href);
        }
    }
} catch (error) {
    // English remains the default when browser storage is unavailable.
}
