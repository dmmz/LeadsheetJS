define(function() {
	/**
	 * CommentsModel 
	 * @exports AudioComments/CommentsModel
	 * @param {ServerComments} serverComments communicates with the server. Does not make really part of LeadsheetJS, it is provided by the server part, and it is hosted in it. In our case, in LSDB server. All methods work also without this Object, this way it works as an example without saving comment to a server part.
	 */
	function CommentsModel(serverComments, userSession) {
		this.serverComments = serverComments;
		this.comments = {};
		this.nextId = 0; //auto increment id used if there is no server

	}

	/**
	 * gets the comments from the server. If there is no server, just runs the callback function
	 * @param  {Function} callback [description]
	 */
	CommentsModel.prototype.getComments = function(type, callback) {
		function getCommentsByType(type){
			var types = (type === 'audio') ? [type] : ['notes','chords'];
			var typeComments = [];
			for (var i in self.comments){
				if (types.indexOf(self.comments[i].type) != -1){
					typeComments.push(self.comments[i]);
				}
			}
			return typeComments;
		}

		var self = this;
		if (this.serverComments) {
			this.serverComments.getComments(function(comments) {
				for (var i = 0; i < comments.length; i++) {
					self.addComment(comments[i]);
				}
				callback(getCommentsByType(type));
			});
		} else {
			callback(getCommentsByType(type));
		}
	};

	CommentsModel.prototype.getComment = function(id) {
		return this.comments[id];
	};
	/**
	 * if comment.id is defined, it means there exists a server part, so id is provided by the server (in our case it is a MongoDB id). 
	 * But if comment.id is not defined we just use our own auto_increment nextId
	 * @param {Object} comment 
	 * @param {String} id      
	 */
	CommentsModel.prototype.addComment = function(comment) {
		var id;
		if (comment.id !== undefined) {
			id = comment.id;
			this.comments[id] = comment;
		} else {
			id = this.nextId.toString(); //ids will always be strings so that they work well for 
			comment.id = id;
			this.nextId++;
			this.comments[id] = comment;
		}
		return id;
	};

	CommentsModel.prototype.saveComment = function(comment, callback) {
		var id,
			self = this;

		if (this.serverComments) {
			this.serverComments.saveComment(comment, function(data) {
				comment = data;
				id = self.addComment(comment);
				if (callback) callback(id);
			});
		} else {
			id = self.addComment(comment);
			if (callback) callback(id);
		}
		return id;
	};


	CommentsModel.prototype.updateComment = function(id, text, callback) {
		var self = this;
		this.comments[id].text = text;
		var comment = this.comments[id];
		if (this.serverComments) {
			this.serverComments.saveComment(comment, function() {
				callback();
			});
		} else {
			callback();
		}

	};

	CommentsModel.prototype.removeComment = function(id, callback) {
		var self = this;
		if (this.serverComments) {
			this.serverComments.removeComment(id, function() {
				delete self.comments[id];
				callback();
			});
		} else {
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
	CommentsModel.prototype.getOrderedIndexByCommentId = function(commentId) {
		var count = 0;
		for (var id in this.comments) {
			if (id == commentId) {
				return count;
			}
			count++;
		}
	};

	return CommentsModel;
});