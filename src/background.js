var isActiveByTab = {};
var isRecordingByTab = {};
var stepsByTab = {};

const defaultOptions = {
	element_attr: 'data-test',
	value_attr: 'data-test-value',
	force_attr: 'data-test-force',
	nav_threshold: 1000,
	pages: defaultPages,
	users: defaultUsers,
	steps: defaultSteps,
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const respond = result => {
		console.log('bg.response', result);
		sendResponse(result || {});
	};

	console.log('bg.request', request);

	if (request.action === 'getOptions') {
		chrome.storage.sync.get(null, savedOptions => {
			savedOptions = _.pickBy(savedOptions, option => !!option);  // Omits empty options
			const options = _.defaults({}, savedOptions, defaultOptions);
			console.log('bg.getOptions', options);
			respond(options);
		});
	}
	else if (request.action === 'setOptions') {
		const changedOptions = _.omit(request, 'action');
		console.log('bg.setOptions', changedOptions);
		chrome.storage.sync.set(changedOptions, () => {
			chrome.storage.sync.get(null, savedOptions => {
				savedOptions = _.pickBy(savedOptions, option => !!option);  // Omits empty options
				const options = _.defaults({}, savedOptions, defaultOptions);
				respond(options);
				notifyAll({ action: request.action, ...options });
			});
		});
	}
	else if (request.action === 'getActive') {
		respond({ isActive: isActiveByTab[sender.tab.id] });
	}
	else if (request.action === 'setActive') {
		isActiveByTab[sender.tab.id] = request.isActive;
		respond({ isActive: isActiveByTab[sender.tab.id] });
		notifyAll({ action: request.action, isActive: isActiveByTab[sender.tab.id] });
	}
	else if (request.action === 'getRecording') {
		respond({ isRecording: isRecordingByTab[sender.tab.id] || false });
	}
	else if (request.action === 'setRecording') {
		isRecordingByTab[sender.tab.id] = request.isRecording;
		respond({ isRecording: isRecordingByTab[sender.tab.id] });
	}
	else if (request.action === 'getSteps') {
		const steps = stepsByTab[sender.tab.id] || [];
		respond({ steps });
	}
	else if (request.action === 'setSteps') {
		stepsByTab[sender.tab.id] = request.steps;
		respond({ steps: stepsByTab[sender.tab.id] });
	}
	else if (request.action === 'download') {
		chrome.downloads.download({
			url: request.url,
			filename: request.filename,
			saveAs: request.saveAs,
			conflictAction: request.conflictAction,
		});
		respond();
	}
	else {
		respond();
	}

	return true;  // To make it async
});

chrome.webNavigation.onBeforeNavigate.addListener(details => {
	const { tabId, url } = details;
	onUrlChange({ tabId, url });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
	if (changeInfo.url) {
		onUrlChange({ tabId, url: changeInfo.url });
	}
});

chrome.browserAction.onClicked.addListener(tab => {
	isActiveByTab[tab.id] = !isActiveByTab[tab.id];
	notifyActive({ action: 'setActive', isActive: isActiveByTab[tab.id] }, tab.id);
});

function onUrlChange(details) {
	const { tabId, url } = details;
	const isRecording = isRecordingByTab[tabId];

	const anchor = document.createElement('a');
	anchor.href = url;
	const path = anchor.pathname;

	if (isActiveByTab[tabId] && isRecording && url !== 'about:blank') {
		notifyActive({ action: 'navigate', url, path }, tabId);
	}
}

function notifyActive(data, tabId = null) {
	console.log('bg.notify', data);
	chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
		chrome.tabs.sendMessage(tabId || tabs[0].id, data);
	});
}

function notifyAll(data) {
	console.log('bg.notifyAll', data);
	chrome.tabs.query({}, tabs => {
		for (const tab of tabs) {
			chrome.tabs.sendMessage(tab.id, data);
		}
	});
}
