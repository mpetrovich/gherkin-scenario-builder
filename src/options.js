const options = {};

send('getOptions', {}, savedOpts => {
	_.assign(options, savedOpts);
	console.log('options', options);

	$(':input').each(function() {
		const $input = $(this);
		const name = $input.attr('name');
		const value = options[name] || '';
		$input.val(value);
	});
});

$(document).on('focus', ':input', function() {
	const $input = $(this);
	$input.removeClass('-saved');
});

$(document).on('keyup', ':input', function() {
	const $input = $(this);
	const name = $input.attr('name');
	const value = $input.val();

	send('setOptions', { [name]: value }, () => $input.addClass('-saved'));
});

$('.use-default-steps').click((event) => {
	send('setOptions', { steps: '' }, options => $(':input[name="steps"]').val(options.steps));
	event.preventDefault();
});

function send(action, params, callback = () => {}) {
	console.log('send', action, params);
	chrome.runtime.sendMessage({ action: action, ...params }, callback);
}
