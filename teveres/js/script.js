// Some modules use this variable to check mobile or desktop view.
const mobileSwitchWidth = 910;

// Recounter (Checks window resizing and run funcs on breakpoints)
let recounter = {
	breakpoints: {
		668: () => {
			myBigSlider.buildSlides();
		},
		910: () => {
			if (headerMenu.element.classList.contains('_active')) headerMenu.toggle();
			hidingHeader.init();
			submenu.updateEvents();
			myBigSlider.buildSlides(true);
		}, 
		1228: () => {
			myBigSlider.buildSlides();
		}
	},
}
recounter.check = function(e, init = false) {
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
recounter.init = function() {
	this.breakpoints.keys = Object.keys(this.breakpoints);
	for (let i = 0; i < this.breakpoints.keys.length; i++) {
		this.breakpoints.keys[i] = Number(this.breakpoints.keys[i]);
	}
	this.breakpoints.keys.push(0);
	this.breakpoints.keys.sort((a,b) => {return a - b});
	window.addEventListener('resize', this.check.bind(this));
	this.check(0, true);
}
recounter.init();

// /

// Transition lock (prevents double-clicking on transitions, e.g. when menu slides)
let transitionLock = {
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
// /

// Scroll lock
let scrollLock = {
	initializer: null,
	items: document.body.children
};
for (let i = 0; i < scrollLock.items.length; i++) {
	scrollLock.items[i].basePadding = Number(getComputedStyle(scrollLock.items[i]).paddingRight.slice(0,-2));
}
scrollLock.calc = function() {
	scrollLock.scrollbarWidth = window.innerWidth - document.body.offsetWidth;
}
window.addEventListener('resize', scrollLock.calc);
scrollLock.calc();

scrollLock.lock = function(initializer) {
	let o = scrollLock;
	if (initializer && o.initializer == null) {
		o.initializer = initializer;
		o.initializer.basePadding = Number(getComputedStyle(o.initializer).paddingRight.slice(0,-2));
	}
	if (o.initializer)
		o.initializer.style.paddingRight = o.initializer.basePadding + o.scrollbarWidth + 'px';
	for (let i = 0; i < o.items.length; i++) {
		o.items[i].style.paddingRight = o.items[i].basePadding + o.scrollbarWidth + 'px';
	}
	document.body.classList.add('_locked');
}
scrollLock.unlock = function(initializer, timeout = 0) {
	let o = scrollLock;
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
// /

// Main menu
let headerMenu = {timeout: 400};
headerMenu.element = document.querySelector('.menu__container');
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
	
	if (o.element.classList.contains('_active')) {
		o.element.classList.remove('_active');
		for (let i = 0; i < o.buttons.length; i++) {
			o.buttons[i].classList.remove('_active');
		}
		scrollLock.unlock(o.element, o.timeout);
	}
	else {
		o.element.classList.add('_active');
		for (let i = 0; i < o.buttons.length; i++) {
			o.buttons[i].classList.add('_active');
		}
		scrollLock.lock(o.element);
		hidingHeader.scroll(0, true);
	}
	
	//new
	if (submenu.list.classList.contains('_visible')) {
		submenu.link.classList.remove('_active');
		submenu.list.classList.remove('_visible');
	}
}
for (let i = 0; i < headerMenu.buttons.length; i++) {
	headerMenu.buttons[i].addEventListener('click', headerMenu.toggle);
}
headerMenu.init();

// Hiding header
let hidingHeader = {elem: document.querySelector('.header')};
hidingHeader.visiblePosition = Number(getComputedStyle(hidingHeader.elem).top.slice(0,-2));
hidingHeader.hiddenPosition = hidingHeader.elem.offsetHeight * -1;

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
window.addEventListener('load', hidingHeader.init);
// /

// SubMenu
let submenu = {
	link: document.querySelector('._drop-link'),
	list: document.querySelector('.menu__dropdown'),
	backButton: document.querySelector('.menu-back-btn'),
	header: document.querySelector('.header')
}
submenu.open = function(e) {
	e.preventDefault();
	submenu.link.classList.add('_active');
	submenu.list.classList.add('_visible');
}
submenu.close = function() {
	submenu.link.classList.remove('_active');
	submenu.list.classList.remove('_visible');
}
submenu.updateEvents = function() {
	if (window.innerWidth <= mobileSwitchWidth) {
		this.link.removeEventListener('mouseover', this.open);
		this.header.removeEventListener('mouseleave', this.close);
		this.link.addEventListener('click', this.open);
	}
	else {
		this.link.addEventListener('mouseover', this.open);
		this.header.addEventListener('mouseleave', this.close);
		this.link.removeEventListener('click', this.open);
	}
}
submenu.backButton.addEventListener('click', submenu.close);
submenu.updateEvents();
// /


// Modal window
// Params obj: 
// - elem - element name (default = 'modal'),
// - linkName - modal link name (default = 'modal-link')
// - timeout - transition duration (default = 500)
// - on: {'modal-window': {open, close}} - events (default = none)
let modal = {};
modal.init = function(params){
	this.elemName = params.elem || 'modal';
	this.elem = document.querySelector('.' + this.elemName);
	if (!this.elem) return;
	this.timeout = params.timeout || 500;
	this.windows = this.elem.querySelectorAll('.' + this.elemName + '__window');
	this.links = document.querySelectorAll(params.linkName ? '.' + params.linkName : '.modal-link');
	let that = this;
	for (let i = 0; i < this.links.length; i++) {
		this.links[i].addEventListener('click', this.open.bind(this));
	}
	this.elem.addEventListener('click', function(e) {
		if (!e.target.closest('.' + this.elemName + '__content')) this.closeAll();
	}.bind(this))
	let closeButtons = this.elem.querySelectorAll('.' + this.elemName + '__close-button');
	for (let i = 0; i < closeButtons.length; i++) {
		closeButtons[i].addEventListener('click', this.closeThis.bind(this));
	}
	this.on = params.on || {};
}
modal.open = function(e){
	if (transitionLock.check(this.timeout)) return;
	e.preventDefault();
	let modalName = e.currentTarget.getAttribute('href').replace('#','');
	let currentModal = this.elem.querySelector('#' + modalName);
	currentModal.classList.add('_open');
	if (this.on[currentModal.id] && this.on[currentModal.id].open) this.on[currentModal.id].open(e);
	modal.check();
}
modal.closeThis = function(e){
	if (transitionLock.check(this.timeout)) return;
	let currentModal = e.target.closest('.' + this.elemName + '__window');
	currentModal.classList.remove('_open');
	if (this.on[currentModal.id] && this.on[currentModal.id].close) this.on[currentModal.id].close(e);
	modal.check();
}
modal.closeAll = function(){
	if (transitionLock.check(this.timeout)) return;
	for (let i = 0; i < this.windows.length; i++) {
		if (this.windows[i].classList.contains('_open')) {
			this.windows[i].classList.remove('_open');
			if (this.on[this.windows[i].id] && this.on[this.windows[i].id].close) this.on[this.windows[i].id].close();
		}
	}
	modal.check();
}
modal.check = function(){
	let openedWindows = 0;
	for (let i = 0; i < this.windows.length; i++) {
		if (this.windows[i].classList.contains('_open')) openedWindows++;
	}
	if (openedWindows) {
		this.elem.classList.add('_visible');
		scrollLock.lock(this.elem);
	}
	else {
		this.elem.classList.remove('_visible');
		scrollLock.unlock(this.elem, this.timeout);
	}
}
modal.init({
	timeout: 700,
	on: {
		'modal-contact': {
			close: function() {setTimeout(() => {formToEmail.clean(document.querySelector('.question-form'))}, 700)}
		},
		'modal-order': {
			close: function() {setTimeout(() => {formToEmail.clean(document.querySelector('.question-form'))}, 700)}
		},
		'modal-imgpreview': {
			open: function(e) {
				let source = e.currentTarget.children[e.currentTarget.children.length-1];
				let img = document.querySelector('#modal-imgpreview img');
				// img.src = source.src.replace('.','-preview.');
				img.src = source.getAttribute('src').replace('.','-preview.');
				if (source.srcset) img.srcset = source.srcset.replace('@2x.','-preview@2x.');
				else img.srcset = '';
			},
			close: function(e) {
				let img = document.querySelector('#modal-imgpreview img');
				setTimeout(() => {
					img.src = img.srcset = '';
				}, modal.timeout)
			},
		},
		'modal-video': {
			open: function() {setTimeout(() => {videoPlayer.play(0, 'play')}, 700)},
			close: function() {videoPlayer.play(0, 'pause')}
		}
	}
});
// /

// Send mail
// Params: demo - demo mode: all checks and response messages, but disabled php
let formToEmail = {demo: true};
formToEmail.messages = {
	ok: 'Your message has been sent',
	okDemo: 'Your message has been sent (demo)',
	error: 'Error when sending a message',
	emptyReqField: 'Fill in the required fields, please',
	incorrectName: 'Incorrect name',
	incorrectPhone: 'Incorrect phone number',
	incorrectEmail: 'Incorrect email',
};
formToEmail.inputs = document.querySelectorAll('form input');
for (let i = 0; i < formToEmail.inputs.length; i++) {
	formToEmail.inputs[i].addEventListener('input', function(){
		this.classList.remove('_error');
	})
}
formToEmail.send = async function(e) {
	e.preventDefault();
	let report = e.target.querySelector('.question-form__report');
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
}
formToEmail.check = function(form) {
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
	// console.log(errors);
	return [errors.length, errors];
}
formToEmail.log = function(formData) {
	for (let pair of formData.entries()) {
		console.log(pair[0] + ': ' + pair[1]);
	}
}
formToEmail.addCustomInputs = function(e, form, elemName) {
	let elem = e.target.querySelectorAll('.' + elemName);
	for (let i = 0; i < elem.length; i++) {
		form.append(elem[i].getAttribute('name'), elem[i].getAttribute('value'));
	}
}
formToEmail.clean = function(form, all = true) {
	if (!form) return;
	let inputs = form.querySelectorAll('input, textarea');
	for (let i = 0; i < inputs.length; i++) {
		if (inputs[i].hasAttribute('name'))
			inputs[i].value = '';
		if (all) inputs[i].classList.remove('_error');
	}
	if (all) {
		let report = form.querySelector('.question-form__report');
		report.classList.remove('ok');
		report.classList.remove('er');
		report.innerHTML = '';
	}
}
for (let i = 0; i < document.forms.length; i++) {
	document.forms[i].addEventListener('submit', formToEmail.send.bind(formToEmail));
}

// Phone mask
formToEmail.editPhoneByMask = function(event) {
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
}
formToEmail.phoneField = document.querySelector('.question-form__phone');
if (formToEmail.phoneField) {
	formToEmail.phoneField.addEventListener("input", formToEmail.editPhoneByMask, false);
	formToEmail.phoneField.addEventListener("focus", formToEmail.editPhoneByMask, false);
	formToEmail.phoneField.addEventListener("blur", formToEmail.editPhoneByMask, false);
	formToEmail.phoneField.addEventListener("keydown", formToEmail.editPhoneByMask, false)
}
// /

// Select
// Params: 1) element name (default = 'select'), 2) chooseFirstOpt (default = true)
function Select(elem, chooseFirstOpt = true){
	this.elemName = elem ? '.' + elem : '.select';
	this.elem = document.querySelector(this.elemName);
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
			that.setToSelected(event, that, i);
		});
		this.options[i].addEventListener('click', this.selectItem.bind(this));
	};

	if (chooseFirstOpt) {
		this.header.innerHTML = this.options[0].innerHTML;
		this.options[0].classList.add('_selected');
		this.basicSelect[0].parentElement.removeChild(this.basicSelect[0]);
	}
	else {
		this.header.innerHTML = this.basicSelect[0].innerHTML;
	}
	this.onselect = function(selection){};
};
Select.prototype.hideList = function(e){
	this.list.style.height = this.listMinHeight + 'px';
	this.header.classList.remove('_active');
	this.list.classList.remove('_active');
	this.header.parentElement.addEventListener('click', this.showList.bind(this), {once: true});
}
Select.prototype.showList = function(e){
	e.stopPropagation();
	this.list.style.height = this.listMaxHeight + 'px';
	this.header.classList.add('_active');
	this.list.classList.add('_active');
	window.addEventListener('click', this.hideList.bind(this), {once: true});
};
Select.prototype.setToSelected = function(e, that, i){
	for (let j = 0; j < e.target.parentElement.children.length; j++) {
		e.target.parentElement.children[j].classList.remove('_selected');
		that.basicSelect[j].removeAttribute('selected');
	}
	e.target.classList.add('_selected');
	that.basicSelect[i+1].setAttribute('selected', 'true');
	that.onselect(that.basicSelect[i+1].value);
};
Select.prototype.selectItem = function(){
	for (let i = 0; i < this.options.length; i++) {
		if (this.options[i].classList.contains('_selected')) {
			this.header.innerHTML = this.options[i].innerHTML;
			break;
		}
	}
};
let projects_select = new Select('mybigslider__select', false);
projects_select.onselect = function(selection) {myBigSlider.filter(selection)};
// /

