// Preserve existing category deep links, including Back/Forward navigation.
(() => {
    const index = document.querySelector('.category-index');
    if (!index) return;
    const revealCategory = () => {
        const category = [...index.querySelectorAll('details[id]')]
            .find((item) => `#${item.id}` === window.location.hash);
        if (!category) return;
        category.open = true;
        window.requestAnimationFrame(() => category.scrollIntoView({ behavior: 'instant', block: 'start' }));
    };
    window.addEventListener('hashchange', revealCategory);
    revealCategory();
})();
