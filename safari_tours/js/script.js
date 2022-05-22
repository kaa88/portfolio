// Mobile switcher (turns off something on window resize)
let mobileSwitchWidth = 768;
let mobileSwitch = {state: false, prev_state: false};
mobileSwitch.check = function(init) {
	let o = mobileSwitch;
	if (window.innerWidth <= mobileSwitchWidth) o.state = true;
	else o.state = false;
	if (o.state != o.prev_state && init != true) o.do();
	o.prev_state = o.state;
}
window.addEventListener('resize', mobileSwitch.check);
mobileSwitch.check(true);
mobileSwitch.do = function() { // place functions here to run on switch
	if (headerMenu.element.classList.contains('_active')) headerMenu.toggle();
	hidingHeader.init();
	tourTab.init();
	world_map.close();
}
// /

// Transition lock (prevents double-clicking, e.g. when menu slides)
let transitionLock = {
	locked: false,
	check: function(timeout = 0) {
		let result = transitionLock.locked;
		if (transitionLock.locked == false) {
			transitionLock.locked = true;
			setTimeout(function(){
				transitionLock.locked = false;
			}, timeout);
		}
		return result;
	}
}
// /

// Scroll lock
let scrollLock = {
	scrollbarWidth: 0,
	initializer: null,
	items: document.querySelector('.page').children
};
for (let i = 0; i < scrollLock.items.length; i++) {
	scrollLock.items[i].basePadding = Number(getComputedStyle(scrollLock.items[i]).paddingRight.slice(0,-2));
}
scrollLock.init = function() {
	scrollLock.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
}
window.addEventListener('resize', scrollLock.init);
scrollLock.init();

scrollLock.toggle = function(initializer, timeout = 0) {
	let o = scrollLock; // to prevent errors with events
	if (initializer && o.initializer == null) {
		o.initializer = initializer;
		o.initializer.basePadding = Number(getComputedStyle(o.initializer).paddingRight.slice(0,-2));
	}
	if (document.body.classList.contains('_locked')) {
		setTimeout(function(){
			if (o.initializer) {
				o.initializer.style.paddingRight = o.initializer.basePadding + 'px';
				o.initializer = null;
			}
			for (let i = 0; i < o.items.length; i++) {
				o.items[i].style.paddingRight = o.items[i].basePadding + 'px';
			}
			document.body.classList.remove('_locked');
		}, timeout);
	}
	else {
		if (o.initializer)
			o.initializer.style.paddingRight = o.initializer.basePadding + o.scrollbarWidth + 'px';
		for (let i = 0; i < o.items.length; i++) {
			o.items[i].style.paddingRight = o.items[i].basePadding + o.scrollbarWidth + 'px';
		}
		document.body.classList.add('_locked');
	}
}
// /

// Header + menu
let headerMenu = {timeout: 400};
let hidingHeader = {hiddenPosition: -100};
headerMenu.element = document.querySelector('.menu__container');
headerMenu.buttons = document.querySelectorAll('.menu__menu-open-btn, .menu__menu-close-btn, .menu-turn-off-area');
headerMenu.init = function() {
	let newMenu = document.getElementsByClassName('menu__items')[0];
	let options = headerMenuOptions;
	if (options.links) {
		let clone = {};
		for (let i = 0; i < newMenu.children.length; i++) {
			clone[newMenu.children[i].dataset.name] = newMenu.children[i];
		}
		newMenu.innerHTML = '';
		for (let i = 0; i < options.links.length; i++) {
			newMenu.appendChild(clone[options.links[i]]);
		}
	}
	if (options.activeLink) {
		for (let i = 0; i < newMenu.children.length; i++) {
			if (newMenu.children[i].dataset.name == options.activeLink) {
				newMenu.children[i].firstElementChild.classList.add('this-page');
				break;
			}
		}
	}
	options.elem = document.querySelector('#headerMenuOptions');
	options.elem.parentElement.removeChild(options.elem);
}
headerMenu.toggle = function() {
	let o = headerMenu;
	if (transitionLock.check(o.timeout)) return;
	
	o.element.classList.toggle('_active');
	for (let i = 0; i < o.buttons.length; i++) {
		o.buttons[i].classList.toggle('_active');
	}
	scrollLock.toggle(o.element, o.timeout);
}
for (let i = 0; i < headerMenu.buttons.length; i++) {
	headerMenu.buttons[i].addEventListener('click', headerMenu.toggle);
}
headerMenu.init();

// Hiding header
hidingHeader.elem = document.querySelector('.header');
hidingHeader.visiblePosition = Number(getComputedStyle(hidingHeader.elem).top.slice(0,-2));

hidingHeader.scroll = function() {
	if (window.innerWidth > mobileSwitchWidth) return;
	let o = hidingHeader;
	o.currentPos -= pageYOffset - o.pagePrevPos;
	o.pagePrevPos = pageYOffset;
	if (o.currentPos > o.visiblePosition) o.currentPos = o.visiblePosition;
	if (o.currentPos < o.hiddenPosition) o.currentPos = o.hiddenPosition;
	o.elem.style.top = o.currentPos + 'px';
}
hidingHeader.init = function() {
	let o = hidingHeader;
	o.currentPos = o.visiblePosition;
	o.pagePrevPos = pageYOffset;
	o.elem.style.top = o.currentPos + 'px';
}
window.addEventListener('scroll', hidingHeader.scroll);
hidingHeader.init();
// /

