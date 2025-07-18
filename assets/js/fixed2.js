(function(){
    let navbar = document.getElementById('navbar');
    let main = document.querySelector('main');
    let navbarHeight = navbar.offsetHeight; // Get the height of the navbar
    let breakpoint = main.offsetTop - navbarHeight;
    let isFixed = false;

    function onScroll() {

        // windowPos =  window.scrollY;

        if (window.scrollY >= breakpoint && !isFixed) {

            navbar.classList.remove('open');

            navbar.classList.add('navbar-fixed');
            main.style.paddingTop = navbarHeight + 'px'; // Adjust main padding to avoid content jump
            isFixed = true; // Set the flag to true when navbar is fixed

        } else if (window.scrollY < breakpoint && isFixed) {
            navbar.classList.remove('navbar-fixed');
            main.style.paddingTop = '0px'; // Reset main padding when navbar is not fixed
            isFixed = false; // Reset the flag when navbar is not fixed
        }
    }
   
    document.addEventListener('scroll', onScroll);
        
})();