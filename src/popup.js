var $toggle = $('.js-toggle');
var isActive;

fetchActive();

$toggle.on('click', function() {
	setActive(!isActive);
});

function setLabel(isActive) {
	$toggle
		.text(isActive ? 'ON' : 'OFF')
		.toggleClass('-active', isActive)
		.removeClass('-loading');
}

function fetchActive() {
	send('getActive', {}, response => {
		isActive = response.isActive;
		setLabel(isActive);
	});
}

function setActive(newIsActive) {
	isActive = newIsActive;
	setLabel(isActive);
	send('setActive', { isActive });
}

function send(action, params = {}, callback = () => {}) {
	chrome.runtime.sendMessage({ action: action, ...params }, callback);
}
