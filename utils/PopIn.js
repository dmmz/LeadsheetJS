define([
	'mustache',
	'bootstrap'
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

		this.show = function() {
			this.$modal.modal('show');
		};

		this.hide = function() {
			this.$modal.modal('hide');
		};
	}


	PopIn.prototype.render = function() {
		this.initView();
		if (this.isTemplate) {
			this.renderTemplate(this.initController);
		} else {
			this.initController();
		}
	};

	/**
	 * Function initializes background and foreground of the popin.
	 * When content is available (in case it's not a template) it's directly inserted
	 */
	PopIn.prototype.initView = function() {
		var content = '';
		if (!this.isTemplate) {
			content = this.content;
		}
		var txt = '';
		txt += '<div class="modal hide fade ' + this.classTitle + '" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true">';
		txt += '<div class="modal-dialog">';
		txt += '<div class="modal-content">';
		txt += '<div class="modal-header">';
		txt += '<button type="button" class="close" style="float:right" data-dismiss="modal" aria-hidden="true">&times;</button>';
		txt += '<h4 class="modal-title">' + this.title + '</h4>';
		txt += '</div>';
		txt += '<div class="modal-body contentPopIn">' + content + '</div>';

		txt += '<div class="modal-footer"><span class="modal-footer-text"></span><button type="button" data-dismiss="modal" class="btn btn-default">Close</button>';
		txt += '<button type="button" data-dismiss="modal" class="btn btn-primary modal_submit">' + this.footerButtonTitle + '</button></div>';

		txt += '</div>';
		txt += '</div>';
		txt += '</div>';
		this.$modal = $(txt);
		$('body').append(this.$modal);
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
		self.$modal.on('hidden', function () {
			if (self.onCloseFunction)
				self.onCloseFunction();
		});
		$('.'+ self.classTitle +' .modal_submit').click(function() {
			if (self.onSubmitFunction)  self.onSubmitFunction();
			if (self.onCloseFunction)	self.onCloseFunction();
		});
	};

	return PopIn;
});