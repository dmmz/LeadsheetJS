define([
	'mustache',
], function(Mustache) {
	/**
	 * @param {String}  title
	 * @param {String}  content    Can be the content or the link to a template to load (in case it's a template set istemplate to true)
	 * @param {Object} options  	options.classTitle is the name of the class that will use
	 */
	function PopIn(title, content, options) {
		this.title = title;
		this.content = content;

		options = options || {};

		this.classTitle = (options.classTitle !== undefined) ? options.classTitle : 'foregroundPopin';
		
		this.footerButtonTitle = (options.footerButtonTitle !== undefined) ? options.footerButtonTitle : 'Ok';
		if (options.isTemplate !== undefined && options.isTemplate === true) {
			this.isTemplate = true;
			this.template = content;
		} else {
			this.isTemplate = false;
			this.content = content;
		}
		this.onSubmitFunction = options.onSubmit;
		this.onCloseFunction = options.onClose; // close function is launched on hiding popin AND on submit
		this.backgroundOpacity = 0.5;
	}


	PopIn.prototype.render = function() {
		this.initView();
		if (this.isTemplate) {
			var self = this;
			this.renderTemplate(function() {
				self.initController();
				self.initKeyboard();
			});
		} else {
			this.initController();
			this.initKeyboard();
		}
	};

	/**
	 * Function initializes background and foreground of the popin.
	 * When content is available (in case it's not a template) it's directly inserted
	 */
	PopIn.prototype.initView = function() {
		var backgroundPopin = '<div class="backgroundPopin" style="display:none;opacity:' + this.backgroundOpacity + '"></div>';
		$(document.body).append(backgroundPopin);
		var content = '';
		if (!this.isTemplate) {
			content = this.content;
		}
		var txt = '';
		txt += '<div style="display:none;padding: 1em;z-index: 9001;" class="modal ' + this.classTitle + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
		txt += '<div class="modal-dialog">';
		txt += '<div class="modal-content">';
		txt += '<div class="modal-header">';
		txt += '<button type="button" class="popin_close close" style="float:right" data-dismiss="modal" aria-hidden="true">&times;</button>';
		txt += '<h4 class="modal-title">' + this.title + '</h4>';
		txt += '</div>';
		txt += '<div class="modal-body contentPopIn">' + content + '</div>';

		txt += '<div class="modal-footer"><span class="modal-footer-text"></span><button type="button" class="btn btn-default popin_close">Close</button>';
		txt += ' <button type="button" class="btn btn-primary popin_close modal_submit">' + this.footerButtonTitle + '</button></div>';

		txt += '</div>';
		txt += '</div>';
		txt += '</div>';
		$(document.body).append(txt);
	};

	/**
	 * Function gets the template, render it and insert as the content
	 * @param  {Function} callback function that will be executed after
	 * @return {String}            Render template
	 */
	PopIn.prototype.renderTemplate = function(callback) {
		var self = this;
		$.get(this.template, function(template) {
			var rendered = Mustache.render(template);
			$('.'+ self.classTitle +' .contentPopIn').html(rendered);
			if (typeof callback === "function") {
				callback();
			}
			return rendered;
		});
	};


	PopIn.prototype.initController = function() {
		var self = this;
		$('.backgroundPopin, .popin_close').click(function() {
			self.hide();
			if (self.onCloseFunction)	self.onCloseFunction();
		});
		$('.'+ self.classTitle +' .modal_submit').click(function() {
			if (self.onSubmitFunction)  self.onSubmitFunction();
			if (self.onCloseFunction)	self.onCloseFunction();
		});
	};

	PopIn.prototype.initKeyboard = function() {
		var self = this;
		$(document).keydown(function(evt) {
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			if (keyCode === 27) { // Escape touch close view
				self.hide();
			}
		});
	};

	PopIn.prototype.show = function() {
		$('.backgroundPopin').fadeIn('slow');
		$('.' +this.classTitle).fadeIn('slow');
	};

	PopIn.prototype.hide = function() {
		$('.backgroundPopin').fadeOut('slow');
		$('.' +this.classTitle).fadeOut('slow');
	};

	return PopIn;
});