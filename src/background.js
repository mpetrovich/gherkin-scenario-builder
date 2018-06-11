var isActive = false;
var stepsByTab = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	console.log('request', request);

	let response;

	if (request.action === 'getActive') {
		response = { isActive };
	}
	else if (request.action === 'setActive') {
		isActive = request.isActive;
		response = { isActive };
	}
	else if (request.action === 'getSteps') {
		const steps = stepsByTab[sender.tab.id] || [];
		response = { steps };
	}
	else if (request.action === 'setSteps') {
		stepsByTab[sender.tab.id] = request.steps;
		response = {};
	}
	else {
		response = {};
	}

	sendResponse(response);
	notifyPage({ action: request.action, ...response });

	console.log('response', response);
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {
	const { tabId, url } = details;

	if (!isActive || url === 'about:blank') {
		return;
	}

	notifyPage({ action: 'navigate', url }, tabId);
});

function notifyPage(data, tabId = null) {
	console.log('dispatch', data);
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabId || tabs[0].id, data);
	});
}
