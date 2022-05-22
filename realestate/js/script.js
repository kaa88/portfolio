// Hello World!

///////////////////////////////////////////////////////////////////////////////////////////

/* JS Media Queries (checks window resizing and runs funcs on breakpoints)
	Useful output - jsMediaQueries.stateIndex
	Params {obj}:
		mobile - some modules use this variable to check mobile or desktop view, make sure it matches with CSS.
		breakpoints - there is 1 more index than number of breakpoints (from 0px to 1st breakpoint)
*/
const jsMediaQueries = {
	init: function(params = {}) {
		this.mobile = params.mobile || 768;
		this.breakpoints = params.breakpoints || null;
		if (!this.breakpoints) return;
		this.breakpoints.keys = Object.keys(this.breakpoints);
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			this.breakpoints.keys[i] = Number(this.breakpoints.keys[i]);
		}
		this.breakpoints.keys.push(0);
		this.breakpoints.keys.sort((a,b) => {return a - b});
		window.addEventListener('resize', this.check.bind(this));
		this.check(0, true);
	},
	check: function(e, init = false) {
		for (let i = 0; i < this.breakpoints.keys.length; i++) {
			if (window.innerWidth > this.breakpoints.keys[i]) this.state = this.breakpoints.keys[i];
			else break;
		}
		if (init) this.prev_state = this.state;
		if (this.state != this.prev_state && !init) {
			if (this.state > this.prev_state) this.breakpoints[this.state]();
			else this.breakpoints[this.prev_state]();
			this.prev_state = this.state;
		}
	}
}
jsMediaQueries.init({
	mobile: 768,
	breakpoints: {
		568: () => {},
		768: () => {
			header.mobileViewService(); // this function makes header work properly
		}, 
		1228: () => {}
	}
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Scroll lock (prevents window scrolling with menu, modals, etc.).
	By default script will find all body.children and set padding-right to them.
	If you want to add more items to list (if position: fixed / absolute), 
	add 'scroll-lock-item' class to them. They will get a margin-right property.
	Use: 
		scrollLock.lock()
		scrollLock.unlock( #timeout# )
*/
const scrollLock = {
	lockedClassName: '_locked',
	paddingItems: document.querySelectorAll('.scroll-lock-item-p'),
	marginItems: document.querySelectorAll('.scroll-lock-item-m'),
	lock: function() {
		if (document.body.classList.contains(this.lockedClassName)) return;
		this.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
		let that = this;
		function f(items, prop) {
			for (let i = 0; i < items.length; i++) {
				items[i][prop] = parseFloat(getComputedStyle(items[i])[prop]);
				items[i].style[prop] = items[i][prop] + that.scrollbarWidth + 'px';
			}
		}
		f(this.paddingItems, 'paddingRight');
		f(this.marginItems, 'marginRight');
		document.body.classList.add(this.lockedClassName);
	},
	unlock: function(timeout = 0) {
		let that = this;
		setTimeout(() => {
			function f(items, prop) {
				for (let i = 0; i < items.length; i++) {
					items[i].style[prop] = '';
				}
			}
			f(this.paddingItems, 'paddingRight');
			f(this.marginItems, 'marginRight');
			document.body.classList.remove(that.lockedClassName);
		}, timeout);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////

/* Transition lock (prevents double-clicking on transitions, e.g. when menu slides)
	Use:
		if (transitionLock.check( #timeout# )) return;
*/
const transitionLock = {
	locked: false,
	check: function(timeout = 0) {
		let that = this,
		    result = this.locked;
		if (that.locked == false) {
			that.locked = true;
			setTimeout(function(){
				that.locked = false;
			}, timeout);
		}
		return result;
	}
}

///////////////////////////////////////////////////////////////////////////////////////////

/* Header
	Set transition timeout in CSS only
	Params {obj}: (defaults = false)
	- menu - add menu block
	- submenu - add submenu block
	- hidingHeader - add hidingHeader block
*/
const header = {
	refs: { // dependences
		mobile: jsMediaQueries.mobile,
		translock: transitionLock,
		scrlock: scrollLock
	},
	names: {
		header: '.header',
		menu: '.hdr-menu',
		menuItems: '.hdr-menu-items',
		menuItem: '.hdr-menu-item',
		menuOpenBtn: '.hdr-menu-open-btn',
		menuCloseBtn: '.hdr-menu-close-btn',
		menuBackBtn: '.hdr-menu-back-btn',
		menuArea: '.hdr-menu-turn-off-area',
		menuOptions: '#header-menu-options',
		submenu: '.hdr-submenu',
		submenuDropLink: '.submenu-drop-link',
		thisPageClass: 'this-page',
		varTimer: '--timer-menu',
		varHeight: '--header-height',
	},
	init: function(params = {}) {
		this.headerElem = document.querySelector(this.names.header);
		let timeout = parseFloat(getComputedStyle(document.body).getPropertyValue(this.names.varTimer))*1000 || 0;
		this.setCssHeaderHeight();
		window.addEventListener('resize', this.setCssHeaderHeight.bind(this));

		if (params.menu) this.menu.init(this, timeout, this.names);
		if (params.submenu) this.submenu.init(this, timeout, this.names);
		if (params.hidingHeader) window.addEventListener('load', () => this.hidingHeader.init(this));

	},
	setCssHeaderHeight: function() {
		// This func controls the mobile menu height variable in css
		let hh = getComputedStyle(this.headerElem).height;
		document.body.style.setProperty(this.names.varHeight, hh);
		this.headerHeight = parseFloat(hh);
	},
	mobileViewService: function() {
		this.menu.toggle();
		this.menu.hideOnViewChange();
		this.hidingHeader.calc();
	},

	// Menu
	menu: {
		isLoaded: false,
		init: function(that, timeout, names) {
			this.isLoaded = true;
			this.root = that;
			this.timeout = timeout;
			this.menuElem = this.root.headerElem.querySelector(names.menu);
			this.buttons = this.root.headerElem.querySelectorAll(`${names.menuOpenBtn}, ${names.menuCloseBtn}, ${names.menuArea}`);
			let newMenu = this.menuElem.querySelector(names.menuItems);
			let options = {};
			if (typeof headerMenuOptions !== 'undefined') options = headerMenuOptions;
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
						newMenu.children[i].firstElementChild.classList.add(names.thisPageClass);
						break;
					}
				}
			}
			options.elem = document.querySelector(names.menuOptions);
			if (options.elem) options.elem.parentElement.removeChild(options.elem);

			for (let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].addEventListener('click', this.toggle.bind(this));
			}
		},
		toggle: function(e) {
			if (!this.isLoaded) return;
			if (this.root.refs.translock.check(this.timeout)) return;
			
			if (this.menuElem.classList.contains('_active')) {
				this.menuElem.classList.remove('_active');
				for (let i = 0; i < this.buttons.length; i++) {
					this.buttons[i].classList.remove('_active');
				}
				this.root.refs.scrlock.unlock(this.timeout);
				this.root.submenu.closeAll(); // submenu reference
			}
			else {
				if (e) {
					this.menuElem.classList.add('_active');
					for (let i = 0; i < this.buttons.length; i++) {
						this.buttons[i].classList.add('_active');
					}
					this.root.refs.scrlock.lock();
					this.root.hidingHeader.scroll(0, true); // hidingHeader reference
				}
			}
		},
		hideOnViewChange: function() {
			// this func prevents menu blinking on mobile view switch
			if (this.isLoaded) {
				let that = this;
				this.menuElem.style.display = 'none';
				setTimeout(() => {
					that.menuElem.style.display = '';
				}, that.timeout)
			}
		}
	},
	// /Menu

	// SubMenu
	submenu: {
		isLoaded: false,
		init: function(that, timeout, names){
			this.isLoaded = true;
			this.root = that;
			this.timeout = timeout;
			this.sMenuElems = this.root.headerElem.querySelectorAll(names.submenu);
			if (this.sMenuElems.length == 0) console.log('Error: No submenu detected');
			this.links = this.root.headerElem.querySelectorAll(names.submenuDropLink);
			this.backButtons = this.root.headerElem.querySelectorAll(names.menuBackBtn);
			// if menu-item contains submenu
			if (this.links[0]) {
				if (this.links[0].closest(names.menuItem).querySelector(names.submenu)) this.isOutside = false;
				else this.isOutside = true;
			}
			// setting events
			for (let i = 0; i < this.backButtons.length; i++) {
				this.backButtons[i].addEventListener('click', this.toggle.bind(this));
			}
			for (let i = 0; i < this.links.length; i++) {
				this.links[i].addEventListener('click', this.toggle.bind(this));
				this.links[i].addEventListener('mouseover', this.toggle.bind(this));
				if (!this.isOutside)
					this.links[i].closest(names.menuItem).addEventListener('mouseleave', this.toggle.bind(this));
			}
			if (this.isOutside)
				this.root.headerElem.addEventListener('mouseleave', this.toggle.bind(this));
		},
		toggle: function(e) {
			if (!e) return;
			let that = this, mobile = false;
			if (window.innerWidth <= this.root.refs.mobile) mobile = true;

			function is(name) {
				let str = that.root.names[name];
				if (str.match(/[#.]/)) str = str.substring(1);
				return e.currentTarget.classList.contains(str);
			}
			
			if (mobile) {
				if (e.type == 'click') {
					if (is('submenuDropLink')) this.open(e, mobile);
					if (is('menuBackBtn')) this.close(e, mobile);
				}
			}
			else {
				if (e.type == 'mouseover') {
					if (is('submenuDropLink')) this.open(e, mobile);
				}
				if (e.type == 'mouseleave') {
					if (is('menuItem') || is('header')) this.close(e, mobile);
				}
			}
		},
		open: function(e, m) {
			e.preventDefault();
			if (m && this.root.refs.translock.check(this.timeout)) return;
			if (this.isOutside) {
				for (let i = 0; i < this.links.length; i++) {
					this.links[i].classList.add('_active');
				}
				for (let i = 0; i < this.sMenuElems.length; i++) {
					this.sMenuElems[i].classList.add('_active');
				}
			}
			else {
				e.currentTarget.classList.add('_active');
				e.currentTarget.nextElementSibling.classList.add('_active');
			}
		},
		close: function(e, m) {
			if (m && this.root.refs.translock.check(this.timeout)) return;
			if (this.isOutside) {
				let items = this.root.headerElem.querySelectorAll(`${this.root.names.menuItem} ._active, ${this.root.names.submenu}._active`);
				for (let i = 0; i < items.length; i++) {
					items[i].classList.remove('_active');
				}
			}
			else {
				let parent = e.currentTarget.closest(this.root.names.menuItem);
				for (let i = 0; i < parent.children.length; i++) {
					parent.children[i].classList.remove('_active');
				}
			}
		},
		closeAll: function() {
			if (this.isLoaded) {
				for (let i = 0; i < this.links.length; i++) {
					this.links[i].classList.remove('_active');
				}
				for (let i = 0; i < this.sMenuElems.length; i++) {
					this.sMenuElems[i].classList.remove('_active');
				}
			}
		}
	},
	// /SubMenu

	// Hiding Header
	hidingHeader: {
		isLoaded: false,
		init: function(that) {
			this.isLoaded = true;
			this.root = that;
			this.hiddenPositionOffset = 0; // set this one if you want to move header by value that differs it's height
			this.visiblePosition = parseFloat(getComputedStyle(this.root.headerElem).top);
			this.calc();
			window.addEventListener('scroll', this.scroll.bind(this));
		},
		calc: function() {
			if (!this.isLoaded) return;
			this.Y = this.YPrev = pageYOffset;
			this.diff = 0;
			this.currentPos = this.visiblePosition;
			this.root.headerElem.style.top = this.currentPos + 'px';
		},
		scroll: function(e, click) {
			if (!this.isLoaded) return;
			if (window.innerWidth > this.root.refs.mobile) return;
			if (click) {
				this.root.headerElem.style.top = this.visiblePosition + 'px';
				this.currentPos = this.visiblePosition;
				return;
			}
			// lazyLoad check
			if ((pageYOffset < (this.Y + this.diff) && this.Y > this.YPrev) || (pageYOffset > (this.Y + this.diff) && this.Y < this.YPrev)) {
				this.diff = pageYOffset - this.Y;
			}
			
			this.YPrev = this.Y;
			this.Y = pageYOffset - this.diff;
			this.currentPos -= this.Y - this.YPrev;
			this.hiddenPosition = (this.root.headerHeight + this.hiddenPositionOffset) * -1;
			if (this.currentPos > this.visiblePosition) this.currentPos = this.visiblePosition;
			if (this.currentPos < this.hiddenPosition) this.currentPos = this.hiddenPosition;
			this.root.headerElem.style.top = this.currentPos + 'px';
		}
	},
	// /Hiding Header
}
header.init({
	menu: true,
	hidingHeader: true
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Modal window
	Set transition timeout in CSS only
	Params {obj}: 
	- elem - element name (default = 'modal'),
	- linkName - modal link name (default = 'modal-link')
	- on: {'modal-window': {open, close}} - event function(event, content, timeout){}
*/
const modal = {
	refs: {
		translock: transitionLock,
		scrlock: scrollLock
	},
	init: function(params = {}){
		this.elemName = params.elem || 'modal';
		this.elem = document.querySelector('.' + this.elemName);
		if (!this.elem) return;
		this.timeout = parseFloat(getComputedStyle(document.body).getPropertyValue('--timer-modal'))*1000 || 0;
		this.windows = this.elem.querySelectorAll('.' + this.elemName + '__window');
		this.links = document.querySelectorAll(params.linkName ? '.' + params.linkName : '.modal-link');
		let that = this;
		for (let i = 0; i < this.links.length; i++) {
			this.links[i].addEventListener('click', this.open.bind(this));
		}
		this.elem.addEventListener('click', function(e) {
			if (!e.target.closest('.' + this.elemName + '__wrapper')) this.closeAll();
		}.bind(this));
		let closeButtons = this.elem.querySelectorAll('.' + this.elemName + '__close-button');
		for (let i = 0; i < closeButtons.length; i++) {
			closeButtons[i].addEventListener('click', this.closeThis.bind(this));
		}
		this.on = params.on || {};
	},
	open: function(e){
		if (this.refs.translock.check(this.timeout)) return;
		e.preventDefault();
		let currentModal = this.elem.querySelector(e.currentTarget.getAttribute('href'));
		currentModal.classList.add('_open');
		if (this.on[currentModal.id] && this.on[currentModal.id].open)
			this.on[currentModal.id].open(
				e, 
				currentModal.querySelector('.' + this.elemName + '__content > *:not(.' + this.elemName + '__close-button)'),
				this.timeout
			);
		modal.check();
	},
	closeThis: function(e){
		if (this.refs.translock.check(this.timeout)) return;
		let currentModal = e.target.closest('.' + this.elemName + '__window');
		currentModal.classList.remove('_open');
		if (this.on[currentModal.id] && this.on[currentModal.id].close)
			this.on[currentModal.id].close(
				e, 
				currentModal.querySelector('.' + this.elemName + '__content > *:not(.' + this.elemName + '__close-button)'),
				this.timeout
			);
		modal.check();
	},
	closeAll: function(){
		if (this.refs.translock.check(this.timeout)) return;
		for (let i = 0; i < this.windows.length; i++) {
			if (this.windows[i].classList.contains('_open')) {
				this.windows[i].classList.remove('_open');
				if (this.on[this.windows[i].id] && this.on[this.windows[i].id].close)
					this.on[this.windows[i].id].close(0,0,this.timeout);
			}
		}
		modal.check();
	},
	check: function(){
		let openedWindows = 0;
		for (let i = 0; i < this.windows.length; i++) {
			if (this.windows[i].classList.contains('_open')) openedWindows++;
		}
		if (openedWindows) {
			this.elem.classList.add('_visible');
			this.refs.scrlock.lock();
		}
		else {
			this.elem.classList.remove('_visible');
			if (!document.querySelector('.hdr-menu').classList.contains('_active'))
				this.refs.scrlock.unlock(this.timeout);
		}
	}
}
modal.init({
	on: {
		'modal-login': {
			open: function(event, content, timeout) {
				function f(id) {
					let tabsBtns = document.querySelector('.modal__tabs .tabs__buttons');
					let tabsContent = document.querySelector('.modal__tabs .tabs__content');
					for (let i = 0; i < tabsBtns.children.length; i++) {
						tabsBtns.children[i].classList.remove('_active');
						tabsContent.children[i].classList.remove('_active');
						if (i == id) {
							tabsBtns.children[i].classList.add('_active');
							tabsContent.children[i].classList.add('_active');
						}
					}
				}
				if (event.currentTarget.dataset.link == 'login') f(0);
				if (event.currentTarget.dataset.link == 'reg') f(1);
			}
		},
	}
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Select
	Params {obj}:
	- elem - element name (default = 'select')
	- firstOptSelected (default = false)
	- onselect - event
*/
class Select {
	constructor(params = {}) {
		this.elemName = params.elem || 'select';
		this.elem = document.querySelector('.' + this.elemName);
		if (!this.elem) return;

		this.header = this.elem.querySelector('.select__header');
		this.headertext = this.elem.querySelector('.select__header-text');
		this.list = this.elem.querySelector('.select__list-wrapper');
		this.list.innerHTML = '';

		this.basicSelect = this.elem.querySelectorAll('select option');

		let newList = document.createElement('ul');
		newList.classList.add('select__list');
		this.list.appendChild(newList);
		for (let i = 0; i < this.basicSelect.length; i++) {
			if (this.basicSelect[i].hasAttribute('disabled')) continue;
			let newLi = document.createElement('li');
			newLi.classList.add('select__option');
			newLi.innerHTML = this.basicSelect[i].innerHTML;
			newList.appendChild(newLi);
		}

		this.options = this.elem.querySelectorAll('.select__option');
		this.listMaxHeight = this.elem.querySelector('.select__list').offsetHeight;
		let that = this;
		for (let i = 0; i < this.options.length; i++) {
			this.options[i].addEventListener('click', function() {
				that.selectItem(event, that, i);
			});
		};
		this.header.addEventListener('click', this.showList.bind(this));
		window.addEventListener('click', this.hideList.bind(this), {capture: true});
		this.isOpened = false;

		if (params.firstOptSelected) {
			this.headertext.innerHTML = this.options[0].innerHTML;
			this.options[0].classList.add('_selected');
			this.basicSelect[0].parentElement.removeChild(this.basicSelect[0]);
		}
		else {
			this.headertext.innerHTML = this.basicSelect[0].innerHTML;
		}
		this.onselect = params.onselect || function(selection){};
	}
	hideList(e) {
		if (!this.isOpened) return;
		this.list.style.height = '';
		this.elem.classList.remove('_active');
		this.list.classList.remove('_active');
		let that = this;
		setTimeout(() => {that.isOpened = false}, 100);
	}
	showList(e) {
		if (this.isOpened) return;
		this.list.style.height = this.listMaxHeight + 'px';
		this.elem.classList.add('_active');
		this.list.classList.add('_active');
		this.isOpened = true;
	}
	selectItem(e, that, i) {
		for (let j = 0; j < e.target.parentElement.children.length; j++) {
			e.target.parentElement.children[j].classList.remove('_selected');
			that.basicSelect[j].removeAttribute('selected');
		}
		e.target.classList.add('_selected');
		that.basicSelect[i+1].setAttribute('selected', 'true');
		that.onselect(that.basicSelect[i+1].value);
		that.headertext.innerHTML = e.target.innerHTML;
	}
}
let form_select_prop_type = new Select({
	elem: 'select--prop-type', 
})
let form_select_bedrooms = new Select({
	elem: 'select--bedrooms', 
})

///////////////////////////////////////////////////////////////////////////////////////////

// Swiper simple (Single Swiper in a project)
const swiper = new Swiper('.swiper', {
	pagination: {
		el: '.swiper-pagination',
		type: 'bullets',
		clickable: true
	},
	loop: true,
});

///////////////////////////////////////////////////////////////////////////////////////////

// Tabs
const tabsBlockButtons = document.querySelectorAll('.tabs__btn');
for (let i = 0; i < tabsBlockButtons.length; i++) {
	tabsBlockButtons[i].addEventListener('click', function() {
		let buttons = this.parentElement.children,
			content = this.closest('.tabs').querySelectorAll('.tabs__content-item');
		for (let i = 0; i < content.length; i++) {
			content[i].classList.remove('_active');
		}
		for (let i = 0; i < buttons.length; i++) {
			buttons[i].classList.remove('_active');
			if (buttons[i] == this) {
				buttons[i].classList.add('_active');
				content[i].classList.add('_active');
			}
		}
	})
}	
