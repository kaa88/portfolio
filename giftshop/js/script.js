// Script file

// Internet Explorer support
var browserInfo = detect.parse(navigator.userAgent).browser.family;
if (browserInfo == 'IE') {
	var newCssLink = document.createElement('link');
	newCssLink.rel = 'stylesheet';
	newCssLink.href = 'css/ie.css';
	document.head.appendChild(newCssLink);
}
// /

// Media switcher
var mobileSwitchWidth = 768;

if (window.innerWidth <= mobileSwitchWidth)
	var mobileIsOn = true, prevMobileIsOn = true;
else
	var mobileIsOn = false, prevMobileIsOn = false;

function mobileSwitch() {
	if (window.innerWidth <= mobileSwitchWidth) mobileIsOn = true;
	else mobileIsOn = false;

	if (mobileIsOn != prevMobileIsOn) {
		menuCentering();
		footerListsResize();
	}
	prevMobileIsOn = mobileIsOn;
}
window.addEventListener('resize', mobileSwitch);
// /

// Menu
var menuBurger = document.querySelector('.header__burger');
var menuNavigation = document.querySelector('.navigation');
var menuLinks = document.querySelector('.menu');
// next variables are for smooth menu toggle with css-overflow:hidden
var scrollbarWidth = window.innerWidth - document.body.offsetWidth;
var baseBodyPadding = getComputedStyle(document.body).paddingRight;
var baseBurgerMargin = getComputedStyle(menuBurger).marginRight;
var baseNavigationPadding = getComputedStyle(menuNavigation).paddingRight;
var baseLinksPadding = getComputedStyle(menuLinks).paddingRight;

menuBurger.addEventListener('click', toggleMenu);

function toggleMenu() {
	menuBurger.children[0].classList.toggle('icon-menu');
	menuBurger.children[0].classList.toggle('icon-cross');
	menuNavigation.classList.toggle('_visible');
	menuLinks.classList.toggle('_visible');
	if (document.body.classList.contains('_locked')) {
		document.body.style.paddingRight = baseBodyPadding;
		menuBurger.style.marginRight = baseBurgerMargin;
		menuNavigation.style.paddingRight = baseNavigationPadding;
		menuLinks.style.paddingRight = baseLinksPadding;
	}
	else {
		document.body.style.paddingRight = scrollbarWidth + 'px';
		menuBurger.style.marginRight = scrollbarWidth + 'px';
		menuNavigation.style.paddingRight = scrollbarWidth + 'px';
		menuLinks.style.paddingRight = scrollbarWidth + 'px';
	}
	document.body.classList.toggle('_locked');
}
// menu centering
menuCentering();
function menuCentering() {
	if (mobileIsOn == true) {
		menuNavigation.style.paddingLeft = Number(getComputedStyle(menuNavigation).paddingLeft.slice(0,-2)) + scrollbarWidth + 'px';
		menuLinks.style.paddingLeft = Number(getComputedStyle(menuLinks).paddingLeft.slice(0,-2)) + scrollbarWidth + 'px';
	}
	else {
		if (menuLinks.classList.contains('_visible')) toggleMenu(); // toggle menu on media switch
		menuNavigation.removeAttribute('style');
		menuLinks.removeAttribute('style');
	}
}
// /

// User-block sticky position
var header = document.querySelector('.header');
var headerUserBlock = document.querySelector('.user-block');
window.addEventListener('scroll', stickyCheck);
stickyCheck();

function stickyCheck() {
	if (window.innerWidth > mobileSwitchWidth) return;
	if (pageYOffset > (header.offsetHeight - headerUserBlock.offsetHeight))
		headerUserBlock.classList.add('_sticky');
	else
		headerUserBlock.classList.remove('_sticky');
}
// /

// Search placeholder (multicolor)
var searchInput = document.querySelector('.search__input');
var searchPlaceholder = document.querySelector('.search__placeholder');
searchInput.addEventListener('input', placeholderCheck);

function placeholderCheck() {
	if (searchInput.value != '') searchPlaceholder.classList.add('_hidden');
	else searchPlaceholder.classList.remove('_hidden');
}
// /

// Swiper
if (browserInfo != 'IE') {
	const swiper1 = new Swiper('.new-products__swiper-container', {
		slidesPerView: 1,
		loop: true,
		loopedSlides: 3,
		spaceBetween: 30,
		freeMode: true,
		navigation: {
			nextEl: '.new-products__swiper-button-next',
			prevEl: '.new-products__swiper-button-prev',
		},
		breakpoints: {
			370: {slidesPerView: 'auto'},
		},
		autoplay: {
			delay: 5000,
		},
	});
	const swiper2 = new Swiper('.featured-products__swiper-container', {
		slidesPerView: 'auto',
		loop: true,
		loopedSlides: 4,
		spaceBetween: 15,
		freeMode: true,
		navigation: {
			nextEl: '.featured-products__swiper-button-next',
			prevEl: '.featured-products__swiper-button-prev',
		},
		breakpoints: {
			769: {spaceBetween: 30},
		},
	});
}
// /

// Footer wrappers
var footerLists = document.querySelectorAll('.foot-links-list');
var footerListsHeights = {header: [], list: []};

for (var i = 0; i < footerLists.length; i++) {
	footerLists[i].addEventListener('click', showFooterList);
	footerListsHeights.header[i] = footerLists[i].querySelector('.foot-header').offsetHeight;
	footerListsHeights.list[i] = footerLists[i].querySelector('.foot-links-list__list').offsetHeight;
	if (mobileIsOn == true)
		footerLists[i].style.height = footerListsHeights.header[i] + 'px';
}

function footerListsResize() {
	for (var i = 0; i < footerLists.length; i++) {
		if (mobileIsOn == true)
			footerLists[i].style.height = footerListsHeights.header[i] + 'px';
		else
			footerLists[i].removeAttribute('style');
	}
}
function showFooterList() {
	if (mobileIsOn == false) return;
	for (var i = 0; i < footerLists.length; i++) {
		if (footerLists[i] == this)
			footerLists[i].style.height = footerListsHeights.header[i] + footerListsHeights.list[i] + 'px';
		else
			footerLists[i].style.height = footerListsHeights.header[i] + 'px';
	}
}
// /
