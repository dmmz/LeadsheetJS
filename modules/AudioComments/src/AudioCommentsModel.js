define(['jquery'],function($) {
	/**
	 * [AudioCommentsModel description]
	 * @param {ServerAudioComments} serverAudioComments [description]
	 */
	function AudioCommentsModel(serverAudioComments) {
		this.serverAudioComments = serverAudioComments;
		this.comments = {};
		this.nextId = 0;

	}

	AudioCommentsModel.prototype.addComment = function(comment, callback) {
		var id = this.nextId;
		comment.id = id;
		this.nextId++;

		if (this.serverAudioComments){
			this.serverAudioComments.saveComment(function(){
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
		if (this.serverAudioComments){
			this.serverAudioComments.saveComment(function(){
				this.comments[id].text = text;
				callback();
			});
		}else{
			this.comments[id].text = text;
			callback();
		}
		
	};

	AudioCommentsModel.prototype.removeComment = function(id, callback) {
		if (this.serverAudioComments){
			this.serverAudioComments.saveComment(function(){
				delete this.comments[id];
				callback();
			});
		}else{
			delete this.comments[id];
			callback();
		}
	};
	/**
	 * When clicked on canvasLayer, comments are accessed by orderedIndex, instead of by their id.
	 * Example to understand difference between id and orderedIndex: If we add comment 0, comment 1, both id and orderedIndexes will be [0,1] 
	 * If we then add comment 2 and remove comment 0, ids will be [1,2] whereas orderedIndexes will be [0,1]
	 * 
	 * @param  {Integer}	commentId  it's an auto_increment id (0, 1, 2..etc)
	 * @return {Integer}	position in which comment is placed, corresponding to commentSpace position alse
	 */
	AudioCommentsModel.prototype.getOrderedIndexByCommentId = function(commentId) {
		var count = 0;
		for (var id in this.comments){
			if (id == commentId){
				return count;
			}
			count++;
		}
	};

	return AudioCommentsModel;
});