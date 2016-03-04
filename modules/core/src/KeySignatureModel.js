define(function(){
	function KeySignatureModel(key){
		this.keys = ["F", "C", "G", "D", "A", "E", "B", "F#", "C#"];
		var bemols = key.indexOf("b")!== -1;
			
		if (bemols){
			key = key[0];
		}
		if (this.keys.indexOf(key) == -1){
			throw "Key "+ key + " not valid";
		}
		this.accidentals = this._setAccidentals(key, bemols)
	};

	KeySignatureModel.prototype = {
		/**
		 * 												// TODO: could be improved with a circular array
		 * @param  {String} key e.g.: "A", "Bb", "C#"
		 * @return {Array}     accidentals of key. e.g.: for "D" -> {"F":"#","C":"#"}; for "Bb" -> {"B":"b","E":"b"}
		 */
		 _setAccidentals : function(key, bemols){
		 	var index,
				firstNonBemolPos = 7; //F#
			for (var i = 0; i < this.keys.length; i++) {
				if (this.keys[i] == key){
					if (bemols || i == 0){ // case keys with bemols (F, Bb, Eb...etc.)
						var bemolKeys = {};
						index = bemols ? i - 1 : firstNonBemolPos - 1 - i;
						for (var j = firstNonBemolPos - 1; j >= index; j--) {
							bemolKeys[this.keys[j]] = "b";
						}
						return bemolKeys;

					}else{ // case keys with sharps
						var sharpKeys = {};
						for (var j = 0; j < i - 1; j++){
							sharpKeys[this.keys[j]] = "#";
						}
						return sharpKeys;
					}
				}
			}
		},
		getAccidentals : function(){
			return this.accidentals;
		},
		getPitchAccidental: function(pitch){
			return this.accidentals[pitch] || "";
		}
	};
	return KeySignatureModel;
});