// Video player
let videoPlayer = {};
// Functions are useful with swiper slides
// To do: constructor.
videoPlayer.create = function() {
	videoPlayer.video = document.querySelector('.video-player video');
	videoPlayer.window = document.querySelector('.video-controls');
	videoPlayer.playArea = document.querySelector('.video-controls__area');
	videoPlayer.playAreaBtn = document.querySelector('.video-controls__area-btn');
	videoPlayer.panel = document.querySelector('.video-controls__panel');
	videoPlayer.playBtn = document.querySelector('.video-controls__play-pause');
	videoPlayer.seekBar = document.querySelector('.video-controls__seek-bar input');
	videoPlayer.volBtn = document.querySelector('.video-controls__volume-btn');
	videoPlayer.volBar = document.querySelector('.video-controls__volume-bar input');

	videoPlayer.hidingTimeout = 0;
	if (!videoPlayer.window) return;

	videoPlayer.window.addEventListener('mousemove', videoPlayer.showOnMousemove);

	videoPlayer.playArea.addEventListener("click", videoPlayer.play);
	videoPlayer.playBtn.addEventListener("click", videoPlayer.play);

	videoPlayer.video.addEventListener("timeupdate", videoPlayer.seekBarUpdate);
	videoPlayer.seekBar.addEventListener("mousedown", videoPlayer.seekBarMousedown);
	videoPlayer.seekBar.addEventListener("mouseup", videoPlayer.seekBarMouseup);
	videoPlayer.seekBar.addEventListener("change", videoPlayer.seekBarChange);

	videoPlayer.video.volume = videoPlayer.volBar.value / 100;
	videoPlayer.volBtn.addEventListener("click", videoPlayer.mute);
	videoPlayer.volBar.addEventListener("input", videoPlayer.setVolume);
}
videoPlayer.destroy = function() {
	if (!videoPlayer.window) return;

	videoPlayer.window.removeEventListener('mousemove', videoPlayer.showOnMousemove);

	videoPlayer.playArea.removeEventListener("click", videoPlayer.play);
	videoPlayer.playBtn.removeEventListener("click", videoPlayer.play);

	videoPlayer.video.removeEventListener("timeupdate", videoPlayer.seekBarUpdate);
	videoPlayer.seekBar.removeEventListener("mousedown", videoPlayer.seekBarMousedown);
	videoPlayer.seekBar.removeEventListener("mouseup", videoPlayer.seekBarMouseup);
	videoPlayer.seekBar.removeEventListener("change", videoPlayer.seekBarChange);

	videoPlayer.volBtn.removeEventListener("click", videoPlayer.mute);
	videoPlayer.volBar.removeEventListener("input", videoPlayer.setVolume);
}

