$(document).ready(function() {
	const attrName = 'test-el';

	var isFirstTime = true;
	var isActive = false;
	var isRecording = false;
	var steps = new Steps(stepTemplates);
	var isElemPickerActive = false;
	var isCollapsed = false;

	const $iframeBody = Boundary.createBox('cypress-scenario-builder');
	const $iframe = $('#cypress-scenario-builder');

	$iframe.addClass('--cypress-scenario-builder hidden');

    Boundary.loadBoxJS('#cypress-scenario-builder', chrome.extension.getURL('vendor/iframeResizer.contentWindow.min.js'));
	Boundary.loadBoxCSS('#cypress-scenario-builder', chrome.extension.getURL('vendor/fonts.css'));
	Boundary.loadBoxCSS('#cypress-scenario-builder', chrome.extension.getURL('vendor/icons.css'));
	Boundary.loadBoxCSS('#cypress-scenario-builder', chrome.extension.getURL('src/content.css'));
    Boundary.loadBoxJS('#cypress-scenario-builder', chrome.extension.getURL('src/box.js'));

	const $elementLabel = $('<div />')
		.addClass('--cypress-scenario-builder-element-label')
		.appendTo(document.body);

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

	$container.on('click', '.js-pick-element', function pickElement() {
		const $pickElemButton = $(this);
		const stepId = $pickElemButton.data('stepId');

		const setClasses = () => {
			$(document).find('body').toggleClass('--cypress-scenario-builder-show-elements', isElemPickerActive);
			$iframeBody.toggleClass('-picking-element', isElemPickerActive);
			$pickElemButton.toggleClass('-picking-element', isElemPickerActive);
			$pickElemButton.closest('.step').toggleClass('-picking-element', isElemPickerActive);
		};

		const hideElementLabel = () => $elementLabel.css({ display: 'none' });

		const clickEventListener = function(event) {
			let elemName = $(this).attr(attrName);
			let step = steps.find(stepId);

			isElemPickerActive = false;
			setClasses();
			setListeners();
			setCollapsed(false);
			hideElementLabel();

			_.set(step, 'params.element', elemName);
			onStepsUpdated();

			event.preventDefault();
			event.stopPropagation();
			this.blur();
		};

		const mouseEnterEventListener = function(event) {
			const rect = this.getBoundingClientRect();

			$elementLabel
				.text($(this).attr(attrName))
				.css({
					display: 'block',
					position: 'fixed',
					left: rect.left,
					top: rect.bottom,
				});
		};

		const mouseLeaveEventListener = hideElementLabel;

		const setListeners = () => {
			// Hijacks clicks on all possible elements
			$(document).find(`[${attrName}]`).each(function() {
				if (isElemPickerActive) {
					this.addEventListener('click', clickEventListener, { capture: true });
					this.addEventListener('mouseenter', mouseEnterEventListener, { capture: true });
					this.addEventListener('mouseleave', mouseLeaveEventListener, { capture: true });
				}
				else {
					this.removeEventListener('click', clickEventListener, { capture: true });
					this.removeEventListener('mouseenter', mouseEnterEventListener, { capture: true });
					this.removeEventListener('mouseleave', mouseLeaveEventListener, { capture: true });
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
		const step = steps.find(stepId);
		const paramName = $input.data('paramName');

		if (step) {
			_.set(step, `params.${paramName}`, $input.val());
			onStepsUpdated();
		}
		else {
			console.error(`No step found for step ID = ${stepId}`);
		}
	});

	$container.on('click', '.js-remove-step', function() {
		const stepIndex = $(this).closest('[data-step-index]').data('stepIndex');
		steps.remove(stepIndex);
		onStepsUpdated();
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
		const type = $addStep.find('option:selected').val();
		addStep(type);
		$addStep.find('option[disabled]').first().prop('selected', true);
	});

	/*
		Controls
	 */

	const $controls = $('<div />')
		.addClass('controls clearfix')
		.appendTo($container);

	const $collapseToggle = $('<button type="button" />')
		.html('<i class="icon icon-collapse"></i><i class="icon icon-expand"></i>')
		.addClass('collapse-toggle')
		.appendTo($container);

	const $record = $('<button type="button" />')
		.addClass('btn record')
		.appendTo($controls);

	const $copy = $('<button type="button" />')
		.addClass('btn copy')
		.html('<i class="icon icon-copy"></i> Copy')
		.appendTo($controls);

	const $clear = $('<button type="button" />')
		.addClass('btn clear')
		.html('<i class="icon icon-trashcan"></i> Clear')
		.appendTo($controls);

	$collapseToggle.on('click', toggleCollapsed);

	$record.on('click', () => {
		setIsRecording(!isRecording);
	});

	$copy.on('click', () => {
		let stepsText = getCopyableSteps(steps.get());
		$stepsText.val(stepsText);
		copyText($iframe, $stepsText);
		$copy.html('<i class="icon icon-copy"></i> Copied');
		setTimeout(() => {
			$copy.html('<i class="icon icon-copy"></i> Copy');
		}, 2000);
	});

	$clear.on('click', () => {
		setSteps([]);
	});

	listen('setActive', response => {
		isActive = response.isActive;
		showPane(isActive);
	});

	listen('navigate', response => {
		addStep('actions.navigate', { string: response.url });
	});

	send('getActive', {}, response => {
		isActive = response.isActive;
		init();
	});

	function init() {
		setIsRecording(false);
		bindUserEvents();
		reloadSteps();
		showPane(isActive);
	}

	function showPane(isActive) {
		$iframe.toggleClass('hidden', !isActive);
		resizeIframe();

		if (isActive && isFirstTime) {
			isFirstTime = false;
		}
	}

	function toggleCollapsed() {
		setCollapsed(!isCollapsed);
	}

	function setCollapsed(newIsCollapsed) {
		isCollapsed = newIsCollapsed;
		$collapseToggle.toggleClass('-collapsed', isCollapsed);
		$container.toggleClass('-collapsed', isCollapsed);
		$iframe.toggleClass('--cypress-scenario-builder-collapsed', isCollapsed);

		if (!isCollapsed) {
			resizeIframe();
			setTimeout(resizeIframe, 50);
		}
	}

	function resizeIframe() {
		const height = $iframe.contents().find('.container').height();
		$iframe.css('height', height);
	}

	function renderSteps() {
		let stepsFormatted = getFormattedSteps(steps.get());

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
			reorderedSteps.push(steps.get(index));
		});

		setSteps(reorderedSteps);
	}

	function setIsRecording(newIsRecording) {
		isRecording = newIsRecording;
		$container.toggleClass('-recording', isRecording);

		const text = isRecording ? 'Recording' : 'Record';
		$record.html(`<i class="icon icon-media-record"></i>${text}`);
	}

	function addStep(type, params = {}) {
		steps.add(type, params);
		onStepsUpdated();
		scrollToBottom();
	}

	function setSteps(newSteps) {
		steps.set(newSteps);
		onStepsUpdated();
	}

	function onStepsUpdated() {
		saveSteps();
		renderSteps();
	}

	function saveSteps() {
		send('setSteps', { steps: steps.get() });
	}

	function reloadSteps() {
		send('getSteps', {}, response => {
			setSteps(response.steps);
		});
	}

	function scrollToBottom() {
		$steps.get(0).scrollTop = $steps.get(0).scrollHeight;
	}

	function getCopyableSteps(steps) {
		return _(steps)
			.map(step => {
				const stepTemplate = _.get(stepTemplates, step.type);
				const interpolated = getCopyableStep(stepTemplate, step.params);
				const prefix = _.startCase(step.prefix);
				return `${prefix} ${interpolated}`;
			})
			.join('\n');
	}

	function getCopyableStep(stepTemplate, params) {
		return _.reduce(params, (stepText, paramValue, paramName) => {
			return stepText.replace(`{${paramName}}`, `"${paramValue}"`);
		}, stepTemplate);
	}

	function getFormattedSteps(steps) {
		return _.map(steps, (step, index) => {

			text = step.template.replace(/({string}|{number}|{element})/g, (match, param) => {
				if (param === '{number}') {
					return `<input type="number" class="pick-number" data-step-id="${step.id}" data-param-name="number" value="${step.params.number}">`;
				}
				else if (param === '{string}') {
					return `<input type="text" class="pick-string" data-step-id="${step.id}" data-param-name="string" value="${step.params.string || ''}">`;
				}
				else if (param === '{element}') {
					let elemName = step.params.element || '<i class="icon icon-mouse-pointer"></i> Choose element';
					let className = step.params.element ? '-picked' : '';
					return `
					<button class="pick-element js-pick-element ${className}" data-step-id="${step.id}">
						${elemName}
					</button>`;
				}
				else {
					return param;
				}
			});

			const prefix = step.prefix ? `${_.startCase(step.prefix)} ` : '';

			return `
				<div class="step" data-step-index="${index}">
					${prefix}${text}
					<i class="remove-step icon-close js-remove-step"></i>
				</div>
			`;
		});
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

			if (currentInput && inputs.has(currentInput.element) && isActive && isRecording) {
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

			if (isActive && isRecording) {
				addStep('actions.set', { element, string: value });
			}
		});

		/*
			Checkbox
		 */

		$(document).on('change', `[${attrName}]:checkbox`, function() {
			var element = $(this).attr(attrName);
			var value = $(this).attr('test-val') || ($(this).is(':checked') ? 'checked' : 'unchecked');

			if (isActive && isRecording) {
				addStep('actions.set', { element, string: value });
			}
		});

		/*
			Radio
		 */

		$(document).on('change', `[${attrName}]:radio`, function() {
			var element = $(this).attr(attrName);
			var value = $(this).filter(':checked').val();

			if (isActive && isRecording) {
				addStep('actions.set', { element, string: value });
			}
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

			if (isActive && isRecording) {
				addStep('actions.click', { element });
			}
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
