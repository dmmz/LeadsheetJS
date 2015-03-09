define(function(require) {
	var SongModel = require('modules/core/src/SongModel');
	var SectionModel = require('modules/core/src/SectionModel');
	var BarManager = require('modules/core/src/BarManager');
	var BarModel = require('modules/core/src/BarModel');
	var ChordManager = require('modules/core/src/ChordManager');
	var ChordModel = require('modules/core/src/ChordModel');
	var NoteManager = require('modules/core/src/NoteManager');
	var NoteModel = require('modules/core/src/NoteModel');

	var MusicXMLParser = require('modules/converters/MusicXML/utils/musicXMLParser');
	//var SectionModel_MusicXML = require('modules/converters/MusicXML/src/SectionModel_MusicXML');
	var BarModel_MusicXML = require('modules/converters/MusicXML/src/BarModel_MusicXML');
	var ChordModel_MusicXML = require('modules/converters/MusicXML/src/ChordModel_MusicXML');
	var NoteModel_MusicXML = require('modules/converters/MusicXML/src/NoteModel_MusicXML');

	var SongModel_MusicXML = {};

	SongModel_MusicXML.importFromMusicXML = function(docString, songModel) {
		if (typeof songModel === "undefined" || !(songModel instanceof SongModel)) {
			songModel = new SongModel();
		} else {
			songModel.clear();
		}
		var chordManager = new ChordManager();
		var noteManager = new NoteManager();
		var barManager = new BarManager();

		var mxlParse = new MusicXMLParser();
		//var docString = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"><score-partwise version="3.0"><part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>0</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>G</sign><line>2</line></clef></attributes><note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure></part></score-partwise>';

		//docString = mxlParse.fetch(filepath);
		mxlParse.parse(docString);
		//console.log(mxlParse.measures);
		//console.log(mxlParse.attributes);

		if (typeof mxlParse !== "undefined") {
			Array.prototype.forEach.call(mxlParse.documentElement.getElementsByTagName("credit"), function(node) {
				if (node.hasAttribute("page") && node.attributes["page"].value === "1") {
					var title = node.getElementsByTagName("credit-words")[0].textContent;
					songModel.setTitle(title);
				}
			});
			if (typeof mxlParse.attributes !== "undefined") {
				if (typeof mxlParse.attributes[0] !== "undefined" && typeof mxlParse.attributes[0][0] !== "undefined") {
					if (typeof mxlParse.attributes[0][0].key !== "undefined") {
						songModel.setTonality(mxlParse.attributes[0][0].key);
					}
					if (typeof mxlParse.attributes[0][0].time !== "undefined") {
						songModel.setTimeSignature(mxlParse.attributes[0][0].time.num_beats + '/' + mxlParse.attributes[0][0].time.beat_value);
					} else {
						songModel.setTimeSignature('4/4');
					}
				}
			}
			var section, measure, bar, chord, note, noteElems;
			var chordBeat = [
				[1],
				[1, 3],
				[1, 3, 4],
				[1, 2, 3, 4],
			];
			for (var i = 0, c = mxlParse.partList.length; i < c; i++) {
				section = new SectionModel();
				/*console.log('---Section----');
				console.log(mxlParse);
				console.log(mxlParse.partList[i], mxlParse.staveConnectors[i]);*/
				//SectionModel_MusicXML.importFromMusicXML(mxlParse.partList[i], mxlParse.staveConnectors[i], section);
				if (typeof mxlParse.partName[i] !== "undefined") {
					section.setName(mxlParse.partName[i]);
				}
				songModel.addSection(section);
				section.setNumberOfBars(mxlParse.measures.length);
				for (var barNumber = 0, v = mxlParse.measures.length; barNumber < v; barNumber++) {
					measure = mxlParse.measures[barNumber][0];
					measure = mxlParse.getMeasure(barNumber);
					measure = measure.part[0];

					bar = BarModel_MusicXML.importFromMusicXML(measure.measureInfos);
					barManager.addBar(bar);
					if (typeof measure.chords !== "undefined") {
						for (var k = 0, b = measure.chords.length; k < b; k++) {
							chord = ChordModel_MusicXML.importFromMusicXML(measure.chords[k]);
							chord.setBarNumber(barNumber);
							chord.setBeat(chordBeat[b][k]);
							chordManager.addChord(chord);
						}
					}

					if (typeof measure.notes !== "undefined") {
						for (var k = 0, b = measure.notes.length; k < b; k++) {
							if (measure.notes[k].chord === false) {
								// case it's polyphonic (we keep same rhythm)
								note = NoteModel_MusicXML.importFromMusicXML(measure.notes[k]);
								noteManager.addNote(note);
							} else {
								// case it's not monophonic
								// we reuse last note
								NoteModel_MusicXML.importFromMusicXML(measure.notes[k], note);
							}
						}
					}
				}
			}
			songModel.addComponent('bars', barManager);
			songModel.addComponent('chords', chordManager);
			songModel.addComponent('notes', noteManager);
		}
		return songModel;
	};
	return SongModel_MusicXML;
});