videoPlayer.showOnMousemove = function() {
	if (!videoPlayer.video) return;
	videoPlayer.panel.classList.remove('_hidden');
	clearTimeout(videoPlayer.hidingTimeout);
	if (videoPlayer.video.paused == false){// && videoPlayer.seekBar.value != 0) {
		videoPlayer.hidingTimeout = setTimeout(function() {
			if (videoPlayer.panel) videoPlayer.panel.classList.add('_hidden');
		}, 2000);
	}
}
videoPlayer.play = function(e, command) {
	if (!videoPlayer.video) return;
	function play() {
		videoPlayer.video.play();
		videoPlayer.playAreaBtn.classList.add('_hidden');
	}
	function pause() {
		videoPlayer.video.pause();
		videoPlayer.playAreaBtn.classList.remove('_hidden');
	}
	if (command) {
		if (command == 'play') play();
		if (command == 'pause') pause();
	}
	else {
		if (videoPlayer.video.paused == true) play();
		else pause();
	}
	videoPlayer.showOnMousemove();
}
videoPlayer.seekBarUpdate = function() {
	let value = (100 / videoPlayer.video.duration) * videoPlayer.video.currentTime;
	videoPlayer.seekBar.value = value;
	videoPlayer.seekBar.dispatchEvent(new Event('input'));
}
videoPlayer.seekBarMousedown = function() {
	videoPlayer.video.removeEventListener("timeupdate", videoPlayer.seekBarUpdate);
}
videoPlayer.seekBarMouseup = function() {
	videoPlayer.video.addEventListener("timeupdate", videoPlayer.seekBarUpdate);
}
videoPlayer.seekBarChange = function() {
	let time = videoPlayer.video.duration * (videoPlayer.seekBar.value / 100);
	videoPlayer.video.currentTime = time;
}
videoPlayer.mute = function() {
	if (videoPlayer.video.muted == false) {
		videoPlayer.video.muted = true;
		videoPlayer.volBtn.classList.add('_off');
		videoPlayer.volBar.value = 0;
		videoPlayer.volBar.dispatchEvent(new Event('change'));
	} else {
		videoPlayer.video.muted = false;
		videoPlayer.volBtn.classList.remove('_off');
		videoPlayer.volBar.value = videoPlayer.video.volume * 100;
		videoPlayer.volBar.dispatchEvent(new Event('change'));
	}
}
videoPlayer.setVolume = function() {
	videoPlayer.video.volume = videoPlayer.volBar.value / 100;
}
videoPlayer.create();

