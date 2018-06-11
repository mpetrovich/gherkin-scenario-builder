var isActive = false;
var isRecordingByTab = {};
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
		notifyPage({ action: request.action, ...response });
	}
	else if (request.action === 'getRecording') {
		response = { isRecording: isRecordingByTab[sender.tab.id] || false };
	}
	else if (request.action === 'setRecording') {
		isRecordingByTab[sender.tab.id] = request.isRecording;
		response = { isRecording: isRecordingByTab[sender.tab.id] };
	}
	else if (request.action === 'getSteps') {
		const steps = stepsByTab[sender.tab.id] || [];
		response = { steps };
	}
	else if (request.action === 'setSteps') {
		stepsByTab[sender.tab.id] = request.steps;
		response = { steps: stepsByTab[sender.tab.id] };
	}
	else {
		response = {};
	}

	sendResponse(response);

	console.log('response', response);
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {
	const { tabId, url } = details;
	const isRecording = isRecordingByTab[tabId];

	const anchor = document.createElement('a');
	anchor.href = url;
	const path = anchor.pathname;

	if (isActive && isRecording && url !== 'about:blank') {
		notifyPage({ action: 'navigate', url, path }, tabId);
	}
});

function notifyPage(data, tabId = null) {
	console.log('dispatch', data);
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabId || tabs[0].id, data);
	});
}
