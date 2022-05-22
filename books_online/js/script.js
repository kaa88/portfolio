// Hello World!


// Some modules use this variable to check mobile or desktop view. Make sure it matches with CSS.
const mobileSwitchWidth = 838

///////////////////////////////////////////////////////////////////////////////////////////

/* Recounter (checks window resizing and runs funcs on breakpoints)
	Useful output - recounter.stateIndex
	There is 1 more index than number of breakpoints
*/
const recounter = {
	init: function(params = {}) {
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
			if (window.innerWidth > this.breakpoints.keys[i]) {
				this.state = this.breakpoints.keys[i];
				this.stateIndex = i;
			}
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
recounter.init({
	breakpoints: {
		433: () => {
			gridSlider.buildSlides();
		},
		565: () => {
			document.querySelector('.footer-top__radio').checked = true;
			// gridSlider.buildSlides();
		},
		701: () => {
			gridSlider.buildSlides();
		},
		838: () => {
			scrollLock.recalc();
			header.menu.toggle();
			// header.hidingHeader.calc();
			categoriesBtn.turnOff();
			gridSlider.buildSlides();
		}, 
		940: () => {
			gridSlider.buildSlides();
		}
	}
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Transition lock (prevents double-clicking on transitions, e.g. when menu slides)
	Simple use from other module:
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

/* Scroll lock (prevents window scrolling with menu, modals etc.)
	Use: 
		scrollLock.lock()
		scrollLock.unlock( #timeout# )
*/
const scrollLock = {
	items: document.body.children,
	init: function(){
		this.calc();
		this.recalc();
		window.addEventListener('resize', this.calc.bind(this));
	},
	calc: function() {
		this.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
	},
	recalc: function() {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].style.paddingRight = '';
			this.items[i].basePadding = getComputedStyle(this.items[i]).paddingRight.slice(0,-2) * 1;
		}
	},
	lock: function() {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].style.paddingRight = this.items[i].basePadding + this.scrollbarWidth + 'px';
		}
		document.body.classList.add('_locked');
	},
	unlock: function(timeout = 0) {
		let that = this;
		setTimeout(function(){
			for (let i = 0; i < that.items.length; i++) {
				that.items[i].style.paddingRight = that.items[i].basePadding + 'px';
			}
			document.body.classList.remove('_locked');
		}, timeout);
	}
}
scrollLock.init()

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
		mobSwitchW: mobileSwitchWidth,
		translock: transitionLock,
		scrlock: scrollLock
	},
	init: function(params = {}) {
		this.elem = document.querySelector('.header');
		let timeout = getComputedStyle(document.body).getPropertyValue('--timer-menu').slice(0,-1)*1000 || 0;
		if (params.menu) this.menu.init(this, timeout);
		if (params.submenu) this.submenu.init(this, timeout);
		if (params.hidingHeader) window.addEventListener('load', () => this.hidingHeader.init(this));
	},

	// Menu
	menu: {
		refs: {
			sm: 'submenu',
			hh: 'hidingHeader'
		},
		isLoaded: false,
		init: function(that, timeout) {
			this.isLoaded = true;
			this.root = that;
			this.timeout = timeout;
			this.element = document.querySelector('.header__hiding-menu');
			this.buttons = document.querySelectorAll('.menu-open-btn, .menu-close-btn, .menu-turn-off-area');
			let newMenu = document.getElementsByClassName('menu__items')[0];
			let options = headerMenuOptions || null;
			if (options) {
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
			}
			options.elem = document.querySelector('#headerMenuOptions');
			options.elem.parentElement.removeChild(options.elem);
			for (let i = 0; i < this.buttons.length; i++) {
				this.buttons[i].addEventListener('click', this.toggle.bind(this));
			}
		},
		toggle: function(e) {
			if (!this.isLoaded) return;
			if (this.root.refs.translock.check(this.timeout)) return;
			
			if (this.element.classList.contains('_active')) {
				this.element.classList.remove('_active');
				for (let i = 0; i < this.buttons.length; i++) {
					this.buttons[i].classList.remove('_active');
				}
				this.root.refs.scrlock.unlock(this.timeout);
			}
			else {
				if (e) {
					this.element.classList.add('_active');
					for (let i = 0; i < this.buttons.length; i++) {
						this.buttons[i].classList.add('_active');
					}
					this.root.refs.scrlock.lock();
					if (this.root[this.refs.hh].isLoaded) this.root[this.refs.hh].scroll(0, true);
				}
			}
			// submenu close
			if (this.root[this.refs.sm].isLoaded && this.root[this.refs.sm].list.classList.contains('_visible')) {
				this.root[this.refs.sm].link.classList.remove('_active');
				this.root[this.refs.sm].list.classList.remove('_visible');
			}
		}
	},
	// /Menu

	// SubMenu
	submenu: {
		isLoaded: false,
		init: function(that, timeout){
			this.isLoaded = true;
			this.root = that;
			this.timeout = timeout;
			this.link = document.querySelector('._drop-link'); // if many?
			this.list = document.querySelector('.menu__dropdown');
			this.backButton = document.querySelector('.menu-back-btn');
			this.backButton.addEventListener('click', this.close);
			this.updateEvents();
		},
		open: function(e) {
			e.preventDefault();
			this.link.classList.add('_active');
			this.list.classList.add('_visible');
		},
		close: function() {
			this.link.classList.remove('_active');
			this.list.classList.remove('_visible');
		},
		updateEvents: function() {
			if (!this.isLoaded) return;
			if (window.innerWidth <= this.root.refs.mobSwitchW) {
				this.link.removeEventListener('mouseover', this.open);
				this.root.elem.removeEventListener('mouseleave', this.close);
				this.link.addEventListener('click', this.open);
			}
			else {
				this.link.addEventListener('mouseover', this.open);
				this.root.elem.addEventListener('mouseleave', this.close);
				this.link.removeEventListener('click', this.open);
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
			this.visiblePosition = Number(getComputedStyle(this.root.elem).top.slice(0,-2));
			this.hiddenPosition = this.root.elem.offsetHeight * -1;
			this.calc();
			window.addEventListener('scroll', this.scroll.bind(this));
		},
		calc: function() {
			if (!this.isLoaded) return;
			this.Y = this.YPrev = pageYOffset;
			this.diff = 0;
			this.currentPos = this.visiblePosition;
			this.root.elem.style.top = this.currentPos + 'px';
		},
		scroll: function(e, click) {
			if (window.innerWidth > this.root.refs.mobSwitchW) return;
			if (click) {
				this.root.elem.style.top = this.visiblePosition + 'px';
				this.currentPos = this.visiblePosition;
				return;
			}
			// lazyLoadFix check
			if ((pageYOffset < (this.Y + this.diff) && this.Y > this.YPrev) || (pageYOffset > (this.Y + this.diff) && this.Y < this.YPrev)) {
				this.diff = pageYOffset - this.Y;
			}
			
			this.YPrev = this.Y;
			this.Y = pageYOffset - this.diff;
			this.currentPos -= this.Y - this.YPrev;
			if (this.currentPos > this.visiblePosition) this.currentPos = this.visiblePosition;
			if (this.currentPos < this.hiddenPosition) this.currentPos = this.hiddenPosition;
			this.root.elem.style.top = this.currentPos + 'px';
		}
	},
	// /Hiding Header
}
header.init({
	menu: true,
	submenu: false,
	hidingHeader: false
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Send form to email
	Params:
	1) demo mode: all checks and response messages, but disabled php (default = false)
*/
const formToEmail = {

	messages: {
		ok: 'Your message has been sent',
		okDemo: 'Your message has been sent (demo)',
		error: 'Error when sending a message',
		emptyReqField: 'Fill in the required fields, please',
		incorrectName: 'Incorrect name',
		incorrectPhone: 'Incorrect phone number',
		incorrectEmail: 'Incorrect email',
	},
	
	init: function(demo = false){
		this.demo = demo;
		this.inputs = document.querySelectorAll('form input, form textarea');
		for (let i = 0; i < this.inputs.length; i++) {
			this.inputs[i].addEventListener('input', function(){
				this.classList.remove('_error');
			})
			if (this.inputs[i].getAttribute('name') == 'phone') {
				this.inputs[i].addEventListener("input", this.editPhoneByMask, false);
				this.inputs[i].addEventListener("focus", this.editPhoneByMask, false);
				this.inputs[i].addEventListener("blur", this.editPhoneByMask, false);
				this.inputs[i].addEventListener("keydown", this.editPhoneByMask, false)
			}
		}
		for (let i = 0; i < document.forms.length; i++) {
			document.forms[i].addEventListener('submit', this.send.bind(this));
		}
	},

	send: async function(e) {
		e.preventDefault();
		let report = e.target.querySelector('.form-report');
		report.classList.remove('ok');
		report.classList.remove('er');

		let errors = this.check(e.target);
		if (errors[0]) {
			report.classList.add('er');
			if (errors[0] == 1)
				report.innerHTML = errors[1][0];
			else
				report.innerHTML = this.messages.emptyReqField;
			return;
		}
		else report.innerHTML = '';

		let formData = new FormData(e.target);
		formData.append('form', e.target.getAttribute('name'));
		// Add elems that ignored by new FormData 
		this.addCustomInputs(e, formData, 'input-range');
		// /

		this.log(formData); // Console log to check the correctness

		e.target.classList.add('_sending');
		let response;

		if (this.demo) { // demo code
			response = await new Promise(function(resolve, reject) {
				setTimeout(() => resolve(), 2000);
			});
			response = {ok: true};
		}
		else {
			response = await fetch('php/sendmail.php', {
				method: 'POST',
				body: formData
			});
		}
		if (response.ok) {
			report.classList.add('ok');
			if (this.demo) report.innerHTML = this.messages.okDemo;
			else report.innerHTML = this.messages.ok;
			this.clean(e.target, false);
		}
		else {
			report.classList.add('er');
			report.innerHTML = this.messages.error;
		}
		e.target.classList.remove('_sending');
	},

	check: function(form) {
		let errors = [];
		let inputs = form.querySelectorAll('input, textarea');
		for (let i = 0; i < inputs.length; i++) {
			inputs[i].classList.remove('_error');
			if (inputs[i].classList.contains('_req') && inputs[i].value == '') {
				inputs[i].classList.add('_error');
				errors.push(this.messages.emptyReqField);
				continue;
			}
			switch (inputs[i].getAttribute('name')) {
				case 'name':
					if (inputs[i].value && /^.{2,}$/.test(inputs[i].value) == false) {
						inputs[i].classList.add('_error');
						errors.push(this.messages.incorrectName);
					}
					break;
				case 'email':
					if (inputs[i].value && /^[a-zA-Z-.]{3,}@[a-z]{3,}\.[a-z]{2,5}$/.test(inputs[i].value) == false) {
						inputs[i].classList.add('_error');
						errors.push(this.messages.incorrectEmail);
					}
					break;
				case 'phone':
					// if (inputs[i].value && /^[0-9]{10,}$/.test(inputs[i].value) == false) {
					if (inputs[i].value && /^\+\d\s\(\d{3}\)\s\d{3}(-\d\d){2}$/.test(inputs[i].value) == false) {
						inputs[i].classList.add('_error');
						errors.push(this.messages.incorrectPhone);
					}
					break;
			}
		}
		return [errors.length, errors];
	},

	log: function(formData) {
		for (let pair of formData.entries()) {
			console.log(pair[0] + ': ' + pair[1]);
		}
	},

	addCustomInputs: function(e, form, elemName) {
		let elem = e.target.querySelectorAll('.' + elemName);
		for (let i = 0; i < elem.length; i++) {
			form.append(elem[i].getAttribute('name'), elem[i].getAttribute('value'));
		}
	},

	clean: function(form, all = true) {
		if (!form) return;
		let inputs = form.querySelectorAll('input, textarea');
		for (let i = 0; i < inputs.length; i++) {
			if (inputs[i].hasAttribute('name'))
				inputs[i].value = '';
			if (all) inputs[i].classList.remove('_error');
		}
		if (all) {
			let report = form.querySelector('.form-report');
			report.classList.remove('ok');
			report.classList.remove('er');
			report.innerHTML = '';
		}
	},

	// Phone mask
	editPhoneByMask: function(event) {
		event.keyCode && (keyCode = event.keyCode);
		var pos = this.selectionStart;
		if (pos < 3) event.preventDefault();
		var matrix = "+7 (___) ___-__-__",
			i = 0,
			def = matrix.replace(/\D/g, ""),
			val = this.value.replace(/\D/g, ""),
			new_value = matrix.replace(/[_\d]/g, function(a) {
				return i < val.length ? val.charAt(i++) || def.charAt(i) : a
			});
		i = new_value.indexOf("_");
		if (i != -1) {
			i < 5 && (i = 3);
			new_value = new_value.slice(0, i)
		}
		var reg = matrix.substr(0, this.value.length).replace(/_+/g,
			function(a) {
				return "\\d{1," + a.length + "}"
			}).replace(/[+()]/g, "\\$&");
		reg = new RegExp("^" + reg + "$");
		if (!reg.test(this.value) || this.value.length < 5 || keyCode > 47 && keyCode < 58) this.value = new_value;
		if (event.type == "blur" && this.value.length < 5)  this.value = ""
	},

}
formToEmail.init(true);

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

		this.header = this.elem.querySelector('.select__header-text');
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
		this.listMinHeight = 0;
		this.hideList();
		let that = this;
		for (let i = 0; i < this.options.length; i++) {
			this.options[i].addEventListener('click', function() {
				that.selectItem(event, that, i);
			});
		};

		if (params.firstOptSelected) {
			this.header.innerHTML = this.options[0].innerHTML;
			this.options[0].classList.add('_selected');
			this.basicSelect[0].parentElement.removeChild(this.basicSelect[0]);
		}
		else {
			this.header.innerHTML = this.basicSelect[0].innerHTML;
		}
		this.onselect = params.onselect || function(selection){};
	}
	hideList(e) {
		this.list.style.height = this.listMinHeight + 'px';
		this.header.classList.remove('_active');
		this.list.classList.remove('_active');
		this.header.parentElement.addEventListener('click', this.showList.bind(this), {once: true});
	}
	showList(e) {
		e.stopPropagation();
		this.list.style.height = this.listMaxHeight + 'px';
		this.header.classList.add('_active');
		this.list.classList.add('_active');
		window.addEventListener('click', this.hideList.bind(this), {once: true});
	}
	selectItem(e, that, i) {
		for (let j = 0; j < e.target.parentElement.children.length; j++) {
			e.target.parentElement.children[j].classList.remove('_selected');
			that.basicSelect[j].removeAttribute('selected');
		}
		e.target.classList.add('_selected');
		that.basicSelect[i+1].setAttribute('selected', 'true');
		that.onselect(that.basicSelect[i+1].value);
		that.header.innerHTML = e.target.innerHTML;
	}
}
let catalog_select = new Select({
	elem: 'catalog__select', 
	firstOptSelected: true,
	onselect: (selection) => {
		gridSlider.filter(mainProductFilter.genre, selection);
		window.scrollTo({top: 0});
	}
})

