function collapse() {
    if (document.querySelector(".icon").classList.contains("active")) {
        document.querySelector(".collapse").style.left = '-100%';
        document.querySelector(".icon").classList.remove("active")
    } else {
        document.querySelector(".collapse").style.left = '0';
        document.querySelector(".icon").classList.add("active")
    }
    
}

if (document.querySelector(".user")) {
    document.querySelector(".user_collapse > #logout").href = `/logout?param=${window.location.pathname.slice(1)}`;
    function toggleMenuUser() {
        const userMenu = document.querySelector(".user_collapse");
        const userButton = document.querySelector(".user");
    
        if (userMenu.style.display === "block") {
            closeMenuUser();
        } else {
            openMenuUser();
        }
        document.addEventListener("click", function(event) {
            if (!userMenu.contains(event.target) && !userButton.contains(event.target)) {
                closeMenuUser();
            }
        });
    }
    function openMenuUser() {
        const userMenu = document.querySelector(".user_collapse");
        userMenu.style.display = "block";
        setTimeout(() => {
            userMenu.style.opacity = 1;
        }, 100);
    }
    function closeMenuUser() {
        const userMenu = document.querySelector(".user_collapse");
        userMenu.style.opacity = 0;
        setTimeout(() => {
            userMenu.style.display = "none";
        }, 100);
    }
    document.querySelector(".user").addEventListener("click", function(event) {
        event.stopPropagation();
        toggleMenuUser();
    });
}



if (window.location.pathname != '/') {
    document.querySelector(".login_form.register > form").action = `/register?param=${window.location.pathname.slice(1)}`;
    document.querySelector(".login_form > form").action = `/login?param=${window.location.pathname.slice(1)}`;
}


if (document.querySelector("#open_collapse_login")) {
    
    const form_login = document.querySelector(".login_form > form")
    form_login.querySelector(".close").addEventListener("click", function () {
        document.querySelector(".overflow").style.opacity = 0;
        document.body.style.overflow = 'visible'
        setTimeout(() => {
            document.querySelector(".overflow").style.display = "none";
        }, 300);
    },false,);
    
    const form_login_register = document.querySelector(".login_form.register > form")
    form_login_register.querySelector(".close").addEventListener("click", function () {
        document.querySelector(".overflow").style.opacity = 0;
        document.body.style.overflow = 'visible'
        setTimeout(() => {
            document.querySelector(".overflow").style.display = "none";
            document.querySelector("#login").style.left = "0px";
            document.querySelector("#register_form").style.left = "500px";
        }, 300);
    },false,);
    
    form_login.querySelector(".buttons > #register").addEventListener("click", function () {
        document.querySelector("#login").style.left = "-500px";
        document.querySelector("#register_form").style.left = "0px";
    },false,);
    
    form_login_register.querySelector(".back").addEventListener("click", function () {
        document.querySelector("#login").style.left = "0px";
        document.querySelector("#register_form").style.left = "500px";
    },false,);
    
    function login_button(){
        document.querySelector(".overflow").style.display = 'flex';
        document.body.style.overflow = 'hidden'
        setTimeout(() => {
            document.querySelector(".overflow").style.opacity = 1;
        }, 100);
    }
    
    
    
    
    document.querySelector("#login_submit").addEventListener("click", function () {
       document.querySelector(".loader").style.display = 'flex'
       setTimeout(() => {
            document.querySelector(".loader").style.opacity = 1;
            setTimeout(() => {
                document.querySelector(".login_form > form").submit();
            }, 2500);
       }, 300); 
    });
    document.querySelector("#register_submit").addEventListener("click", function () {
       document.querySelector(".loader.reg").style.display = 'flex'
       setTimeout(() => {
            document.querySelector(".loader.reg").style.opacity = 1;
            setTimeout(() => {
                document.querySelector(".login_form.register > form").submit();
            }, 2500);
       }, 300); 
    });
}