// myBigSlider for news & projects
let myBigSlider = {
	names: {
		slider: 'mybigslider__slider',
		wrapper: 'mybigslider__wrapper',
		slide: 'mybigslider__slide',
		navigation: 'mybigslider__nav',
		pagination: 'mybigslider__pagination',
		pagination_btn: 'pagination__button',
		next_btn: 'mybigslider__btn-right',
		more_btn: 'mybigslider__btn-more',
		select: 'mybigslider__select'
	}
};

myBigSlider.init = function() {
	if (document.querySelector('.' + this.names.slider).classList.contains('--news')) {
		this.options = {
			type: 'news',
			modif: '--white',
			slideSize: [6, 12, 6, 9]
		};
		this.names.image = 'news-card__img img';
	}
	if (document.querySelector('.' + this.names.slider).classList.contains('--projects')) {
		this.options = {
			type: 'projects',
			modif: 0,
			slideSize: [6, 6, 6, 6]
		};
		this.names.image = 'project-card__img img';
	}
	this.wrapper = document.querySelector('.' + this.names.wrapper);
	this.pagination = {elem: document.querySelector('.' + this.names.pagination)};
	document.querySelector('.' + this.names.next_btn).addEventListener('click', this.slideTo.bind(this));
	document.querySelector('.' + this.names.more_btn).addEventListener('click', this.addMore.bind(this));

	swiperCustoms.jsonLoad(this.options.type).then((result) => {
		this.slidesData = result[this.options.type];
		this.buildSlides(true);
	});
}

