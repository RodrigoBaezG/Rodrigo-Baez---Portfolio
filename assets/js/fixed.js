(function () {
    'use strict';

    const navbar = document.querySelector('#navbar');
    const main = document.querySelector('main');
    const navbarHeight = navbar.getBoundingClientRect().height;
    const breakpoint = main.offsetTop - navbarHeight;
    let isFixed = false;

    function onScroll() {
        const scrolled = window.scrollY >= breakpoint;

        if (scrolled && !isFixed) {
            navbar.classList.remove('open');
            navbar.classList.add('navbar-fixed');
            main.style.marginTop = navbarHeight + 'px';
            isFixed = true;
        } else if (!scrolled && isFixed) {
            navbar.classList.remove('navbar-fixed');
            main.style.marginTop = '0';
            isFixed = false;
        }
    }

    document.addEventListener('scroll', onScroll, { passive: true });

})();
