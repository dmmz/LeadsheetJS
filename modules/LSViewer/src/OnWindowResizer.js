define(['jquery'], function($) {
	/**
	 * Manage windows resize event
	 * @exports LSViewer/OnWindowResizer
	 */
	var OnWindowResizer = function(songModel) {
		$(window).resize(function() {
			window.setTimeout(function() {
				$.publish('ToViewer-resize', songModel);
			}, 0);

		});
	};
	return OnWindowResizer;
});