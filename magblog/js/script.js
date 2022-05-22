// Onload inits
function onloadInits() {
	sideLine.init();
	hidingHeader.init();
}
// /

// Mobile switcher (turns off menu on window resize)
let mobileSwitchWidth = 830;
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
mobileSwitch.do = function() { // place functions here to run
	if (headerMenu.element.classList.contains('_active')) headerMenu.toggle();
	hidingHeader.init();
	sideLine.init();
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

// Main menu
let headerMenu = {timeout: 300};
let hidingHeader = {hiddenPosition: -105};
headerMenu.element = document.querySelector('.header__container');
headerMenu.buttons = document.querySelectorAll('.menu-open-btn, .menu-close-btn, .menu-turn-off-area');
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
	if (o.element.classList.contains('_active'))
		hidingHeader.scroll(0, true);
}
for (let i = 0; i < headerMenu.buttons.length; i++) {
	headerMenu.buttons[i].addEventListener('click', headerMenu.toggle);
}
headerMenu.init();

// Hiding header
hidingHeader.elem = document.querySelector('.header__container');
hidingHeader.visiblePosition = Number(getComputedStyle(hidingHeader.elem).top.slice(0,-2));

hidingHeader.scroll = function(e, click) {
	if (window.innerWidth > mobileSwitchWidth) return;
	let o = hidingHeader;
	if (click) {
		o.elem.style.top = o.visiblePosition + 'px';
		o.currentPos = o.visiblePosition;
		return;
	}
	// lazyLoadFix check
	if ((pageYOffset < (o.Y + o.diff) && o.Y > o.YPrev) || (pageYOffset > (o.Y + o.diff) && o.Y < o.YPrev)) {
		o.diff = pageYOffset - o.Y;
	}
	o.YPrev = o.Y;
	o.Y = pageYOffset - o.diff;
	o.currentPos -= o.Y - o.YPrev;
	if (o.currentPos > o.visiblePosition) o.currentPos = o.visiblePosition;
	if (o.currentPos < o.hiddenPosition) o.currentPos = o.hiddenPosition;
	o.elem.style.top = o.currentPos + 'px';
}
hidingHeader.init = function() {
	let o = hidingHeader;
	o.Y = o.YPrev = pageYOffset;
	o.diff = 0;
	o.currentPos = o.visiblePosition;
	o.elem.style.top = o.currentPos + 'px';
	window.addEventListener('scroll', hidingHeader.scroll);
}
// /

// Swiper
const swiper = new Swiper('.swiper', {
	spaceBetween: 9,
	slidesPerView: 3,
	loop: true,
	breakpoints: {
		1: {
			enabled: false,
			direction: 'vertical'
		},
		650: {
			enabled: true,
			direction: 'horizontal'
		}
	},
});
// /

// Aside tabs
let asideTabs = {
	tabs: document.querySelector('.top-stories__tabs'),
	lists: document.querySelector('.top-stories__lists')
};
asideTabs.switch = function(e) {
	for (let i = 0; i < this.tabs.children.length; i++) {
		this.tabs.children[i].classList.remove('_visible');
		this.lists.children[i].classList.remove('_visible');
		if (this.tabs.children[i] == e.target) {
			this.tabs.children[i].classList.add('_visible');
			this.lists.children[i].classList.add('_visible');
		}
	}
}
for (let i = 0; i < asideTabs.tabs.children.length; i++) {
	asideTabs.tabs.children[i].addEventListener('click', asideTabs.switch.bind(asideTabs));
}
// /

// Side-line
let sideLine = {
	page: document.querySelector('.page'),
	elem: document.querySelector('.page__side-line'),
	part: document.querySelector('.page__side-line-part'),
	margin: 350
};
sideLine.init = function() {
	// remove clones & re-init on mobile switch
	for (let i = 0; i < this.elem.children.length; i++) {
		if (this.elem.children[i].classList.contains('_clone')) {
			this.elem.children[i].parentElement.removeChild(this.elem.children[i]);
		}
	}
	// /
	this.remain = this.page.offsetHeight - this.elem.offsetHeight;
	while (this.remain > (this.part.offsetHeight + this.margin)) {
		let newPartClone = this.part.cloneNode(true);
		newPartClone.classList.add('_clone');
		this.elem.appendChild(newPartClone);
		this.remain = this.page.offsetHeight - this.elem.offsetHeight;
	}
}
// /