///////////////////////////////////////////////////////////////////////////////////////////

/* Random
	Use: getRandom(min = 0, max = 99)
*/
function getRandom(min = 0, max = 99) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

///////////////////////////////////////////////////////////////////////////////////////////

// Swiper simple (Single Swiper in a project)
const swiper = new Swiper('.swiper', {
	navigation: {
		prevEl: '.swiper-button-prev',
		nextEl: '.swiper-button-next'
	},
	loop: true,
	loopAdditionalSlides: 2,
	speed: 800,
	spaceBetween: 15,
	autoplay: {
		delay: 5000,
		disableOnInteraction: false,
		pauseOnMouseEnter: true
	},
});

///////////////////////////////////////////////////////////////////////////////////////////

/* JSON Load (loads data from .json file & returns Promise)
	Params:
	1) file path (example: 'content/news.json')
*/
// To do: добавить построение html кода из json файла (как initVirtual в teveres)
async function jsonLoad(filepath) {
	if (!filepath) return;
	let response = await fetch('./' + filepath);
	if (response.ok) {
		console.log('Loaded "' + filepath + '"');
		return response.json();
	}
	else console.log('Failed to load "' + filepath + '"');
}
// jsonLoad('books.json').then((result) => console.log(result)) // example

///////////////////////////////////////////////////////////////////////////////////////////

