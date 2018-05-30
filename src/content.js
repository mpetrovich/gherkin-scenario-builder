$(document).ready(function() {
	const attrName = 'test-el';

	var isFirstTime = true;
	var isActive = false;
	var isRecording = false;
	var steps = [];
	var stepId = 1;
	var isElemPickerActive = false;

	const $iframeBody = Boundary.createBox('iago');
	const $iframe = $('#iago');

    Boundary.loadBoxJS('#iago', chrome.extension.getURL('vendor/iframeResizer.contentWindow.min.js'));
	Boundary.loadBoxCSS('#iago', chrome.extension.getURL('vendor/fonts.css'));
	Boundary.loadBoxCSS('#iago', chrome.extension.getURL('vendor/icons.css'));
	Boundary.loadBoxCSS('#iago', chrome.extension.getURL('src/content.css'));
    Boundary.loadBoxJS('#iago', chrome.extension.getURL('src/box.js'));

	showPane(isActive);

	const $container = $('<div />')
		.addClass('container')
		.appendTo($iframeBody);

	const $stepsWrapper = $('<div />')
		.addClass('steps-wrapper')
		.appendTo($container);

	const $stepsText = $('<textarea />')
		.addClass('steps-text')
		.prop('readonly', true)
		.appendTo($stepsWrapper);

	$stepsWrapper.append('<h2 class="steps-heading">Scenario</h2>');

	const $steps = $('<div />')
		.addClass('steps hidden')
		.appendTo($stepsWrapper);

	$container.on('click', '.js-pick-element', function() {
		const $pickElemButton = $(this);
		const stepId = $pickElemButton.data('stepId');

		const setClasses = () => {
			$(document).find('body').toggleClass('--cypress-scenario-builder-show-elements', isElemPickerActive);
			$iframeBody.toggleClass('-picking-element', isElemPickerActive);
			$pickElemButton.toggleClass('-picking-element', isElemPickerActive);
			$pickElemButton.closest('.step').toggleClass('-picking-element', isElemPickerActive);
		};

		const eventListener = function(event) {
			let elemName = $(this).attr(attrName);
			let step = _.find(steps, ['id', stepId]);

			if (step) {
				_.set(step, 'params.element', elemName);
				renderSteps();

				isElemPickerActive = false;
				setClasses();
				setListeners();
			}
			else {
				console.error(`No step found for step ID = ${stepId}`);
			}

			event.preventDefault();
			event.stopPropagation();
			this.blur();
		};

		const setListeners = () => {
			// Hijacks clicks on all possible elements
			$(document).find(`[${attrName}]`).each(function() {
				if (isElemPickerActive) {
					this.addEventListener('click', eventListener, { capture: true });
				}
				else {
					this.removeEventListener('click', eventListener, { capture: true });
				}
			});
		};

		isElemPickerActive = !isElemPickerActive;
		setClasses();
		setListeners();
	});

	$container.on('change', '.pick-string, .pick-number', function() {
		const $input = $(this);
		const stepId = $input.data('stepId');
		const step = _.find(steps, ['id', stepId]);
		const paramName = $input.data('paramName');

		if (step) {
			_.set(step, `params.${paramName}`, $input.val());
		}
		else {
			console.error(`No step found for step ID = ${stepId}`);
		}
	});

	/*
		"Add step" dropdown
	 */

	let options = _.map(stepTemplates, (steps, category) => {
		let options = _.map(steps, (template, key) => `<option value="${category}.${key}">${template}</option>`);
		let group = `<optgroup label="${_.startCase(category)}">${options}</optgroup>`;
		return group;
	});
	options.unshift('<option disabled selected>Add a step...</option>');

	const $addStep = $(`<select name="add_step" class="add-step">${options.join('')}</select>`)
		.appendTo($stepsWrapper);

	$addStep.on('change', () => {
		let stepKey = $addStep.find('option:selected').val();
		let stepTemplate = _.get(stepTemplates, stepKey);
		addStepTemplate(stepKey, stepTemplate);
		$addStep.find('option[disabled]').first().prop('selected', true);
	});

	/*
		Controls
	 */

	const $controls = $('<div />')
		.addClass('controls clearfix')
		.appendTo($container);

	const $record = $('<button type="button" />')
		.addClass('btn iago-record')
		.appendTo($controls);

	const $copy = $('<button type="button" />')
		.addClass('btn iago-copy')
		.html('<i class="icon icon-copy"></i> Copy')
		.appendTo($controls);

	const $clear = $('<button type="button" />')
		.addClass('btn iago-clear')
		.html('<i class="icon icon-remove"></i> Clear')
		.appendTo($controls);

	$record.on('click', () => {
		setIsRecording(!isRecording);
	});

	$copy.on('click', () => {
		let stepsText = getCopyableSteps(steps);
		$stepsText.val(stepsText);
		copyText($iframe, $stepsText);
		$copy.html('<i class="icon icon-copy"></i> Copied');
		window.setTimeout(() => {
			$copy.html('<i class="icon icon-copy"></i> Copy');
		}, 2000);
	});

	$clear.on('click', () => {
		steps = [];
		renderSteps();
	});

	setIsRecording(false);
	bindUserEvents();
	renderSteps();

	showPane(isActive);

	listen('setActive', response => {
		isActive = response.isActive;
		showPane(isActive);
	});

	function showPane(isActive) {
		$iframe.toggleClass('hidden', !isActive);
		resizeIframe();

		if (isActive && isFirstTime) {
			isFirstTime = false;
		}
	}

	function resizeIframe() {
		const height = $iframe.contents().find('.container').height();
		$iframe.css('height', height);
	}

	function renderSteps() {
		let stepsFormatted = getFormattedSteps(steps);

		if (stepsFormatted.length) {
			$steps.html(stepsFormatted.join(''));
			$steps.removeClass('hidden');
			$steps.removeClass('hidden');
			$steps.sortable({
				cursor: '-webkit-grabbing',
				update: reorderSteps,
			});
			$steps.disableSelection();
		}
		else {
			$steps.addClass('hidden');
		}

		$container.toggleClass('-has-steps', stepsFormatted.length > 0);

		resizeIframe();
	}

	function reorderSteps() {
		var reorderedSteps = [];

		$steps.find('.step').each(function() {
			let $step = $(this);
			let index = $step.data('stepIndex');
			reorderedSteps.push(steps[index]);
		});

		steps = reorderedSteps;
	}

	function setIsRecording(newIsRecording) {
		isRecording = newIsRecording;
		$container.toggleClass('-recording', isRecording);

		const text = isRecording ? 'Recording' : 'Record';
		$record.html(`<i class="icon icon-media-record"></i>${text}`);
	}

	function addStep(type, params) {
		if (isActive && isRecording) {
			steps.push({ type, params });
			renderSteps();
			scrollToBottom();
		}
	}

	function addStepTemplate(type, template) {
		steps.push({ id: stepId++, type, template });
		renderSteps();
		scrollToBottom();
	}

	function scrollToBottom() {
		$steps.get(0).scrollTop = $steps.get(0).scrollHeight;
	}

	function getCopyableSteps(steps) {
		const GIVEN = 'Given';
		const WHEN = 'When';
		const THEN = 'Then';
		const AND = 'And';

		var prefix = GIVEN;

		return _(steps)
			.map(step => {
				let stepTemplate = _.get(stepTemplates, step.type);
				return getCopyableStep(stepTemplate, step.params);
			})
			.join('\n');
	}

	function getCopyableStep(stepTemplate, params) {
		return _.reduce(params, (stepText, paramValue, paramName) => {
			return stepText.replace(`{${paramName}}`, `"${paramValue}"`);
		}, stepTemplate);
	}

	function getFormattedSteps(steps) {
		const GIVEN = 'Given';
		const WHEN = 'When';
		const THEN = 'Then';
		const AND = 'And';

		var prefix = GIVEN;

		return _(steps)
			.map((step, index) => {
				if (step.template) {
					let params = step.params || {};
					text = step.template.replace(/({string}|{number}|{element})/g, (match, param) => {
						if (param === '{number}') {
							return `<input type="number" class="pick-number" data-step-id="${step.id}" data-param-name="number" value="${params.number}">`;
						}
						else if (param === '{string}') {
							return `<input type="text" class="pick-string" data-step-id="${step.id}" data-param-name="string" value="${params.string}">`;
						}
						else if (param === '{element}') {
							let elemName = params.element || '<i class="icon icon-mouse-pointer"></i> Choose element';
							let className = params.element ? '-picked' : '';
							return `
							<button class="pick-element js-pick-element ${className}" data-step-id="${step.id}">
								${elemName}
							</button>`;
						}
						else {
							return param;
						}
					});
				}
				else {
					let stepTemplate = _.get(stepTemplates, step.type);
					text = getFormattedStep(stepTemplate, step.params);
				}

				return `<div class="step" data-step-index="${index}">${text}</div>`;
			})
			.value();
	}

	function getFormattedStep(stepTemplate, params) {
		return _.reduce(params, (stepText, paramValue, paramName) => {
			return stepText.replace(`{${paramName}}`, `<em>${paramValue}</em>`);
		}, stepTemplate);
	}

	function copyText($iframe, $input) {
		var success;
		var window = $iframe.get(0).contentWindow;

		$input.get(0).select();

		try {
			var success = window.document.execCommand('copy');
		}
		catch (error) {
			console.error(`Error copying: ${error}`);
		}

		if (success) {
			console.log('Copied!');
		}

		window.getSelection().removeAllRanges();
	}

	function bindUserEvents() {
		const inputs = new Set();

		/*
			Text input
		 */

		var currentInput = null;

		$(document).on('keyup', `[${attrName}]:input`, function() {
			if (!$(this).is('input[type="text"]') &&
				!$(this).is('input[type="email"]') &&
				!$(this).is('input[type="password"]') &&
				!$(this).is('input[type="date"]') &&
				!$(this).is('textarea')
			) {
				// Ignores non-textual inputs
				return;
			}

			var $input = $(this);
			currentInput = {};
			currentInput.element = $input.attr(attrName);
			currentInput.value = $input.val();
			inputs.add(currentInput.element);
		});

		$(document).on('blur', `[${attrName}]:input`, function() {
			if (!$(this).is('input[type="text"]') &&
				!$(this).is('input[type="email"]') &&
				!$(this).is('input[type="password"]') &&
				!$(this).is('input[type="date"]') &&
				!$(this).is('textarea')
			) {
				// Ignores non-textual inputs
				return;
			}

			if (currentInput && inputs.has(currentInput.element)) {
				addStep('actions.set', { element: currentInput.element, string: currentInput.value });
			}
			currentInput = null;
		});

		/*
			Select
		 */

		$(document).on('change', `select[${attrName}]`, function() {
			var element = $(this).attr(attrName);
			var value = $(this).find('option:selected').text();
			addStep('actions.set', { element, string: value });
		});

		/*
			Checkbox
		 */

		$(document).on('change', `[${attrName}]:checkbox`, function() {
			var element = $(this).attr(attrName);
			var value = $(this).attr('test-val') || ($(this).is(':checked') ? 'checked' : 'unchecked');
			addStep('actions.set', { element, string: value });
		});

		/*
			Radio
		 */

		$(document).on('change', `[${attrName}]:radio`, function() {
			var element = $(this).attr(attrName);
			var value = $(this).filter(':checked').val();
			addStep('actions.set', { element, string: value });
		});

		/*
			Click
		 */

		$(document).on('click', `[${attrName}]`, function() {
			if ($(this).is('input[type="text"') ||
				$(this).is('input[type="email"') ||
				$(this).is('input[type="password"') ||
				$(this).is('input[type="date"') ||
				$(this).is('input[type="checkbox"') ||
				$(this).is('input[type="radio"') ||
				$(this).is('textarea') ||
				$(this).is('select')
			) {
				// Click steps should not be generated for non-submit inputs
				return;
			}

			var element = $(this).attr(attrName);
			addStep('actions.click', { element });
		});
	}

	function send(action, params, callback = () => {}) {
		console.log('send', action, params);
		chrome.runtime.sendMessage({ action: action, ...params }, callback);
	}

	function listen(action, callback) {
		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
			console.log('request', request);
			if (request.action === action) {
				callback(request);
			}
		});
	}

});