myBigSlider.buildSlides = function(force) {
	// Checking conditions
	if (!document.querySelector('.' + this.names.slider)) return;
	if (!force && document.querySelector('.' + this.names.slider).classList.contains('--projects')) return;

	// Building slides
	let wrpr = [], pagi = [], itemIndex = 0, slideIndex = 0;
	let slideSize = this.options.slideSize[recounter.breakpoints.keys.indexOf(recounter.state)]; // Recounter is required
	let slidesData = swiperCustoms.initVirtual(this.options.type, 
							this.options.modif, 
							this.slidesDataFilter ? this.slidesDataFilter : this.slidesData,
							true,
							true);
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
	this.pagination.btnWidth = Number(getComputedStyle(document.querySelector('.' + this.names.pagination_btn)).width.slice(0,-2)) +
										Number(getComputedStyle(document.querySelector('.' + this.names.pagination_btn)).marginRight.slice(0,-2));
	this.pagination.buttons = this.pagination.elem.querySelectorAll('.' + this.names.pagination_btn);
	for (let i = 0; i < this.pagination.buttons.length; i++) {
		this.pagination.buttons[i].addEventListener('click', this.slideTo.bind(this));
	}

	// Some resets
	this.activeIndex = 0;
	document.querySelector('.' + this.names.navigation).classList.remove('_hidden');
	this.slideTo();
}

myBigSlider.slideTo = function(e) {
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
}

myBigSlider.slideToCollapsed = function() {
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
}

myBigSlider.addMore = function() {
	this.wrapper.children[++this.activeIndex].classList.add('_visible');
	if (this.activeIndex >= this.pagination.buttons.length - 1)
		document.querySelector('.' + this.names.navigation).classList.add('_hidden');
	this.lazyLoad();
}

