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
		waitUntilHidden: 'I wait for {element} to disappear',
		wait: 'I wait {float} seconds',
		pause: 'I pause',
		debug: 'I debug',
	},
	assertions: {
		isOnPage: 'I should be on {page}',
		isNotOnPage: 'I should not be on {page}',
		isVisible: '{element} should be visible',
		isNotVisible: '{element} should not be visible',
		hasCount: '{element} should have {int} occurrences',
		hasText: '{element} should be {string}',
		doesNotHaveText: '{element} should not be {string}',
		containsText: '{element} should contain {string}',
		doesNotContainText: '{element} should not contain {string}',
	},
};
