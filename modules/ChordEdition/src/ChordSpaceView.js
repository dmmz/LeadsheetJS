define([
	'jquery',
	'pubsub',
	'modules/Edition/src/ElementView',

], function($, pubsub, ElementView) {
	/**
	 * ChordSpaceView is represented as a rectangle on each beat on top of bars, it create an input where user can select a chord label
	 * This object is created by ChordSpaceManager
	 * @exports ChordEdition/ChordSpaceView
	 */
	function ChordSpaceView(viewer, position, barNumber, beatNumber, viewerScaler) {
		this.viewer = viewer;
		this.position = position;
		this.barNumber = barNumber;
		this.beatNumber = beatNumber;
		this.scaler = viewerScaler;
	}
	/**
	 * @interface
	 */
	ChordSpaceView.prototype.isInPath = function(coords) {
		return ElementView.isInPath(coords, this.position, this.scaler);
	};
	/**
	 * @interface
	 */
	ChordSpaceView.prototype.isBetweenYs = function(coords) {
		return ElementView.isBetweenYs(coords, this.position, this.scaler);
	};
	/**
	 * @interface
	 */
	ChordSpaceView.prototype.getArea = function() {
		return this.position;
	};

	/**
	 * @interface
	 *
	 * @param  {CanvasContext} ctx
	 * @param  {Number} marginTop   [description]
	 * @param  {Number} marginRight [description]
	 */
	ChordSpaceView.prototype.draw = function(ctx, marginTop, marginRight) {
		var style = ctx.fillStyle;
		ctx.fillStyle = "#0099FF";
		ctx.globalAlpha = 0.2;
		ctx.fillRect(
			this.position.x,
			this.position.y - marginTop,
			this.position.w - marginRight,
			this.position.h + marginTop
		);
		ctx.fillStyle = style;
		ctx.globalAlpha = 1;
	};

	ChordSpaceView.prototype._getChordAtThisPosition = function(songModel) {
		return songModel.getComponent('chords').searchChordByBarAndBeat(this.barNumber, this.beatNumber);
	};
	return ChordSpaceView;
});