define([
	'pubsub',
	'jquery',
	'modules/AudioComments/src/AudioCommentsModel',
	'modules/AudioComments/src/AudioCommentsView'
], function(pubsub, $, AudioCommentsModel, AudioCommentsView) {
	function AudioCommentsController(waveMng, viewer) {
		this.waveMng = waveMng;
		this.viewer = viewer;
		this.model = new AudioCommentsModel();
		this.view = new AudioCommentsView(viewer);
		this.initSubscribe();
	}
	AudioCommentsController.prototype.initSubscribe = function() {
		var self = this;
		$.subscribe('audio-drawn', function() {
			self.view.draw(self.model,self.waveMng.drawer);
		});
		$.subscribe('clicked-comment', function(el, indexElem) {
			alert(self.model.comments[indexElem].text);
		});
		
	};
	AudioCommentsController.prototype.addComment = function(comment) {
		this.model.addComment(comment);
	};
		
	return AudioCommentsController;
});