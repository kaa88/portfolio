// Mobile switcher (turns off menu on window resize)
let mobileSwitchWidth = 750;
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
	items: document.body.children
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
let headerMenu = {timeout: 500};
let hidingHeader = {hiddenPosition: -100};
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
hidingHeader.elem = document.querySelector('.header');
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
window.addEventListener('load', hidingHeader.init);
// /

// Random background
// Random
function getRandom(min = 0, max = 99) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
// /

let bannerBG = document.querySelector('.banner__bg img');
switch (getRandom(0,2)) {
	case 2:
	case 0:
		bannerBG.src = 'img/banner_bg-1.jpg';
		break;
	case 1:
		bannerBG.src = 'img/banner_bg-2.jpg';
		break;
}
// /

// Swiper
const banner_swiper = new Swiper('.banner__swiper', {
	navigation: {
		nextEl: '.swiper-button-next',
		prevEl: '.swiper-button-prev',
	},
	loop: true,
	speed: 600,
	spaceBetween: 50,
});
// /

// Input range
function InputRange(params) {
	this.elemName = params.elemName || 'input-range';
	this.input = document.querySelector(this.elemName + ' input'); // no dot
	if (!this.input) return;

	this.styleElem = document.createElement('style');
	this.input.parentElement.appendChild(this.styleElem);

	this.trackColorStart = params.trackColorStart || 'var(--track-color-start)';
	this.trackColorEnd = params.trackColorEnd || 'var(--track-color-end)';

	this.input.addEventListener('input', this.fillTrack.bind(this));
	this.input.addEventListener('change', this.fillTrack.bind(this));
	this.fillTrack();
}
InputRange.prototype.fillTrack = function(e) {
	if (e) this.input.setAttribute('value', this.input.value);
	let cssNameWebkit = this.elemName + ' input::-webkit-slider-runnable-track'; // no dot
	let cssNameMoz = this.elemName + ' input::-moz-range-track'; // no dot
	let cssStyle = '{background: linear-gradient(to right,' + this.trackColorStart + ' ' + this.input.value + '%,' + this.trackColorEnd + ' ' + this.input.value + '%);}';
	this.styleElem.innerHTML = cssNameWebkit + cssStyle + cssNameMoz + cssStyle;
}
InputRange.prototype.destroy = function() {
	if (this.input) {
		let styleElem = this.input.parentElement.querySelector('style');
		styleElem.parentElement.removeChild(styleElem);
	}
}
let iRange_seek, iRange_volume;
function sliderInputsInit() {
	iRange_seek = new InputRange({
		elemName: '.swiper-slide-active .video-controls__seek-bar',
	});
	iRange_volume = new InputRange({
		elemName: '.swiper-slide-active .video-controls__volume-bar',
	});
}
sliderInputsInit();
// /

// Video player
let videoPlayer = {};

videoPlayer.create = function() {
	videoPlayer.video = document.querySelector('.swiper-slide-active .video video');
	videoPlayer.window = document.querySelector('.swiper-slide-active .video-controls');
	videoPlayer.playArea = document.querySelector('.swiper-slide-active .video-controls__area');
	videoPlayer.playAreaBtn = document.querySelector('.swiper-slide-active .video-controls__area-btn');
	videoPlayer.panel = document.querySelector('.swiper-slide-active .video-controls__panel');
	videoPlayer.playBtn = document.querySelector('.swiper-slide-active .video-controls__play-pause');
	videoPlayer.seekBar = document.querySelector('.swiper-slide-active .video-controls__seek-bar input');
	videoPlayer.volBtn = document.querySelector('.swiper-slide-active .video-controls__volume-btn');
	videoPlayer.volBar = document.querySelector('.swiper-slide-active .video-controls__volume-bar input');

	videoPlayer.hidingTimeout = 0;
	if (!videoPlayer.window) return;

	videoPlayer.window.addEventListener('mouseover', videoPlayer.showOnMouseover);
	videoPlayer.window.addEventListener('mouseleave', videoPlayer.hideOnMouseleave);

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

	videoPlayer.window.removeEventListener('mouseover', videoPlayer.showOnMouseover);
	videoPlayer.window.removeEventListener('mouseleave', videoPlayer.hideOnMouseleave);

	videoPlayer.playArea.removeEventListener("click", videoPlayer.play);
	videoPlayer.playBtn.removeEventListener("click", videoPlayer.play);

	videoPlayer.video.removeEventListener("timeupdate", videoPlayer.seekBarUpdate);
	videoPlayer.seekBar.removeEventListener("mousedown", videoPlayer.seekBarMousedown);
	videoPlayer.seekBar.removeEventListener("mouseup", videoPlayer.seekBarMouseup);
	videoPlayer.seekBar.removeEventListener("change", videoPlayer.seekBarChange);

	videoPlayer.volBtn.removeEventListener("click", videoPlayer.mute);
	videoPlayer.volBar.removeEventListener("input", videoPlayer.setVolume);
}

