// Script file

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
		hideEverything();
	}
	prevMobileIsOn = mobileIsOn;
}
window.addEventListener('resize', mobileSwitch);

function hideEverything() {
	if (menu.classList.contains('_active')) 
		toggleMenu();
	initSearchField();
	hidePopup();
}
// /

// Search field
var searchBtn = document.querySelector('.header__search i');
var searchInput = document.querySelector('.header__search-input-box');
initSearchField();

function initSearchField() { // or remove
	searchBtn.removeEventListener('click', searchFunc);
	searchBtn.addEventListener('click', showSearchField, {once: true});
	searchBtn.classList.remove('_active');
	searchInput.classList.remove('_active');
}

function showSearchField() {
	searchBtn.addEventListener('click', searchFunc);
	searchBtn.classList.add('_active');
	searchInput.classList.add('_active');
	setTimeout(function(){
		searchInput.querySelector('input').addEventListener('keydown', searchFuncKeyCheck);
		searchInput.querySelector('input').focus();
	}, 200);
}
function searchFuncKeyCheck(event) {
	if (event.code == 'Enter')
		searchFunc();
}
function searchFunc() {
	alert('Search event'); // search func unfinished
	searchBtn.removeEventListener('click', searchFunc);
}
// /

// Top Menu
var menu = document.querySelector('.menu');
var menuBurger = document.querySelector('.header__menu-burger');
menuBurger.addEventListener('click', toggleMenu);

function toggleMenu() {
	menuBurger.classList.toggle('_active');
	menu.classList.toggle('_active');
	scrollLock();
}
// /

// Scroll Lock
var scrollbarWidth = window.innerWidth - document.body.offsetWidth;
var lock = false;
var lockerObj = {
	body: {
		elem: document.body,
		basepad: Number(getComputedStyle(document.body).paddingRight.slice(0,-2))
	},
	header: {
		elem: document.querySelector('.header'),
		basepad: Number(getComputedStyle(document.querySelector('.header')).paddingRight.slice(0,-2))
	},
	search: {
		elem: document.querySelector('.header__search-input-box'),
		basepad: Number(getComputedStyle(document.querySelector('.header__search-input-box')).paddingRight.slice(0,-2))
	},
	menu: {
		elem: document.querySelector('.menu'),
		basepad: Number(getComputedStyle(document.querySelector('.menu')).paddingRight.slice(0,-2))
	},
};

function scrollLock() {
	// this code prevents adding a padding to search-bar if it's not necessary
	if (getComputedStyle(lockerObj.search.elem).position == 'fixed')
		var applyPaddingToSearchElem = true;
	else
		var applyPaddingToSearchElem = false;
	// /

	if (lock == false) {
		for (var x in lockerObj) {
			if (x == 'search' && applyPaddingToSearchElem == false) continue; // and this
			lockerObj[x].elem.style.paddingRight = lockerObj[x].basepad + scrollbarWidth + 'px';
		}
		lockerObj.body.elem.classList.add('_locked');
		lock = true;
	}
	else {
		for (var x in lockerObj) {
			lockerObj[x].elem.style.paddingRight = lockerObj[x].basepad + 'px';
		}
		lockerObj.body.elem.classList.remove('_locked');
		lock = false;
	}
}
// /

// Top Slider
var slides = document.querySelectorAll('.slide');
var pagination = document.querySelectorAll('.pagination__item');
var paginationLine = document.querySelector('.pagination__line');
var paginationLineInner = document.querySelector('.pagination__line-inner');
var paginationLinePositions = [], paginationLineCurrentPosition = 0;
var timerID;

for (var i = 0; i < pagination.length; i++) {
	pagination[i].addEventListener('click', switchSlide);
}
window.addEventListener('resize', paginationLineInit);
paginationLineInit();

function paginationLineInit() {
	for (var i = 0; i < pagination.length; i++) {
		paginationLinePositions[i] = 0 + (1 / pagination.length * i) * paginationLine.clientWidth + 4 + 'px';
	}
	movePaginationLine();
}

function movePaginationLine() {
	paginationLineInner.style.left = paginationLinePositions[paginationLineCurrentPosition];
}

function switchSlide(event, slideNum) {
	if (!slideNum && this.classList.contains('_active')) return;
	for (var i = 0; i < pagination.length; i++) {
		pagination[i].classList.remove('_active');
		slides[i].classList.remove('_active');
	}
	if (!slideNum) {
		this.classList.add('_active');
		clearInterval(timerID);
	}
	else
		pagination[slideNum - 1].classList.add('_active');

	for (var i = 0; i < pagination.length; i++) {
		if (pagination[i].classList.contains('_active')) {
			paginationLineCurrentPosition = i;
			movePaginationLine();
			setTimeout(function(){slides[i].classList.add('_active');}, 100);
			break; // prevent timeout break
		}
	}
}
function intervalSwitch() {
	timerID = setInterval(function(){
		var slideNum;
		for (var i = 1; i <= pagination.length; i++) {
			if (pagination[i - 1].classList.contains('_active')) {
				if (i == pagination.length)
					slideNum = 1;
				else
					slideNum = i + 1;
				break;
			}
		}
		switchSlide(0, slideNum);
	}, 8000);
}
intervalSwitch();
// /

// Popups
var closingElements = document.querySelectorAll('.popup__back, .pop-window__close');
for (var i = 0; i < closingElements.length; i++) {
	closingElements[i].addEventListener('click', hidePopup);
}
function hidePopup() {
	var visiblePop = document.querySelectorAll('.popup');
	for (var i = 0; i < visiblePop.length; i++) {
		visiblePop[i].classList.remove('_visible');
	}
}
function showPopup(type) {
	document.querySelector('.popup--' + type).classList.add('_visible');
}
// /
