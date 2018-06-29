class Steps {

	constructor(stepTemplates) {
		this.stepTemplates = stepTemplates;
		this.steps = [];
	}

	getAll() {
		return _.cloneDeep(this.steps);
	}

	setAll(steps) {
		this.steps = steps;
		this._setPrefixes();
	}

	get(id) {
		const index = _.findIndex(this.steps, ['id', id]);

		if (index === -1) {
			return null;
		}

		return _.cloneDeep(this.steps[index]);
	}

	find(id) {
		return _.cloneDeep(_.find(this.steps, ['id', id]));
	}

	replace(id, step) {
		const index = _.findIndex(this.steps, ['id', id]);

		if (index === -1) {
			return;
		}

		this.steps.splice(index, 1, step);
		this._setPrefixes();
	}

	duplicate(id) {
		const step = this.get(id);
		step.id = this._generateId();

		const index = _.findIndex(this.steps, ['id', id]);
		this.steps.splice(index + 1, 0, step);

		this._setPrefixes();
	}

	add(type, params = {}) {
		const template = _.get(this.stepTemplates, type);
		const id = this._generateId();
		this.steps.push({ id, type, params, template });
		this._setPrefixes();
	}

	remove(id) {
		const index = _.findIndex(this.steps, ['id', id]);

		if (index === -1) {
			return;
		}

		this.steps.splice(index, 1);
	}

	_generateId() {
		return _.uniqueId(_.random(1, 1000));
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
