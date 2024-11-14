const container = document.querySelector('.cards');
const cards = document.querySelector('.cards');
const card = document.querySelectorAll('.card');

let isScrolling = false;
let scrollTimeout;
let cardWidth = card[0].offsetWidth + parseInt(getComputedStyle(card[0]).marginRight);

cards.addEventListener('wheel', (e) => {
    e.preventDefault();
    isScrolling = true;
    clearTimeout(scrollTimeout);
    cards.scrollBy({ left: e.deltaY * 5, behavior: 'smooth' });
    scrollTimeout = setTimeout(() => { isScrolling = false; }, 100);
});

cards.addEventListener('mousedown', (e) => {
    isScrolling = true;
    let startX = e.pageX;
    let scrollLeft = cards.scrollLeft;

    const onMouseMove = (e) => {
        let walk = (e.pageX - startX) * 2;
        cards.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
        isScrolling = false;
        cards.removeEventListener('mousemove', onMouseMove);
        cards.removeEventListener('mouseup', onMouseUp);
    };

    cards.addEventListener('mousemove', onMouseMove);
    cards.addEventListener('mouseup', onMouseUp);
});

cards.addEventListener('mouseleave', () => {
    isScrolling = false;
});



const raya = document.querySelector('.main_image');

let clickCount = 0;

raya.addEventListener('click', function() {
    clickCount++;

    if (clickCount === 10) {
        console.log("что то до ужаса знакомое...")
        if (raya.src == window.origin + "/img/raya.png") {
            raya.src = "/img/blood_raya.png"
            document.querySelector(".main__selection").classList.add("red")
            document.querySelector(".page_categories").classList.add("red")
        } else if (raya.src == window.origin + "/img/blood_raya.png") {
            raya.src = "/img/raya.png"
            document.querySelector(".main__selection").classList.remove("red")
            document.querySelector(".page_categories").classList.remove("red")
        }
        clickCount = 0;
    }
});