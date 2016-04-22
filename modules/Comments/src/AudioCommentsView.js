define(function() {
	/**
	 * Represents audio comments
	 * @param {AudioDrawer} audioDrawer [description]
	 */
	var AudioCommentsView = function(audioDrawer) {
		//when initializing AudioCommentsView
		return {
			getArea: function(comment) {
				var cursor = audioDrawer.audioCursor.cursor;
				var timeInterval = comment ? 
					comment.timeInterval : cursor.getPos();
				return audioDrawer.audioCursor.getAreasFromTimeInterval(timeInterval[0], timeInterval[1]);
			},
			isEnabled: function() {
				return audioDrawer.audioCursor.isEnabled();
			},
			getTimeInterval: function() {
				return audioDrawer.audioCursor.cursor.getPos();
			},
			color: "#77B979"
		}
	}
	return AudioCommentsView;
});