class Steps {

	constructor(stepTemplates) {
		this.stepTemplates = stepTemplates;
		this.steps = [];
	}

	get(index = null) {
		return index === null ? this.steps : this.steps[index];
	}

	find(id) {
		return _.find(this.steps, ['id', id]);
	}

	set(steps) {
		this.steps = steps;
		this._setPrefixes();
	}

	replace(id, step) {
		const index = _.findIndex(this.steps, ['id', id]);
		this.steps.splice(index, 1, step);
		this._setPrefixes();
	}

	add(type, params = {}) {
		const template = _.get(this.stepTemplates, type);
		const id = _.uniqueId(_.random(1, 1000));
		this.steps.push({ id, type, params, template });
		this._setPrefixes();
	}

	remove(index) {
		this.steps.splice(index, 1);
	}

	_setPrefixes() {
		const lastActionIndex = _.findLastIndex(this.steps, step => step.type.startsWith('actions'));
		var isGivenAnd = false;
		var isThenAnd = false;

		for (let i = 0; i < this.steps.length; i++) {
			const step = this.steps[i];

			if (i < lastActionIndex) {
				step.prefix = isGivenAnd ? 'and' : 'given';
				isGivenAnd = true;
			}
			else if (i === lastActionIndex) {
				step.prefix = 'when';
			}
			else if (this.steps.length === 1) {
				step.prefix = 'given';
			}
			else {
				step.prefix = isThenAnd ? 'and' : 'then';
				isThenAnd = true;
			}
		}
	}
}
