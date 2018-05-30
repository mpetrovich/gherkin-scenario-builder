const stepTemplates = {
	actions: {
		logOut: 'I log out',
		logIn: 'I log in as {string}',
		navigate: 'I navigate to {string}',
		see: 'I see {element}',
		seeCount: 'I see {number} instances of {element}',
		notSee: 'I do not see {element}',
		click: 'I click {element}',
		set: 'I set {element} to {string}',
	},
	assertions: {
		navigate: 'I will navigate to {string}',
		notNavigate: 'I will not navigate to {string}',
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