myBigSlider.lazyLoad = function() {
	let image = this.wrapper.children[this.activeIndex].querySelectorAll('.' + this.names.image);
	if (image[0].src == image[0].dataset.src) return;
	for (let i = 0; i < image.length; i++) {
		if (image[i].dataset.src)image[i].src = image[i].dataset.src;
		if (image[i].dataset.srcset) image[i].srcset = image[i].dataset.srcset;
		image[i].addEventListener('load', function(){
			this.parentElement.querySelector('.image-loader').style.display = 'none';
		})
	}
}

myBigSlider.filter = function(type) {
	this.slidesDataFilter = [];
	for (let i = 0; i < this.slidesData.length; i++) {
		if (this.slidesData[i].type == type)
			this.slidesDataFilter.push(this.slidesData[i]);
	}
	this.buildSlides(true);
}
// /

// Swiper
let swiperCustoms = {
	swipers: {}
};
swiperCustoms.slidePattern = {
	projects: document.querySelector('#projects-data-pattern'),
	news: document.querySelector('#news-data-pattern'),
};
if (swiperCustoms.slidePattern.projects)
	swiperCustoms.slidePattern.projects.parentElement.innerHTML = '';
if (swiperCustoms.slidePattern.news)
	swiperCustoms.slidePattern.news.parentElement.innerHTML = '';

