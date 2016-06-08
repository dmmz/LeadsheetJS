define([
	'jquery',
	'utils/UserLog',
], function($, UserLog){
	function ClipboardManager(htmlMainContainer) {
		var self = this;
		var contentCopied = false;
		var $divContainer = $(htmlMainContainer);
		// container should be contentEditable on FF to fire copy/paste events 
		$divContainer.attr('contenteditable', 'true').css({outline: 'none', border: '0'});
		// prepare hidden textarea to hold clipboard value
		self.$hiddenClipboardHolder = $('<textarea id="hidden_clipboard_holder"></textarea>');
		// display: none prevents selection api
		self.$hiddenClipboardHolder.css({
			position: 'absolute',
			left: '-1000px',
			top: '-1000px',
		});
		$('body').append(self.$hiddenClipboardHolder);
		// mainly for safari to allow paste on second try
		$.subscribe('ctrl-v-key', function(){
			//focus without scrolling
			var x = window.scrollX, y = window.scrollY;
		  	self.$hiddenClipboardHolder.focus();
		  	window.scrollTo(x, y);
		});
		$.subscribe('ClipboardManager-addToClipboardHolder', function(el, newValueToAdd) {
			var actualValue = self.$hiddenClipboardHolder.val() && contentCopied === false ? JSON.parse(self.$hiddenClipboardHolder.val()) : {};
			$.extend(true, actualValue, newValueToAdd);
			contentCopied = false;
			self.$hiddenClipboardHolder.focus();
			self.$hiddenClipboardHolder.val(JSON.stringify(actualValue));
			self.$hiddenClipboardHolder[0].select();
		});

		var _resetClipboard = function() {
			if (contentCopied === false) {
				contentCopied = true;
			} else {
				self.$hiddenClipboardHolder.val('');
			}
		};

		$(document).on('copy', _resetClipboard);
		$.subscribe('ctrl-c-key', _resetClipboard);

		$(document).on('paste', function(event) {
			// if no clipboard data, get textarea value. /!\ will not work between tabs and on page load.
			var pasteData = event.originalEvent && event.originalEvent.clipboardData ? event.originalEvent.clipboardData.getData("text/plain") : self.$hiddenClipboardHolder.val();
			var parsedData = false;
			try {
				parsedData = JSON.parse(pasteData);
			} catch(e) {
				UserLog.logAutoFade('error', 'You clipboard doest not contain a valid JSON. Please copy again.');
			}
			if (parsedData) {
				$.publish('pasteJSONData', [parsedData]);
				event.preventDefault();
				event.stopPropagation();
				self.$hiddenClipboardHolder.focus();
				self.$hiddenClipboardHolder[0].select();
			}
		});
	}

	return ClipboardManager;
});