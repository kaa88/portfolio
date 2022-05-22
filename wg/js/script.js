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

// Call-form landscape fix
var maxWindowHeight = 720;
var formPositionBox, formPosBoxHeights = [], formFullHeight;

window.addEventListener('load', formInit);
window.addEventListener('resize', formResize);

function formInit() {
	formPositionBox = document.querySelectorAll('.form-position-box');
	formPosBoxHeights[0] = formPositionBox[0].offsetHeight;
	formPosBoxHeights[1] = formPositionBox[1].offsetHeight;
	formFullHeight = formPosBoxHeights[0] + formPosBoxHeights[1];
	formResize();
}
function formResize() {
	if (window.innerHeight < maxWindowHeight) {
		var x = formPosBoxHeights[0] - (maxWindowHeight - window.innerHeight);
		if (x < 0) x = 0;
		formPositionBox[0].style.height = x + 'px';
		formPositionBox[1].style.height = formFullHeight - x + 5 + 'px';
	}
}
//