swiperCustoms.settings = {

	projects: {
		name: 'projects',
		cls: '.projects__swiper',
		modif: ['large', 'medium'],
		init: function(that) {
			that.jsonLoad(this.name).then((result) => {
				for (let i = 0; i < this.modif.length; i++) {
					let settings = this.swiperParams[this.modif[i]];
					settings.virtual.slides = that.initVirtual(this.name, '--' + this.modif[i], result[this.name], true, true);
					that.swipers[this.name + '_' + this.modif[i]] = new Swiper(this.cls + '--' + this.modif[i], this.swiperParams[this.modif[i]]);
				}
				that.swipers.projects_large.controller.control = that.swipers.projects_medium;
			})
		},
		swiperParams: {
			large: {
				virtual: {
					addSlidesAfter: 1
				},
				navigation: {
					prevEl: '.projects-slider-btn-left',
					nextEl: '.projects-slider-btn-right'
				},
				pagination: {
					el: '.projects .arrow-navigation__counter',
					type: 'fraction',
					formatFractionCurrent: function(number) {return swiperCustoms.paginationFormat(number)},
					formatFractionTotal: function(number) {return swiperCustoms.paginationFormat(number)},
				},
				preloadImages: false,
				lazy: true,
				loadPrevNext: true,
				loadPrevNextAmount: 2,
				speed: 500,
				effect: 'fade',
				noSwipingClass: 'swiper-slide'
			},
			medium: {
				virtual: {},
				preloadImages: false,
				lazy: true,
				loadPrevNext: true,
				loadPrevNextAmount: 2,
				speed: 500,
				effect: 'fade',
				noSwipingClass: 'swiper-slide'
			}
		}
	},

	newsline: {
		name: 'news',
		subname: 'line',
		cls: '.newsline__swiper',
		init: function(that) {
			that.jsonLoad(this.name).then((result) => {
				let concat = '', 
					slides = that.initVirtual(this.name, 0, result[this.name], false, true);
				for (let i = 0; i < slides.length; i++) {
					if (i == 10) break; // no more news please
					concat += slides[i];
				}
				document.querySelector(this.cls).children[0].innerHTML = concat;
				that.swipers[this.name + this.subname] = new Swiper(this.cls, this.swiperParams);
			})
		},
		swiperParams: {
			navigation: {
				prevEl: '.newsline-slider-btn-left',
				nextEl: '.newsline-slider-btn-right'
			},
			slidesPerView: 'auto',
			spaceBetween: 11,
			speed: 500,
			loop: true,
			slidesOffsetBefore: 11,
			breakpoints: {
				1228: {
					slidesOffsetBefore: 0,
					centeredSlides: true,
					initialSlide: 1,
					spaceBetween: 30
				},
			}
		}
	},

	news_other: {
		name: 'news',
		subname: '_other',
		cls: '.othernews__swiper',
		modif: 'white',
		init: function(that) {
			that.jsonLoad(this.name).then((result) => {
				let concat = '', 
					slides = that.initVirtual(this.name, '--' + this.modif, result[this.name], false, true);
				for (let i = 0; i < slides.length; i++) {
					if (i == 10) break; // no more news please
					concat += slides[i];
				}
				document.querySelector(this.cls).children[0].innerHTML = concat;
				that.swipers[this.name + this.subname] = new Swiper(this.cls, this.swiperParams);
			})
		},
		swiperParams: {
			navigation: {
				prevEl: '.othernews-slider-btn-left',
				nextEl: '.othernews-slider-btn-right'
			},
			slidesPerView: 'auto',
			spaceBetween: 11,
			speed: 500,
			breakpoints: {
				910: {
					slidesOffsetBefore: 15,
				},
				1228: {
					slidesOffsetBefore: 0,
					spaceBetween: 30
				},
			}
		}
	},

	news_article_images: {
		name: 'news_article_images',
		cls: '.news-images__swiper',
		init: function(that) {
			that.removeLazy(this.cls);
			that.swipers[this.name] = new Swiper(this.cls, this.swiperParams)
		},
		swiperParams: {
			navigation: {
				prevEl: '.newsimgs-slider-btn-left',
				nextEl: '.newsimgs-slider-btn-right'
			},
			slidesPerView: 'auto',
			spaceBetween: 11,
			speed: 500,
			slidesOffsetBefore: 15,
			breakpoints: {
				910: {
					slidesPerView: 3,
					spaceBetween: 30,
					slidesOffsetBefore: 0
				},
			}
		}
	},

	letters: {
		name: 'letters',
		cls: '.letters__swiper',
		init: function(that) {
			that.removeLazy(this.cls);
			that.swipers[this.name] = new Swiper(this.cls, this.swiperParams)
		},
		swiperParams: {
			slideClass: 'letter',
			navigation: {
				prevEl: '.letters-slider-btn-left',
				nextEl: '.letters-slider-btn-right'
			},
			pagination: {
				el: '.letters .arrow-navigation__counter',
				type: 'fraction',
				formatFractionCurrent: function(number) {return swiperCustoms.paginationFormat(number)},
				formatFractionTotal: function(number) {return swiperCustoms.paginationFormat(number)},
			},
			slidesPerView: 'auto',
			slidesOffsetBefore: 10,
			breakpoints: {
				1199: {
					spaceBetween: 20
				},
				1420: {
					spaceBetween: 40
				}
			}
		}
	},

	licenses: {
		name: 'licenses',
		cls: '.licenses__swiper',
		init: function(that) {
			that.removeLazy(this.cls);
			that.swipers[this.name] = new Swiper(this.cls, this.swiperParams)
		},
		swiperParams: {
			slideClass: 'document',
			navigation: {
				prevEl: '.licenses-slider-btn-left',
				nextEl: '.licenses-slider-btn-right'
			},
			slidesPerView: 'auto',
			slidesOffsetBefore: 15,
			slidesOffsetAfter: 15,
			spaceBetween: 5,
			breakpoints: {
				910: {
					spaceBetween: 20
				},
				1100: {
					spaceBetween: 41
				}
			}
		}
	},

	standards: {
		name: 'standards',
		cls: '.standards__swiper',
		init: function(that) {
			that.removeLazy(this.cls);
			that.swipers[this.name] = new Swiper(this.cls, this.swiperParams)
		},
		swiperParams: {
			slideClass: 'document',
			navigation: {
				prevEl: '.standards-slider-btn-left',
				nextEl: '.standards-slider-btn-right'
			},
			pagination: {
				el: '.standards .arrow-navigation__counter',
				type: 'fraction',
				formatFractionCurrent: function(number) {return swiperCustoms.paginationFormat(number)},
				formatFractionTotal: function(number) {return swiperCustoms.paginationFormat(number)},
			},
			slidesPerView: 'auto',
			slidesOffsetBefore: 30,
			slidesOffsetAfter: 45,
			spaceBetween: 10,
			breakpoints: {
				910: {
					spaceBetween: 38,
					slidesOffsetBefore: 15,
					slidesOffsetAfter: 0,
				},
			}
		}
	},

	partners: {
		name: 'partners',
		cls: '.partners__swiper',
		init: function(that) {
			that.removeLazy(this.cls);
			this.swiperParams.loopedSlides = document.querySelector(this.cls).children[0].children.length;
			that.swipers[this.name] = new Swiper(this.cls, this.swiperParams)
		},
		swiperParams: {
			navigation: {
				prevEl: '.partners-slider-btn-left',
				nextEl: '.partners-slider-btn-right'
			},
			speed: 500,
			loop: true,
			slidesPerView: 'auto',
			spaceBetween: 15,
			breakpoints: {
				500: {
					spaceBetween: 30,
				},
				910: {
					slidesPerView: 5,
				},
				1260: {
					slidesPerView: 7,
				}
			}
		}
	}
}
swiperCustoms.initNewSwiper = function(cls) {
	if (cls) {
		for (let target in this.settings) {
			if (this.settings[target].cls == cls) {
				this.settings[target].init(this);
				break;
			}
		}
	}
}
swiperCustoms.initVirtual = function(name, cls, data, lazy, retina) {
	function setParam(elem, dataset, data) {
		switch(dataset) {
			case 'elem': 
				elem.dataset.type = data.type;
				if (cls) elem.classList.add(cls); 
				break;
			case 'title': elem.innerHTML = data.title; break;
			case 'date': elem.innerHTML = data.date; break;
			case 'loc': elem.innerHTML = data.location; break;
			case 'descr': elem.innerHTML = data.description; break;
			case 'text': elem.innerHTML = data.text; break;
			case 'link': 
				if (name == 'news' && cls != '--white')
					elem.classList.add('--white');
				elem.setAttribute('href', data.link);
				break;
			case 'img': 
				if (lazy) {
					elem.dataset.src = data.imgLink;
					if (retina) elem.dataset.srcset = data.imgLink.replace('.','@2x.') + ' 2x';
				}
				else {
					elem.src = data.imgLink;
					if (retina) elem.srcset = data.imgLink.replace('.','@2x.') + ' 2x';
				}
				break;
			case 'video':
				if (!data.video || data.video == '')
					elem.classList.add('--hidden');
				break;
		}
	}
	function scan(elem, data) {
		for (let j = 0; j < elem.children.length; j++) {
			scan(elem.children[j], data);
			if (elem.children[j].dataset.pattern) 
				setParam(elem.children[j], elem.children[j].dataset.pattern, data);
		}
	}
	if (!this.slidePattern[name]) return;
	let slide = [];
	for (let i = 0; i < data.length; i++) {
		if (i == 0 && cls == '--medium') continue;
		let clone = this.slidePattern[name].cloneNode(true);
		scan(clone, data[i]);
		slide.push(clone.innerHTML);
	}
	if (cls == '--medium') slide.push('<div class="empty-slide"></div>');
	return slide;
}

