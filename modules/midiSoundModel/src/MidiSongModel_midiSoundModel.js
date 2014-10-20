define(['modules/midiSoundModel/src/MidiNoteModel_midiSoundModel'], function(MidiSoundModel) {
	function MidiSongModel(option) {
		this.song = (typeof(option) !== "undefined" && typeof(option.song) !== "undefined") ? option.song : [];
	};

	MidiSongModel.prototype.getSong = function() {
		return this.song;
	}

	MidiSongModel.prototype.setSong = function(song, replaceBool) {
		if (typeof replaceBool !== "undefined" && replaceBool) {
			this.song = song;
		} else {
			this.song = this.song.concat(song);
		}
	}

	MidiSongModel.prototype.setFromType = function( song, type) {
		if(typeof type === "undefined"){
			 return;
		}
		for (var i = this.song.length - 1; i >= 0; i--) {
			if (this.song[i].getType() === type) {
				this.song.splice(i, 1);
			}
		}
		this.song = this.song.concat(song);
		/*console.log(this.song);*/
	}

	MidiSongModel.prototype.getFromType = function(type) {
		var elements = [];
		if(typeof type !== "undefined"){
			for (var i = 0, c = this.song.length; i < c; i++) {
				if (this.song[i].getType() === type) {
					elements.push(this.song[i])
				}
			}
		}
		return elements;
	}

	MidiSongModel.prototype.removeFromType = function(type) {
		if(typeof type === "undefined"){
			 return;
		}
		for (var i = this.song.length - 1; i >= 0; i--) {
			if (this.song[i].getType() === type) {
				this.song.splice(i, 1);
			}
		}
	}

	MidiSongModel.prototype.getLastNote = function() {
		// Looking for last note
		var lastNote = this.song[0];
		var lastNoteEndTime = lastNote.getCurrentTime() + lastNote.getDuration();
		var currentNote, currentEndTime;
		for (var i = 0, c = this.song.length; i < c; i++) {
			currentNote = this.song[i];
			if (currentNote && currentNote.getType() !== "metronome") {
				currentEndTime = currentNote.getCurrentTime() + currentNote.getDuration();
				if (lastNoteEndTime < currentEndTime) {
					lastNoteEndTime = currentEndTime;
					lastNote = currentNote;
				}
			}
		}
		return lastNote;
	}

	MidiSongModel.prototype.getMidiSoundModelIndex = function(midiSoundModel) {
		if (typeof midiSoundModel !== "undefined" && midiSoundModel instanceof MidiSoundModel) {
			var comp = midiSoundModel.serialize();
			for (var i = 0, c = this.song.length; i < c; i++) {
				if (this.song[i].serialize() === comp) {
					return i;
				}
			}
		}
		return -1;
	}

	MidiSongModel.prototype.serialize = function() {
		var midiSongModel = {};
		midiSongModel.song = this.song;
		return midiSongModel;
	};

	MidiSongModel.prototype.clone = function() {
		return new MidiSongModel(this.serialize());
	};

	return MidiSongModel;
});

/*
	MidiSongModel.prototype.generateMetronome = function(songModel) {
		var note, duration;
		var noteObject = {};
		var metronome = [];
		var currentTime = 0;
		var notes = [];
		timeSig = 4;
		if (typeof songModel !== "undefined") {
			timeSig = songModel.getBeatsFromTimeSignature();
		}
		for (var i = 0, c = 200; i < c; i++) {
			if (i % timeSig === 0) {
				notes = [108]; // C8
			} else {
				notes = [96]; // C7
			}
			duration = 0.5;
			noteObject = new MidiSoundModel({
				'midiNote': notes,
				'type': 'metronome',
				'currentTime': currentTime,
				'duration': duration,
			});
			currentTime += 1;
			metronome.push(noteObject);
		}
		return metronome;
	}
*/
