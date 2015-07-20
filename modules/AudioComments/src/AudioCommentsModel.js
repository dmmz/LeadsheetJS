define(['jquery'],function($) {
	function AudioCommentsModel(srvCommentsMng) {
		this.srvCommentsMng = srvCommentsMng;
		this.comments = {};

	}

	AudioCommentsModel.prototype.addComment = function(comment, callback) {
		var keys = Object.keys(this.comments);
		var lastKey = (keys.length !== 0) ? keys[keys.length - 1] : -1;
		var id = Number(lastKey) + 1;
		comment.id = id;

		if (this.srvCommentsMng){
			this.srvCommentsMng.saveComment(function(){
				this.comments[id] = comment;
				if (callback)	callback(id);		
			});
		}else{
			this.comments[id] = comment;
			if (callback)	callback(id);
		}
		return id;
	};

	AudioCommentsModel.prototype.getComment = function(id) {
		return this.comments[id];
	};

	AudioCommentsModel.prototype.updateComment = function(id, text, callback) {
		if (this.srvCommentsMng){
			this.srvCommentsMng.saveComment(function(){
				this.comments[id].text = text;
				callback();
			});
		}else{
			this.comments[id].text = text;
			callback();
		}
		
	};

	AudioCommentsModel.prototype.removeComment = function(id, callback) {
		if (this.srvCommentsMng){
			this.srvCommentsMng.saveComment(function(){
				delete this.comments[id];
				callback();
			});
		}else{
			delete this.comments[id];
			callback();
		}
	};

	AudioCommentsModel.prototype.getOrderedIndexCommentId = function(commentId) {
		var count = 0;
		for (var i in this.comments){
			if (this.comments[i].id == commentId){
				return count;
			}
			count++;
		}
	};

	return AudioCommentsModel;
});