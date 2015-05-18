define([
		"modules/Edition/src/ElementManager",
		"modules/Edition/src/ElementView",
		"modules/Edition/src/KeyboardManager"
	],
	function(ElementManager, ElementView, KeyboardManager) {
		return {
			"ElementManager": ElementManager,
			"ElementView": ElementView,
			"KeyboardManager": KeyboardManager
		};
	}
);