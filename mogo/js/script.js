// Script file

// Internet Explorer support
var browserInfo = detect.parse(navigator.userAgent).browser.family;
if (browserInfo == 'IE') {
	var newCssLink = document.createElement('link');
	newCssLink.rel = 'stylesheet';
	newCssLink.href = 'css/ie.css';
	document.head.appendChild(newCssLink);
}
//

// Top menu
var menuElements = {links: {}, cart: {}, search: {}};
menuElements.links.btn = document.querySelector('.menu__burger');
menuElements.links.elem = document.querySelector('.menu__links');
menuElements.cart.btn = document.querySelector('#cart-btn');
menuElements.cart.elem = document.querySelector('.cart');
menuElements.search.btn = document.querySelector('#search-btn');
menuElements.search.elem = document.querySelector('.search');
for (var i = 2; i < document.body.children.length; i++) {
	document.body.children[i].addEventListener('click', toggleMenuElement);
	// A click on any place except main screen will close menu
}
function toggleMenuElement(initiator) {
	for (var name in menuElements) {
		if (name == initiator) continue;
		menuElements[name].btn.classList.remove('_active');
		menuElements[name].elem.classList.remove('_visible');
	}
	if (typeof initiator == 'string') {
		menuElements[initiator].btn.classList.toggle('_active');
		menuElements[initiator].elem.classList.toggle('_visible');
	}
}
//

// Scroll nav
var scrollTargets = document.querySelectorAll('.banner, .about, .skills, .team, .map');
var scrollTargetHeights, scrollIndex, scrollDist = [];
var scrollNav = document.querySelector('.banner__bottom');
var scrollLines = document.querySelectorAll('.scroll-nav__line-inner');
var scrollNavLineIn, scrollCurrentTarget;
window.addEventListener('load', scrollInit);
window.addEventListener('resize', scrollInit);

function scrollInit() {
	scrollTargetHeights = new Array;
	scrollTargetHeights[0] = -20;
	scrollIndex = 1;
	for (var i = 0; i < document.body.children.length; i++) {
		if (document.body.children[i].classList.contains('skills') ||
			 document.body.children[i].classList.contains('team') ||
			 document.body.children[i].classList.contains('map')) {
				scrollIndex++;
		}
		if (!scrollTargetHeights[scrollIndex]) {
			scrollTargetHeights[scrollIndex] = scrollTargetHeights[scrollIndex - 1];
		}
		scrollTargetHeights[scrollIndex] += document.body.children[i].offsetHeight;
	}
	for (var i = 1; i < scrollTargetHeights.length; i++) {
		scrollDist[i - 1] = scrollTargetHeights[i] - scrollTargetHeights[i - 1];
	}
	scrollPosition();
	window.addEventListener('scroll', scrollPosition);
}
function scrollPosition() {
	if (pageYOffset >= window.innerHeight)
		scrollNav.classList.add('_sticky');
	else
		scrollNav.classList.remove('_sticky');
	for (var i = 0; i < scrollTargetHeights.length; i++) {
		if (pageYOffset < scrollTargetHeights[i]) {
			scrollCurrentTarget = i - 1;
			break;
		}
	}
	for (var i = 0; i < scrollLines.length; i++) {
		if (i == scrollCurrentTarget)
			scrollLines[i].classList.add('_in-view');
		else
			scrollLines[i].classList.remove('_in-view');
	}
	scrollNavLineIn = document.querySelector('._in-view');
	scrollNavLineIn.style.left = (pageYOffset - scrollTargetHeights[scrollCurrentTarget]) / scrollDist[scrollCurrentTarget] * 75 + '%';
}
function scrollToTarget(position) {
	scrollTargets[position].scrollIntoView({behavior: 'smooth'});
}
//

// Quotes
var sliders = document.querySelectorAll('.quote__slider');
var slides = [];
for (var i = 0; i < sliders.length; i++) {
	slides[i] = sliders[i].querySelectorAll('.quote__slide');
	if (slides[i].length == 2) {
		for (var j = 0; j < slides[i].length; j++) {
			slides[i][j].parentElement.appendChild(slides[i][j].cloneNode(true));
		}
		slides[i] = sliders[i].querySelectorAll('.quote__slide');
	}
	for (var k = 0; k < slides[i].length; k++) {
		switch(k) {
			case 0:
				slides[i][k].classList.add('_visible');
				break;
			case slides[i].length-1:
				slides[i][k].classList.add('_left');
				break;
			default:
				slides[i][k].classList.add('_right');
				break;
		}
	}
}
// Quote arrows
var arrows = [];
for (var i = 0; i < sliders.length; i++) {
	arrows[i] = new Object();
	arrows[i].left = sliders[i].querySelector('.quote__arr-left-in');
	arrows[i].right = sliders[i].querySelector('.quote__arr-right-in');
	if (slides[i].length > 1) {
		arrows[i].left.addEventListener('click', function(){slide(this, 'left');});
		arrows[i].right.addEventListener('click', function(){slide(this, 'right');});
		for (var elem in arrows[i]) {
			arrows[i][elem].style.opacity = '1';
			arrows[i][elem].style.cursor = 'pointer';
		}
	}
}
function slide(this_elem, side) {
	var thisQuoteSlides = this_elem.parentElement.parentElement.querySelectorAll('.quote__slide');
	var classes = [];
	for (var i = 0; i < thisQuoteSlides.length; i++) {
		classes[i] = thisQuoteSlides[i].className;
	}
	if (side == 'left') {
		for (var i = 0; i < thisQuoteSlides.length; i++) {
			if (i == thisQuoteSlides.length - 1) thisQuoteSlides[i].className = classes[0];
			else thisQuoteSlides[i].className = classes[i + 1];
		}
	}
	if (side == 'right') {
		for (var i = 0; i < thisQuoteSlides.length; i++) {
			if (i == 0) thisQuoteSlides[i].className = classes[thisQuoteSlides.length - 1];
			else thisQuoteSlides[i].className = classes[i - 1];
		}
	}
}
//
