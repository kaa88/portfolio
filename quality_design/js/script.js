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

// Top Menu
var burger = document.querySelector('.menu__burger');
var menu = document.querySelector('.menu__links');
burger.addEventListener('click', toggleMenuElement);
for (var i = 2; i < document.body.children.length; i++) {
	document.body.children[i].addEventListener('click', function() {
		burger.classList.remove('_active');
		menu.classList.remove('_visible');
	});
	// A click on any place except header will close menu
}
function toggleMenuElement() {
	burger.classList.toggle('_active');
	menu.classList.toggle('_visible');
}
//

// Selectors
var selectorLinks = document.querySelectorAll('.content__link, .portfolio__link');
var featuresItems = document.querySelectorAll('.features__item'); // for additional selector
var portfolioItems = document.querySelectorAll('.portfolio__img');
selectorLinkInit();
function selectorLinkInit(notThis) {
	for (var i = 0; i < selectorLinks.length; i++) {
		if (selectorLinks[i] == notThis) continue;
		selectorLinks[i].addEventListener('click', switchItems, {once:true});
	}
}
function switchItems() {
	var currentItemSet, transDuration;
	// modify links
	for (var i = 0; i < this.parentElement.children.length; i++) {
		this.parentElement.children[i].classList.remove('_active');
	}
	this.classList.add('_active');
	selectorLinkInit(this);
	// modify items
	if (this.classList.contains('content__link')) currentItemSet = featuresItems;
	else currentItemSet = portfolioItems;
	transDuration = Number(getComputedStyle(currentItemSet[0]).transitionDuration.slice(0,-1)) * 1000;
	hideItems(currentItemSet);
	setTimeout(showItems, transDuration, currentItemSet, this.dataset.group);
}
function hideItems(arr) {
	for (var i = 0; i < arr.length; i++) {
		arr[i].classList.remove('_visible');
	}
}
function showItems(arr, group) {
	var itemsToShow = [], itemsToHide = [];
	for (var i = 0; i < arr.length; i++) {
		if (group == 'all' || arr[i].dataset.group == group)
			itemsToShow.push(arr[i]);
		else
			itemsToHide.push(arr[i]);
	}
	if (browserInfo != 'IE') { // another experience in IE
		for (var i = 0; i < itemsToHide.length; i++) {
			itemsToHide[i].classList.add('_hidden');
		}
		for (var i = 0; i < itemsToShow.length; i++) {
			itemsToShow[i].classList.remove('_hidden');
		}
	}
	setTimeout(function() { // instant appearance fix
		for (var i = 0; i < itemsToShow.length; i++) {
			itemsToShow[i].classList.add('_visible');
		}
	}, 50);
}
//

// Swiper
const swiper = new Swiper('.swiper-container', {
	loop: true,
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	breakpoints: {
		0: {slidesPerView: 2, slidesPerColumn: 4},
		560: {slidesPerView: 3, slidesPerColumn: 1},
		720: {slidesPerView: 4},
		860: {slidesPerView: 5},
		1000: {slidesPerView: 6},
		1300: {slidesPerView: 8},
	},
});
//
