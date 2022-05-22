// If not Internet Explorer.
var agentInfo = detect.parse(navigator.userAgent).browser.family;
if (agentInfo != 'IE') {
	var ieLink = document.querySelector('link[href$="ie.css"]');
	ieLink.parentElement.removeChild(ieLink);
	logoInnerShadow();
}
function logoInnerShadow() {
	var logo = document.querySelector('.header__logo');
	logo.style.color = 'transparent';
	logo.style.webkitBackgroundClip = 'text';
	logo.style.mozBackgroundClip = 'text';
	logo.style.backgroundClip = 'text';
	logo.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
	logo.style.textShadow = '0.5px 0.9px 2px #394045, 1px 1.4px 1px rgba(255, 255, 255, 0.36)';
}

// <Slider>
var timer;
var radio = document.querySelectorAll('.slider__radio');
var dots = document.querySelectorAll('.dot-box__item');
var slides = document.querySelectorAll('.slide');

// If JS is off, radio-buttons will work. Else remove them.
if (slides.length > 0) {
	for (var i = 0; i < radio.length; i++) {
		radio[i].parentElement.removeChild(radio[i]);
	}
	dots[0].classList.add('dot-box__item--active');
	slides[0].classList.add('slide--visible');
	for (var i = 0; i < dots.length; i++) {
		dots[i].addEventListener('click', switchSlide);
	}
	newTimer();
}
// Functions
function newTimer() {
	clearInterval(timer);
	timer = setInterval(switchSlide, 5000, 'next');
}
function switchSlide(arg) {
	var num = 0;
	for (var i = 0; i < dots.length; i++) {
		if (dots[i].classList.contains('dot-box__item--active')) {
			num = i + 1;
		}
		dots[i].classList.remove('dot-box__item--active');
		slides[i].classList.remove('slide--visible');
	}
	switch(arg) {
		case 'next':
			if (num == dots.length) num = 1;
			else num++;
			break;
		case 'prev':
			if (num == 1) num = dots.length;
			else num--;
			break;
		default:
			num = this.id.slice(-1);
			break;
	}
	document.getElementById('sli-dot-' + num).classList.add('dot-box__item--active');
	document.getElementById('slide-' + num).classList.add('slide--visible');
	newTimer();
}
// </Slider>

// <No link to this page>
var inactiveLinks = document.querySelectorAll('.this-page, .this-link');
for (var i = 0; i < inactiveLinks.length; i++) {
	inactiveLinks[i].addEventListener('click', () => {event.preventDefault()});
}
// </No link to this page>