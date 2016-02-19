//TODO: we should add jquery and pubsub, but it's working anyway??? no clear what's going on 
define(['utils/NoteUtils',
	'jquery',
	'pubsub'
], function(NoteUtils, $, pubsub) {
	/**
	 * KeyboardManager allows to interact with keyboard using pubsub events
	 * @exports Edition/KeyboardManager
	 */
	function KeyboardManager(test) {

		function stopEvent(evt) {
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		}

		function preventBackspace(evt, d) {
			var doPrevent = false;
			if (d.tagName.toUpperCase() === 'TEXTAREA' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'NUMBER'))) {
				doPrevent = d.readOnly || d.disabled;
			} else {
				doPrevent = true;
			}
			if (doPrevent) {
				// console.log('prevent');
				stopEvent(evt);
			}
		}

		function isInHtmlInput(d) {
			return (
				d.tagName.toUpperCase() === 'TEXTAREA' || d.tagName.toUpperCase() === 'SELECT' || (d.tagName.toUpperCase() === 'INPUT' && (d.type.toUpperCase() === 'TEXT' || d.type.toUpperCase() === 'PASSWORD' || d.type.toUpperCase() === 'FILE' || d.type.toUpperCase() === 'NUMBER'))
			);
		}

		function publish(eventName, evt, param) {
			if (test) {
				console.log("keyboard " + eventName);
			}
			$.publish(eventName, [param, evt]);
			stopEvent(evt);
		}
		$(document).keydown(function(evt) {
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			var key = String.fromCharCode(keyCode).toLowerCase();
			var metaKey = !!evt.metaKey;
			var d = evt.srcElement || evt.target;
			var ACC_KEYS = {
				"s": "#",
				"v": "b",
				"n": "n"
			};
			var inc;
			if (keyCode === 8) {
				preventBackspace(evt, d);
			}
			if (isInHtmlInput(d) && keyCode != 9) { //if it's tab, we do run the event, even if it's in html, as this helps in chord edition
				//do not do anything
				return;
			}
			if (keyCode == 38 || keyCode == 40) { // up & down arrows
				inc = (keyCode == 38) ? 1 : -1;
				publish('updown-arrows', evt, inc);
			} else if (NoteUtils.getValidPitch(key) != -1 && (!evt.ctrlKey)) {
				publish('pitch-letter-key', evt, key.toUpperCase());
			} else if (ACC_KEYS.hasOwnProperty(key) && (!evt.ctrlKey)) {
				var acc = ACC_KEYS[key];
				// console.log(acc);
				if (evt.shiftKey) {
					publish('shift-accidental-key', evt, acc);
				} else {
					publish('accidental-key', evt, acc);
				}
			} else if (parseInt(key, null) >= 1 && parseInt(key, null) <= 9) {
				publish('number-key', evt, key);
			} else if (keyCode == 190 || keyCode == 59) {
				publish('dot-key', evt, evt.shiftKey);
				stopEvent(evt);
			} else if (keyCode == 58) {
				publish('colon-key', evt);
				stopEvent(evt);
			} else if (keyCode == 84) { // T be carefull, set key to t will be call on F5 also
				if (evt.shiftKey) {
					publish('shift-t-key', evt);
				} else {
					publish('t-key', evt);
				}
			} else if (keyCode == 82) { // R
				publish('R-key', evt);
			} else if (keyCode == 46 || keyCode == 8) { //supr
				publish('supr-key', evt); // in our editor we want to replace note by silence and not delete note
			} else if (keyCode == 13) { //enter
				publish('enter-key', evt);
			} else if (keyCode == 67 && (evt.ctrlKey || metaKey)) { // Ctrl + c or Command + c (mac or windows specific key)
				publish('ctrl-c-key', evt);
			} else if (keyCode == 86 && (evt.ctrlKey || metaKey)) { // Ctrl + v or Command + v (mac or windows specific key)
				publish('ctrl-v-key', evt);
			} else if (keyCode === 90 && (evt.ctrlKey || metaKey)) { // Ctrl + z
				publish('ctrl-z', evt);
			} else if (keyCode === 89 && (evt.ctrlKey || metaKey)) { // Ctrl + y
				publish('ctrl-y', evt);
			} else if (keyCode === 65 && (evt.ctrlKey || metaKey)) { // Ctrl + y
				publish('ctrl-a', evt);
			} else if (keyCode == 32) {
				publish('spacebar', evt);
			} else if (keyCode == 9) {
				inc = (evt.shiftKey) ? -1 : 1;
				publish('tab-key', evt, inc);
			} else if (keyCode == 37 || keyCode == 39) {
				// left-right arrows
				inc = (keyCode == 39) ? 1 : -1;
				if (evt.shiftKey) {
					publish('shift-leftright-arrows', evt, inc);
				} else if (evt.ctrlKey) {
					publish('ctrl-leftright-arrows', evt, inc);
				} else {
					publish('leftright-arrows', evt, inc);
				}
			} else if (keyCode == 36) { //begin
				if (evt.shiftKey) {
					publish('shift-begin', evt);
				} else {
					publish('begin', evt);
				}
			} else if (keyCode == 35) { //end
				if (evt.shiftKey) {
					publish('shift-end', evt);
				} else {
					publish('end', evt);
				}
			} else if (keyCode == 17){ //ctrl
					publish('ctrlPressed',evt);
			}
		});
		$(document).keyup(function(evt) {
			var keyCode = (evt === null) ? event.keyCode : evt.keyCode;
			if (keyCode == 17){ //ctrl
				publish('ctrlUnpressed',evt);
			}
		});
	}
	return KeyboardManager;
});