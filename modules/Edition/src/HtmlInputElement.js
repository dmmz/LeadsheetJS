define(['jquery'], function($) {
	/**
	 * Class for creating html inputs and deleting them
	 * @exports Edition/HtmlInputElement
	 * @param {LSViewer} viewer
	 * @param {String} className
	 * @param {Object} position    e.g.{x:23, y:23, w:10, h:10º}
	 * @param {Integer} marginTop
	 * @param {Integer} marginRight
	 */
	function HtmlInputElement(viewer, className, position, marginTop, marginRight) {
		if (!viewer || !className) {
			throw "HtmlInputElement - wrong params";
		}
		this.viewer = viewer;
		this.className = className;
		this.containerId = $(this.viewer.divContainer).attr('id');
		this.init(position, marginTop, marginRight);
	}
	HtmlInputElement.prototype.init = function(position, marginTop, marginRight) {
		marginTop = marginTop || 0;
		marginRight = marginRight || 0;

		var offset = $("#" + this.containerId + " canvas").offset();
		if (typeof offset === "undefined" || isNaN(offset.top) || isNaN(offset.left)) {
			offset = {
				top: 0,
				left: 0
			};
		}
		var pos = this.viewer.scaler.getScaledObj(position),
			top = pos.y - marginTop - 1,
			left = pos.x + offset.left + window.pageXOffset - 1,
			width = pos.w - marginRight,
			height = pos.h + marginTop;

		this.input = $('<input/>').attr({
			type: 'text',
			style: "position:absolute; z-index: 11000;left:" + left + "px;top:" + top + "px; width:" + width + "px; height:" + height + "px",
			'class': this.className,
		}).prependTo('#' + this.containerId);
	};
	HtmlInputElement.prototype.remove = function() {
		$('#' + this.containerId + ' .' + this.className).remove();
	};
	return HtmlInputElement;
});