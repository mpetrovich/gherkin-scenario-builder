const stepTemplates = {
	preconditions: {
		loggedOut: 'I am logged out',
		loggedIn: 'I am logged in as {string}',
	},
	actions: {
		navigate: 'I navigate to {page}',
		click: 'I click {element}',
		set: 'I set {element} to {string}',
	},
	assertions: {
		navigate: 'I will navigate to {page}',
		notNavigate: 'I will not navigate to {page}',
		see: 'I will see {element}',
		notSee: 'I will not see {element}',
		seeCount: 'I will see {number} instances of {element}',
		equal: '{element} will be {string}',
		notEqual: '{element} will not be {string}',
		contain: '{element} will contain {string}',
		notContain: '{element} will not contain {string}',
	},
	other: {
		pause: 'I pause',
		debug: 'I debug',
	},
};
