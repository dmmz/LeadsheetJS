define(function() {
	function AudioCommentsModel() {
		this.comments = {};
	}

	AudioCommentsModel.prototype.addComment = function(comment) {
		var keys = Object.keys(this.comments);
		var lastKey = (keys.length !== 0) ? keys[keys.length - 1] : -1;
		var id = Number(lastKey) + 1;
		comment.id = id;
		this.comments[id] = comment;
		return id;
	};

	AudioCommentsModel.prototype.getComment = function(id) {
		return this.comments[id];
	};

	AudioCommentsModel.prototype.updateComment = function(id, text) {
		this.comments[id].text = text;
	};

	AudioCommentsModel.prototype.removeComment = function(id) {
		delete this.comments[id];
	};

	return AudioCommentsModel;
});