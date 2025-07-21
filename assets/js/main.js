(function () {
    const nav = document.getElementById('navbar');
    const button = document.getElementById('burger');

    button.addEventListener('click', () => {
        nav.classList.toggle('open');
    });
})();

