var isActive = false;

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
	else {
		response = {};
	}

	sendResponse(response);
	notifyPage({ action: request.action, ...response });

	console.log('response', response);
});

function notifyPage(data) {
	console.log('dispatch', data);
	chrome.tabs.query({active: true, currentWindow: true}, tabs => {
		chrome.tabs.sendMessage(tabs[0].id, data);
	});
}
