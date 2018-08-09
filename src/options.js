const options = {};

send('getOptions', {}, savedOpts => {
	_.assign(options, savedOpts);

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

$('.use-default-pages').click((event) => {
	send('setOptions', { pages: '' }, options => $(':input[name="pages"]').val(options.pages));
	event.preventDefault();
});

$('.use-default-users').click((event) => {
	send('setOptions', { users: '' }, options => $(':input[name="users"]').val(options.users));
	event.preventDefault();
});

$('.use-default-steps').click((event) => {
	send('setOptions', { steps: '' }, options => $(':input[name="steps"]').val(options.steps));
	event.preventDefault();
});

function send(action, params, callback = () => {}) {
	chrome.runtime.sendMessage({ action: action, ...params }, callback);
}
