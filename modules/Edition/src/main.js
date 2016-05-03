define([
		"modules/Edition/src/ElementManager",
		"modules/Edition/src/ElementView",
		"modules/Edition/src/KeyboardManager",
		"modules/Edition/src/ClipboardManager",
		"modules/Edition/src/Edition"
	],
	function(ElementManager, ElementView, KeyboardManager, ClipboardManager, Edition) {
		console.log('here');
		return {
			"ElementManager": ElementManager,
			"ElementView": ElementView,
			"KeyboardManager": KeyboardManager,
			"ClipboardManager": ClipboardManager,
			"Edition": Edition
		};
	}
);