swiperCustoms.jsonLoad = async function(filename) {
	if (!filename) return;
	let response = await fetch('./' + filename + '.json');
	if (response.ok) {
		console.log('Loaded "' + filename + '.json"');
		return response.json();
	}
	else console.log('Failed to load "' + filename + '.json"');
}

swiperCustoms.paginationFormat = function(num) {
	if (num < 10) return '0' + num;
	else return num;
}

// Opera loads images inside Swiper not like I want.
// So I remove 'html loading lazy' in case that Swiper loads lazy.
swiperCustoms.removeLazy = function(cls) {
	let images = document.querySelectorAll(cls + ' img');
	for (let i = 0; i < images.length; i++) {
		images[i].removeAttribute('loading');
	}
}
// /

// Module check & load
window.addEventListener('load', () => {
	let arr = [
		['.mybigslider__slider',()=> {myBigSlider.init()}],
		['.projects__swiper',()=> {swiperCustoms.initNewSwiper('.projects__swiper')}],
		['.newsline__swiper',()=> {swiperCustoms.initNewSwiper('.newsline__swiper')}],
		['.othernews__swiper',()=> {swiperCustoms.initNewSwiper('.othernews__swiper')}],
		['.news-images__swiper',()=> {swiperCustoms.initNewSwiper('.news-images__swiper')}],
		['.standards__swiper',()=> {swiperCustoms.initNewSwiper('.standards__swiper')}],
		['.letters__swiper',()=> {swiperCustoms.initNewSwiper('.letters__swiper')}],
		['.licenses__swiper',()=> {swiperCustoms.initNewSwiper('.licenses__swiper')}],
		['.partners__swiper',()=> {swiperCustoms.initNewSwiper('.partners__swiper')}],
	];
	for (let i = 0; i < arr.length; i++) {
		if (document.querySelector(arr[i][0])) arr[i][1]();
	}
});
// /