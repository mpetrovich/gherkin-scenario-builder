var Boundary = {};

/******************************** create a box ********************************/

Boundary.createBox = function(id, attrs = {}) {
	attrs.scrolling = 'no';
	if (id) {
		attrs.id = id;
	}
	attrs.class = attrs.class ? "boundary-default-iframe " + attrs.class : "boundary-default-iframe";
	var iframe = $('<iframe />', attrs);
	if (window.self === window.top) {
    	$("body").append(iframe);
	}
	iframe.contents().find("head").append($("<link/>", {
		rel: "stylesheet",
		href: chrome.extension.getURL('vendor/boundary/boundary-extra.css'),
		type: "text/css"
	}));

	return iframe.contents().find("body");
};

/******************************** style elements within a box ********************************/

Boundary.loadBoxCSS = function(boxSelector, CSSPath) {
	var head = $(boxSelector).contents().find("head");
	head.append($("<link/>", {
		rel: "stylesheet",
		href: CSSPath,
		type: "text/css"
	}));
};

Boundary.loadBoxJS = function(boxSelector, JSPath) {
	// var body = $(boxSelector).contents().find("body");
	// body.append($("<script/>", {
	// 	href: JSPath,
	// 	type: "text/javascript"
	// }));

	var s = document.createElement("script");
	s.type = "text/javascript";
	s.src = JSPath;
	$(boxSelector).contents().find("body").append(s);
};

/******************************** find/modify a specific boxe ********************************/

Boundary.findBox = function(boxSelector) {
	return $(boxSelector).contents().find("body");
};

Boundary.rewriteBox = function(boxSelector, HTML) {
	Boundary.findBox(boxSelector).html(HTML)
};

Boundary.appendToBox = function(boxSelector, HTML) {
	Boundary.findBox(boxSelector).append(HTML)
};

Boundary.prependToBox = function(boxSelector, HTML) {
	Boundary.findBox(boxSelector).prepend(HTML)
};

/******************************** find/modify elements within all boxes ********************************/

Boundary.find = function(elemSelector) {
	return $(".boundary-default-iframe").contents().find(elemSelector);
};

Boundary.rewrite = function(elemSelector, HTML) {
	Boundary.find(elemSelector).html(HTML)
};

Boundary.append = function(elemSelector, HTML) {
	Boundary.find(elemSelector).append(HTML);
};

Boundary.prepend = function(elemSelector, HTML) {
	Boundary.find(elemSelector).prepend(HTML);
};

/******************************** find/modify elements within a specific box ********************************/

Boundary.findElemInBox = function(elemSelector, boxSelector) {
	return $(boxSelector).contents().find(elemSelector);
};

Boundary.rewriteElemInBox = function(elemSelector, boxSelector, HTML) {
	Boundary.findElemInBox(elemSelector, boxSelector).html(HTML)
};

Boundary.appendToElemInBox = function(elemSelector, boxSelector, HTML) {
	Boundary.findElemInBox(elemSelector, boxSelector).append(HTML);
};

Boundary.prependToElemInBox = function(elemSelector, boxSelector, HTML) {
	Boundary.findElemInBox(elemSelector, boxSelector).prepend(HTML);
};