videoPlayer.showOnMouseover = function() {
	videoPlayer.panel.classList.remove('_hidden');
	clearTimeout(videoPlayer.hidingTimeout);
}
videoPlayer.hideOnMouseleave = function() {
	if (!videoPlayer.video) return;
	if (videoPlayer.video.paused == false && videoPlayer.seekBar.value != 0) {
		videoPlayer.hidingTimeout = setTimeout(function() {
			if (videoPlayer.panel) videoPlayer.panel.classList.add('_hidden');
		}, 2000);
	}
}
videoPlayer.play = function(e, slider) {
	if (!videoPlayer.video) return;
	if (videoPlayer.video.paused == true) {
		if (slider) return;
		videoPlayer.video.play();
		videoPlayer.playBtn.children[0].className = "icon-pause";
		videoPlayer.playAreaBtn.classList.add('_hidden');
		banner_swiper.detachEvents();
	} else {
		videoPlayer.video.pause();
		videoPlayer.playBtn.children[0].className = "icon-play";
		videoPlayer.playAreaBtn.classList.remove('_hidden');
		banner_swiper.attachEvents();
	}
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
// video init & onswipe change
videoPlayer.create();
banner_swiper.on('slideChangeTransitionStart', function () {videoPlayer.play(0, true)});
banner_swiper.on('slideChangeTransitionEnd', function () {
	if (videoPlayer.video) videoPlayer.video.load();
	if (iRange_seek.input) {
		iRange_seek.input.setAttribute('value', 0);
		iRange_seek.input.value = 0;
	}
	videoPlayer.destroy();
	iRange_seek.destroy();
	iRange_volume.destroy();
	setTimeout(function() {
		videoPlayer.create();
		sliderInputsInit();
	}, 200);
});


// Horizontal scroll (not realized)
let yMouseScroll = {elem: document.querySelector('.content-box')}
yMouseScroll.scroll = function(e) {
	this.elem.scrollLeft = 5000;
}
yMouseScroll.elem.addEventListener("click", yMouseScroll.scroll.bind(yMouseScroll));
// /

// Twitter box
let twitterBox = {
	elem: document.querySelector('.content-box__twitter'),
	messages: document.querySelector('.tweets__messages'),
	input: document.querySelector('.tweets__input input'),
	button: document.querySelector('.tweets__input button'),
	count: document.querySelector('.content-box__tweet-count')
};
twitterBox.elem.addEventListener('click', function() {
	twitterBox.elem.classList.add('_expanded');
}, {once: true});

twitterBox.add_msg = function(e) {
	if (this.input.value) {
		let newBubble = document.createElement('div');
		newBubble.classList.add('tweets__bubble');
		let newMSG = document.createElement('div');
		newMSG.classList.add('tweets__message');
		newMSG.classList.add('message');
		newMSG.innerHTML = this.input.value;
		newBubble.appendChild(newMSG);
		this.messages.insertBefore(newBubble, this.messages.children[0]);
		this.input.value = "";
	}
}
twitterBox.listen_keys = function(e) {
	if (e.code == 'Enter' || e.code == 'NumpadEnter')
		twitterBox.add_msg();
}
twitterBox.button.addEventListener('click', twitterBox.add_msg.bind(twitterBox));
twitterBox.input.addEventListener('keydown', twitterBox.listen_keys);
twitterBox.count.innerHTML = twitterBox.messages.children.length;
// /
