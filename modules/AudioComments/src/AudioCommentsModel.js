define(function() {
	/**
	 * [AudioCommentsModel description]
	 * @param {ServerAudioComments} serverAudioComments [description]
	 */
	function AudioCommentsModel(serverAudioComments, userSession) {
		this.serverAudioComments = serverAudioComments;
		this.comments = {};
		this.nextId = 0;

	}

	AudioCommentsModel.prototype.getComments = function(callback) {
		var self = this;
		this.serverAudioComments.getComments(function(comments){
			for (var i = 0; i < comments.length; i++) {
				self.addComment(comments[i]);
			}
			callback();
		});
	};

	AudioCommentsModel.prototype.getComment = function(id) {
		return this.comments[id];
	};

	AudioCommentsModel.prototype.addComment = function(comment, id) {
		if (comment.id !== undefined){
			id = comment.id;
			this.comments[id] = comment;
		}else{
			id = this.nextId;
			comment.id = id;
			this.nextId++;
			this.comments[id] = comment;
		}
		return id;
	};

	AudioCommentsModel.prototype.saveComment = function(comment, callback) {
		var id,
		self = this;

		if (this.serverAudioComments){
			this.serverAudioComments.saveComment(comment,function(data){
				comment = data;
				id = self.addComment(comment);
				if (callback)	callback(id);		
			});
		}else{
			id = self.addComment(comment);
			if (callback)	callback(id);
		}
		return id;
	};


	AudioCommentsModel.prototype.updateComment = function(id, text, callback) {
		var self = this;
		this.comments[id].text = text;
		var comment = this.comments[id];
		if (this.serverAudioComments){
			this.serverAudioComments.saveComment(comment, function(){
				callback();
			});
		}else{
			callback();
		}
		
	};

	AudioCommentsModel.prototype.removeComment = function(id, callback) {
		var self = this;
		if (this.serverAudioComments){
			this.serverAudioComments.removeComment(id,function(){
				delete self.comments[id];
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