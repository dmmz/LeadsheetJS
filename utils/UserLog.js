define(['jquery'], function($) {
	var UserLog = {};

	/**
	 * Call log function to send a message to user, message will automatically fadeOut quickly
	 * @param  {string} type         Define the type of message you are sending: 'info', 'success', 'warn' or 'error' (by default it's set to info)
	 * @param  {string} title        Title is the text that will be displayed to the user, it can contain variables
	 * @param  {HTMLElement} element HTMLElement where the span message will be inserted (it's inserted before this element) (by default it's on body)
	 */
	UserLog.logAutoFade = function(type, title, element, speed) {
		if (typeof type === "undefined") {
			type = 'info';
		}
		if (typeof title === "undefined") {
			title = 'Untitled';
		}
		if (typeof element === "undefined") {
			element = $('body')[0];
		}
		if (typeof speed === "undefined") {
			speed = 5000;
		}
		var className = '';
		switch (type) {
			case 'info':
				className = 'alert alert-info';
				break;
			case 'success':
				className = 'alert alert-success';
				break;
			case 'warn':
				className = 'alert alert-warning';
				break;
			case 'error':
				className = 'alert alert-error';
				break;
			default:
				className = 'alert alert-info';
		}
		var saveMsg = "<span class='" + className + "' style='position:fixed; z-index:9999; left:30%'>" + title + "</span>";
		$(saveMsg).insertBefore(element).fadeOut(speed, function() {
			$(this).remove();
		});
	};

	/**
	 * Call log function to send a message to user, message will not be hidden unless you call remove
	 * @param  {string} type         Define the type of message you are sending: 'info', 'success', 'warn' or 'error' (by default it's set to info)
	 * @param  {string} title        Title is the text that will be displayed to the user, it can contain variables
	 * @param  {HTMLElement} element HTMLElement where the span message will be inserted (it's inserted before this element) (by default it's on body)
	 * @return {string} Return the logList id of the newly created dom element
	 */
	UserLog.log = function(type, title, element) {
		if (typeof type === "undefined") {
			type = 'info';
		}
		if (typeof title === "undefined") {
			title = 'Untitled';
		}
		if (typeof element === "undefined") {
			element = $('body')[0];
		}
		var className = '';
		switch (type) {
			case 'info':
				className = 'alert alert-info';
				break;
			case 'success':
				className = 'alert alert-success';
				break;
			case 'warn':
				className = 'alert alert-warning';
				break;
			case 'error':
				className = 'alert alert-error';
				break;
			default:
				className = 'alert alert-info';
		}
		var id = Math.round((Math.random() * 1000)) + '-' + Date.now();
		var saveMsg = "<span class='" + className + "' id='logId-" + id + "' style='position:fixed; z-index:9999; left:30%'>" + title + "</span>";
		$(saveMsg).insertBefore(element);
		return id;
	};

	UserLog.removeLog = function(id) {
		if (typeof id === "undefined") {
			console.warn('UserLog - remove - id undefined ' + id);
		}
		$('#logId-' + id).remove();
	};

	return UserLog;
});