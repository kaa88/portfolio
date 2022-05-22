// TO DO:
// избавиться от undefined значений
// использовать const и let
// прототипы

const mobileSwitchWidth = 768;

// Media switcher
// let mobileSwitchWidth = 768; // переместил в главный скрипт файл
let mobileIsOn= false, prevMobileIsOn = false;
window.addEventListener('resize', mobileSwitch);

function mobileSwitch() {
	if (window.innerWidth <= mobileSwitchWidth) mobileIsOn = true;
	else mobileIsOn = false;

	if (mobileIsOn != prevMobileIsOn) {
		mobileHideElements();
	}
	prevMobileIsOn = mobileIsOn;
}
function mobileHideElements() {
	if (menu.classList.contains('_active')) 
		toggleMenu();
}
// /

// Scroll Lock
let scrollLock = false;
let scrollLockItems = document.querySelector('.page').children;
let scrollLockMenu = document.querySelector('.menu__container');
let scrollbarWidth;

scrollLockMenu.basePadding = Number(getComputedStyle(scrollLockMenu).paddingRight.slice(0,-2));
for (let i = 0; i < scrollLockItems.length; i++) {
	scrollLockItems[i].basePadding = Number(getComputedStyle(scrollLockItems[i]).paddingRight.slice(0,-2));
}
window.addEventListener('resize', scrollLockInit);
scrollLockInit();

function scrollLockInit() {
	scrollbarWidth = window.innerWidth - document.body.offsetWidth;
}
function lockScrollbar() {
	if (scrollLock == false) {
		for (let i = 0; i < scrollLockItems.length; i++) {
			if (window.innerWidth <= mobileSwitchWidth)
				scrollLockMenu.style.paddingRight = scrollLockMenu.basePadding + scrollbarWidth + 'px';
			scrollLockItems[i].style.paddingRight = scrollLockItems[i].basePadding + scrollbarWidth + 'px';
		}
		document.body.classList.add('_locked');
		scrollLock = true;
	}
	else {
		setTimeout(function(){
			scrollLockMenu.style.paddingRight = scrollLockMenu.basePadding + 'px';
			for (let i = 0; i < scrollLockItems.length; i++) {
				scrollLockItems[i].style.paddingRight = scrollLockItems[i].basePadding + 'px';
			}
			document.body.classList.remove('_locked');
			scrollLock = false;
		}, 400);
	}
}
// /

// Main Menu
let menu = document.querySelector('.menu__container');
let menuBtn = document.querySelectorAll('.menu__menu-open-btn, .menu__menu-close-btn, .menu-turn-off-area');
for (let i = 0; i < menuBtn.length; i++) {
	menuBtn[i].addEventListener('click', toggleMenu);
}

function toggleMenu() {
	menu.classList.toggle('_active');
	for (let i = 0; i < menuBtn.length; i++) {
		menuBtn[i].classList.toggle('_active');
	}
	lockScrollbar();
}
// /

//include('t/popup.js')
//include('t/selection.js')
//include('t/accordion_js.js')
//include('t/random.js')
//include('t/onload_counter.js')