// Tabs
const tabsBlockButtons = document.querySelectorAll('.tabs__btn');
for (let i = 0; i < tabsBlockButtons.length; i++) {
	tabsBlockButtons[i].addEventListener('click', function() {
		let buttons = this.parentElement.children,
			content = this.parentElement.nextElementSibling.children;
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

///////////////////////////////////////////////////////////////////////////////////////////

// Data settings
let addressLink = location.href;
let mainProductFilter = {}, 
	dynamicFill = {product: {}, also: []};

dynamicFill.genres = ['children','science_fiction','fantasy','mystery','romance','horror','poetry','literature']

dynamicFill.searchItem = function(data) {
	let result;
	for (let i = 0; i < data.length; i++) {
		if (data[i].id && data[i].id == mainProductFilter.id) {
			result = data[i];
			break;
		}
	}
	return result;
}
dynamicFill.fillInfo = function(elem, data) {
	function setParam(elem, dataset, data) {
		switch(dataset) {
			case 'genre': 
				elem.innerHTML = data.genre;
				elem.setAttribute('href', 'index.html?genre=' + data.genre);
				break;
			case 'categories': elem.dataset.categories = data.categories; break;
			case 'title': elem.innerHTML = data.title; break;
			case 'price': elem.innerHTML = data.price; break;
			case 'discount': if (!data.discount) elem.classList.add('_hidden'); break;
			case 'link': elem.setAttribute('href', data.link + '?id=' + data.id); break;
			case 'image': elem.src = data.image; break;
			case 'description': elem.innerHTML = data.description; break;
			case 'info': elem.innerHTML = data.info; break;
			case 'details': elem.innerHTML = data.details; break;
		}
	}
	function scan(elem, data) {
		if (elem.dataset.dynamic) {
			let pat = elem.dataset.dynamic.split(', ');
			for (let k = 0; k < pat.length; k++) {
				setParam(elem, pat[k], data);
			}
		}
		for (let j = 0; j < elem.children.length; j++) {
			scan(elem.children[j], data);
		}
	}
	if (elem && data) {
		scan(elem, data);
		return elem;
	}
	else scan(document.querySelector('.content'), dynamicFill.product);
}
dynamicFill.fillAlsoLike = function(data) {
	let max = 7, filtered = [];
	for (let i = 0; i < data.length; i++) {
		if (data[i].title == dynamicFill.product.title) continue;
		if (data[i].genre == dynamicFill.product.genre) {
			filtered.push(data[i]);
			if (filtered.length >= max) break;
		}
	}
	while (filtered.length < max) {
		let anotherGenreIndex;
		for (let i = 0; i < 999; i++) {
			anotherGenreIndex = getRandom(0, dynamicFill.genres.length);
			if (dynamicFill.genres[anotherGenreIndex] != dynamicFill.product.genre) break;
		}
		for (let i = 0; i < data.length; i++) {
			if (data[i].title == dynamicFill.product.title) continue;
			if (data[i].genre == dynamicFill.genres[anotherGenreIndex]) {
				filtered.push(data[i]);
				if (filtered.length >= max) break;
			}
		}
	}

	let elem = document.querySelector('.also-like__items');
	let pattern = elem.children[0];
	elem.innerHTML = '';
	let newElem = [];
	for (let i = 0; i < filtered.length; i++) {
		newElem[i] = pattern.cloneNode(true);
		elem.appendChild(newElem[i]);
	}
	for (let i = 0; i < elem.children.length; i++) {
		elem.children[i] = dynamicFill.fillInfo(elem.children[i], filtered[i]);
	}
}

if (addressLink.match(/\?/)) {
	let dataTemp = addressLink.split('?');
	dataTemp = dataTemp[1].split('&');
	for (let i = 0; i < dataTemp.length; i++) {
		let item = dataTemp[i].split('=');
		mainProductFilter[item[0]] = item[1];
	}
	// page-home
	if (mainProductFilter.genre) {
		let categoriesLinks = document.querySelectorAll('.side-menu a, .menu__link');
		for (let i = 0; i < categoriesLinks.length; i++) {
			if (categoriesLinks[i].getAttribute('href').match(mainProductFilter.genre))
				categoriesLinks[i].classList.add('this-page');
		}
	}
	// page-book
	if (mainProductFilter.id) {
		jsonLoad('books_info.json').then((result) => {
			Object.assign(dynamicFill.product, dynamicFill.searchItem(result));
			jsonLoad('books_catalog.json').then((result) => {
				Object.assign(dynamicFill.product, dynamicFill.searchItem(result));
				dynamicFill.fillInfo();
				dynamicFill.fillAlsoLike(result);
			});
		});
	}
}
else {
	mainProductFilter.genre = 'all';
	if (document.querySelector('#default_link')) //?
		document.querySelector('#default_link').classList.add('this-page');
}

///////////////////////////////////////////////////////////////////////////////////////////

// Category button
const categoriesBtn = {
	menu: document.querySelector('.side-menu'),
	init: function() {
		this.menu.querySelector('.side-menu__header').addEventListener('click', this.toggle.bind(this));
		window.addEventListener('click', this.turnOff.bind(this));
	},
	toggle: function() {
		if (this.menu.classList.contains('_visible')) scrollLock.unlock();
		else scrollLock.lock();
		this.menu.classList.toggle('_visible');
	},
	turnOff: function(e) {
		if (e && e.target.closest('.side-menu')) return;
		if (this.menu && this.menu.classList.contains('_visible')) {
			scrollLock.unlock();
			this.menu.classList.remove('_visible');
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////

// Grid-slider
const gridSlider = {
	refs: { // dependences
		recounter: recounter
	},
	names: {
		slider: 'gridslider__slider',
		wrapper: 'gridslider__wrapper',
		slide: 'gridslider__slide',
		navigation: 'gridslider__nav',
		pagination: 'gridslider__pagination',
		pagination_btn: 'pagination__button',
		next_btn: 'gridslider__btn-right',
		more_btn: 'gridslider__btn-more',
		select: 'gridslider__select',
		image: 'product__cover img'
	},

	init: function() {
		this.options = {
			src: 'books_catalog.json',
			type: 'books',
			slideSize: [10, 12, 12, 15, 12, 15] // There is 1 more index than Recounter's number of breakpoints
		};
		this.slider = document.querySelector('.' + this.names.slider);
		this.wrapper = document.querySelector('.' + this.names.wrapper);
		this.pagination = {elem: document.querySelector('.' + this.names.pagination)};
		// document.querySelector('.' + this.names.next_btn).addEventListener('click', this.slideTo.bind(this));
		document.querySelector('.' + this.names.more_btn).addEventListener('click', this.addMore.bind(this));
		window.addEventListener('resize', this.resizeSlide.bind(this));

		this.getPattern();

		jsonLoad(this.options.src).then((result) => {
			this.slidesData = result;
			this.buildSlides(true);

			if (Object.keys(mainProductFilter).length > 0)
				gridSlider.filter(mainProductFilter.genre);
		});
	},

	buildSlides: function() {
		// Checking conditions
		if (!this.slider) return;

		// Building slides
		let wrpr = [], pagi = [], itemIndex = 0, slideIndex = 0;
		let slideSize = this.options.slideSize[this.refs.recounter.stateIndex];
		if (slideSize === undefined) {
			console.log('Error: gridSlider slideSize incorrect');
			slideSize = this.options.slideSize[0];
		}
		let slidesData = this.fillPattern(this.options.type,
								this.options.modif, 
								this.slidesDataFilter ? this.slidesDataFilter : this.slidesData,
								true,
								false);
		while (itemIndex < slidesData.length) {
			let slide = [];
			for (let i = 0; i < slideSize; i++) {
				slide.push(slidesData[itemIndex]);
				itemIndex++;
				if (itemIndex == slidesData.length) break;
			}
			slideIndex++;
			wrpr.push('<div class="' + this.names.slide + '">' + slide.join('') + '</div>');
			pagi.push('<div class="' + this.names.pagination_btn + '">' + slideIndex + '</div>');
		}
		this.wrapper.innerHTML = wrpr.join('');

		// Building pagination
		if (pagi.length > 7) {
			let pagiEnd = pagi.splice(pagi.length - 2, 2);

			let newPagiWrapper = document.createElement('div');
			newPagiWrapper.className = 'pagination__wrapper';
			this.pagination.main = document.createElement('div');
			this.pagination.main.className = 'pagination__main';
			newPagiWrapper.appendChild(this.pagination.main);
			this.pagination.suffix = document.createElement('div');
			this.pagination.suffix.className = 'pagination__suffix';
			this.pagination.elem.innerHTML = '';
			this.pagination.elem.appendChild(newPagiWrapper);
			this.pagination.elem.appendChild(this.pagination.suffix);

			this.pagination.main.innerHTML = pagi.join('');
			this.pagination.suffix.innerHTML = pagiEnd.join('');
			this.pagination.suffix.children[0].classList.add('_inactive');
		}
		else {
			this.pagination.elem.innerHTML = pagi.join('');
		}
		this.pagination.position = 0;
		let pagiBtn = document.querySelector('.' + this.names.pagination_btn);
		if (pagiBtn)
			this.pagination.btnWidth = Number(getComputedStyle(pagiBtn).width.slice(0,-2)) +
												Number(getComputedStyle(pagiBtn).marginRight.slice(0,-2));
		this.pagination.buttons = this.pagination.elem.querySelectorAll('.' + this.names.pagination_btn);
		for (let i = 0; i < this.pagination.buttons.length; i++) {
			this.pagination.buttons[i].addEventListener('click', this.slideTo.bind(this));
		}

		// Some resets
		this.activeIndex = 0;
		document.querySelector('.' + this.names.navigation).classList.remove('_hidden');
		if (this.activeIndex >= this.pagination.buttons.length - 1)
			document.querySelector('.' + this.names.navigation).classList.add('_hidden');
		this.slideTo();
	},

	resizeSlide: function() { // adaptivity emulation
		if (window.innerWidth > mobileSwitchWidth) {
			for (let i = 0; i < this.wrapper.children.length; i++) {
				this.wrapper.children[i].style.width = getComputedStyle(this.slider).width;
			}
		}
		else {
			for (let i = 0; i < this.wrapper.children.length; i++) {
				this.wrapper.children[i].style.width = '';
			}
		}
	},

	slideTo: function(e) {
		if (e) {
			if (e.currentTarget.classList.contains(this.names.next_btn)) {
				if (this.activeIndex < this.pagination.buttons.length - 1) this.activeIndex++;
				else return;
			}
			else this.activeIndex = e.currentTarget.innerHTML - 1;
		}
		for (let i = 0; i < this.pagination.buttons.length; i++) {
			this.pagination.buttons[i].classList.remove('_active');
			if (this.pagination.buttons[i].innerHTML == this.activeIndex + 1) 
				this.pagination.buttons[i].classList.add('_active');
		}
		this.wrapper.style.left = this.activeIndex * -100 + '%';
		this.lazyLoad();
		if (this.pagination.main) this.slideToCollapsed();
	},

	slideToCollapsed: function() {
		if (this.activeIndex > 2 && this.activeIndex < this.pagination.buttons.length - 5) {
			this.pagination.position = (this.activeIndex - 2) * -this.pagination.btnWidth;
		}
		else {
			if (this.activeIndex <= 2) {
				this.pagination.position = 0;
			}
			if (this.activeIndex >= this.pagination.buttons.length - 5) {
				this.pagination.position = (this.pagination.buttons.length - 7) * -this.pagination.btnWidth;
				this.pagination.suffix.children[0].classList.remove('_inactive');
			}
		}
		if (this.activeIndex < this.pagination.buttons.length - 5) 
			this.pagination.suffix.children[0].classList.add('_inactive');

		this.pagination.main.style.left = this.pagination.position + 'px';
	},

	addMore: function() {
		let position = pageYOffset; // stopscroll

		this.wrapper.children[++this.activeIndex].classList.add('_visible');
		if (this.activeIndex >= this.pagination.buttons.length - 1)
			document.querySelector('.' + this.names.navigation).classList.add('_hidden');

		window.scrollTo({top: position, behavior: 'instant'}) // stopscroll

		this.lazyLoad();

		// *stopscroll - to avoid window scroll after adding new items
	},

	lazyLoad: function() {
		if (this.wrapper.children.length == 0) return;
		let image = this.wrapper.children[this.activeIndex].querySelectorAll('.' + this.names.image);
		if (image[0].src == image[0].dataset.src) return;
		for (let i = 0; i < image.length; i++) {
			if (image[i].dataset.src)image[i].src = image[i].dataset.src;
			if (image[i].dataset.srcset) image[i].srcset = image[i].dataset.srcset;
			image[i].addEventListener('load', function(){
				this.parentElement.querySelector('.image-loader').style.display = 'none';
			})
		}
	},

	filter: function(genre, category) {
		this.slidesDataFilter = [];
		if (!genre) return;
		if (!category) category = document.querySelector('.cat-tabs__panel').children[0].dataset.category;
		if (genre == 'all') {
			this.slidesDataFilter = this.slidesData;
		}
		else {
			for (let i = 0; i < this.slidesData.length; i++) {
				if (this.slidesData[i].genre == genre)
					this.slidesDataFilter.push(this.slidesData[i]);
			}
		}
		let catFilter = [];
		for (let i = 0; i < this.slidesDataFilter.length; i++) {
			if (this.slidesDataFilter[i].categories.includes(category))
				catFilter.push(this.slidesDataFilter[i]);
		}
		this.slidesDataFilter = catFilter;
		this.buildSlides(true);
	},

	getPattern: function() {
		this.slidePattern = {
			books: document.querySelector('#books-data-pattern'),
		};
		for (let item in this.slidePattern) {
			if (this.slidePattern[item])
				this.slidePattern[item].parentElement.innerHTML = '';
		}
	},

	fillPattern: function(name, cls, data, lazy, retina) {
		function setParam(elem, dataset, data) {
			switch(dataset) {
				case 'genre': elem.dataset.genre = data.genre; break;
				case 'categories': elem.dataset.categories = data.categories; break;
				case 'title': elem.innerHTML = data.title; break;
				case 'price': elem.innerHTML = data.price; break;
				case 'discount': if (!data.discount) elem.classList.add('_hidden'); break;
				case 'link': elem.setAttribute('href', data.link + '?id=' + data.id); break;
				case 'image':
					if (lazy) {
						elem.dataset.src = data.image;
						if (retina) elem.dataset.srcset = data.image.replace('.','@2x.') + ' 2x';
					}
					else {
						elem.src = data.image;
						if (retina) elem.srcset = data.image.replace('.','@2x.') + ' 2x';
					}
					break;
			}
		}
		function scan(elem, data) {
			if (elem.dataset.pattern) {
				let pat = elem.dataset.pattern.split(', ');
				for (let k = 0; k < pat.length; k++) {
					setParam(elem, pat[k], data);
				}
			}
			for (let j = 0; j < elem.children.length; j++) {
				scan(elem.children[j], data);
			}
		}
		if (!this.slidePattern[name]) return;
		let slide = [];
		for (let i = 0; i < data.length; i++) {
			let clone = this.slidePattern[name].cloneNode(true);
			scan(clone, data[i]);
			slide.push(clone.innerHTML);
		}
		return slide;
	}
}


// Grid-slider Tabs
const gridSliderTabs = document.querySelectorAll('.cat-tabs__panel-item');
for (let i = 0; i < gridSliderTabs.length; i++) {
	gridSliderTabs[i].addEventListener('click', function() {
		for (let i = 0; i < gridSliderTabs.length; i++) {
			gridSliderTabs[i].classList.remove('_active');
		}
		this.classList.add('_active');
		gridSlider.filter(mainProductFilter.genre, this.dataset.category);
	})
}

///////////////////////////////////////////////////////////////////////////////////////////

// Module check & load (2 variants)
function moduleCheckAndLoad() {
	// delayed loading
	window.addEventListener('load', () => {
		let delayed = [
			['.gridslider__slider',()=> {gridSlider.init()}],
		];
		for (let i = 0; i < delayed.length; i++) {
			if (document.querySelector(delayed[i][0])) delayed[i][1]();
		}
	})
	// instant loading
	let instant = [
		['.side-menu',()=> {categoriesBtn.init()}]
	];
	for (let i = 0; i < instant.length; i++) {
		if (document.querySelector(instant[i][0])) instant[i][1]();
	}
}
moduleCheckAndLoad();
