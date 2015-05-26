define([
		"modules/Edition/src/ElementManager",
		"modules/Edition/src/ElementView",
		"modules/Edition/src/KeyboardManager",
		"modules/Edition/src/Edition"
	],
	function(ElementManager, ElementView, KeyboardManager, Edition) {
		return {
			"ElementManager": ElementManager,
			"ElementView": ElementView,
			"KeyboardManager": KeyboardManager,
			"Edition": Edition
		};
	}
);