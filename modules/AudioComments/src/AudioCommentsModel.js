define(function(){
	function AudioCommentsModel () {
		this.comments = [];
	}
	AudioCommentsModel.prototype.addComment = function(comment) {
		this.comments.push(comment);
	};
	return AudioCommentsModel;
});