// Modal window
let modal = {timeout: 800};
modal.activeElem = null;
modal.closingElems = document.querySelectorAll('.modal__close-area, .modal__close-button');
modal.toggle = function(name) {
	if (transitionLock.check(modal.timeout)) return;
	
	let o = modal;
	if (!o.activeElem)
		o.activeElem = document.querySelector(!name ? '.modal' : ('.modal--' + name));
	o.activeElem.classList.toggle('_visible');
	scrollLock.toggle(o.activeElem, o.timeout);
	if (o.activeElem.classList.contains('_visible')) return;
	else o.activeElem = null;
}
for (let i = 0; i < modal.closingElems.length; i++) {
	modal.closingElems[i].addEventListener('click', modal.toggle);
}
// /

// Selection
function Select(elem = '.select', chooseFirstOpt = true){
	this.elem = document.querySelector(elem);
	if (!this.elem) return;
	this.header = this.elem.querySelector('.select__header-text');
	this.list = this.elem.querySelector('.select__list-wrapper');
	this.options = this.elem.querySelectorAll('.select__option');
	this.listMaxHeight = this.elem.querySelector('.select__list').offsetHeight;
	this.listMinHeight = 0;
	this.header.parentElement.addEventListener('click', this.toggleList.bind(this));
	for (let i = 0; i < this.options.length; i++) {
		this.options[i].addEventListener('click', this.setToSelected);
		this.options[i].addEventListener('click', this.selectItem.bind(this));
	};
	if (chooseFirstOpt == true) {
		this.header.innerHTML = this.options[0].innerHTML;
		this.options[0].classList.add('_selected');
	}
};
Select.prototype.toggleList = function(){
	if (this.list.classList.contains('_active'))
		this.list.style.height = this.listMinHeight + 'px';
	else
		this.list.style.height = this.listMaxHeight + 'px';
	this.header.classList.toggle('_active');
	this.list.classList.toggle('_active');
};
Select.prototype.setToSelected = function(){
	for (let i = 0; i < this.parentElement.children.length; i++) {
		this.parentElement.children[i].classList.remove('_selected');
	}
	this.classList.add('_selected');
};
Select.prototype.selectItem = function(){
	for (let i = 0; i < this.options.length; i++) {
		if (this.options[i].classList.contains('_selected'))
			this.header.innerHTML = this.options[i].innerHTML;
	}
	this.toggleList();
};
let select_booking = new Select();
// /

// Swiper
const swiper = new Swiper('.banner__swiper', {
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	loop: true,
	loopAdditionalSlides: 4,
	speed: 800,
	effect: 'cube',
	cubeEffect: {
		shadow: false,
		slideShadows: false,
	},
	autoplay: {
		delay: 4000,
		disableOnInteraction: false,
		pauseOnMouseEnter: true
	}
});
// /

// Tour tab
let tourTab = {name: '.tour-tab', minWidth: mobileSwitchWidth};
tourTab.buttons = document.querySelectorAll(tourTab.name + '__btn');
tourTab.pages = document.querySelectorAll(tourTab.name + '__page');
tourTab.switchList = function(event) {
	let elem = event ? event.target : tourTab.buttons[0];
	for (let i = 0; i < tourTab.buttons.length; i++) {
		if (elem == tourTab.buttons[i]) {
			tourTab.buttons[i].classList.add('_active');
			tourTab.pages[i].classList.remove('_hidden');
			continue;
		}
		tourTab.buttons[i].classList.remove('_active');
		tourTab.pages[i].classList.add('_hidden');
	}
};
for (let i = 0; i < tourTab.buttons.length; i++) {
	tourTab.buttons[i].addEventListener('click', tourTab.switchList);
}
tourTab.init = function() {
	if (window.innerWidth > this.minWidth) {
		for (let i = 0; i < this.buttons.length; i++) {
			this.pages[i].classList.add('_hidden');
		}
		this.switchList();
	}
	else {
		for (let i = 0; i < this.buttons.length; i++) {
			this.pages[i].classList.remove('_hidden');
		}
	}
}
tourTab.init();
// /

// Map
let world_map = {
	names: {
		part: 'map__part',
		popup: 'map__info-popup',
		button: 'info-popup__close-btn',
		area: 'map__info-popup-close-area'
	}
};
world_map.parts = document.querySelectorAll('.' + world_map.names.part);
world_map.popups = document.querySelectorAll('.' + world_map.names.popup);
world_map.close_elems = document.querySelectorAll('.' + world_map.names.area + ', .' + world_map.names.button);
world_map.toggle = function() {
	for (var i = 0; i < world_map.parts.length; i++) {
		if (world_map.parts[i].classList.contains('_active') || world_map.parts[i] == this) {
			world_map.parts[i].classList.toggle('_active');
			world_map.popups[i].classList.toggle('_active');
		}
	}
	world_map.close_elems[0].classList.toggle('_active');
}
world_map.close = function() {
	if (world_map.parts.length == 0) return;
	for (var i = 0; i < world_map.parts.length; i++) {
		world_map.parts[i].classList.remove('_active');
		world_map.popups[i].classList.remove('_active');
	}
	world_map.close_elems[0].classList.remove('_active');
}
for (var i = 0; i < world_map.parts.length; i++) {
	world_map.parts[i].addEventListener('click', world_map.toggle);
}
for (var i = 0; i < world_map.close_elems.length; i++) {
	world_map.close_elems[i].addEventListener('click', world_map.close);
}
// /
