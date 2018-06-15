// This should be kept in sync with cypress-scenario-runner
const stepTemplates = {
	preconditions: {
		loggedOut: 'I am logged out',
		loggedIn: 'I am logged in as {user}',
	},
	actions: {
		logout: 'I log out',
		login: 'I log in as {user}',
		navigate: 'I navigate to {page}',
		click: 'I click {element}',
		set: 'I set {element} to {string}',
		waitUntilHidden: 'I wait for {element} to be hidden',
		pause: 'I pause',
		debug: 'I debug',
		wait: 'I wait {float} seconds',
	},
	assertions: {
		isOnPage: 'I will navigate to {page}',
		isNotOnPage: 'I will not navigate to {page}',
		isVisible: 'I will see {element}',
		isNotVisible: 'I will not see {element}',
		hasCount: 'I will see {int} instances of {element}',
		hasText: '{element} will be {string}',
		doesNotHaveText: '{element} will not be {string}',
		containsText: '{element} will contain {string}',
		doesNotContainText: '{element} will not contain {string}',
	},
};
