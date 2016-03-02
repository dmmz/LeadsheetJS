//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "../",
  paths: {
    jquery: 'external-libs/jquery-2.1.0.min',
    jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
    qunit: 'external-libs/qunit/qunit',
    vexflow_helper: 'external-libs/qunit/vexflow_test_helpers',
    vexflow: 'external-libs/vexflow-min',
    Midijs: 'external-libs/Midijs/midijs.min',
    pubsub: 'external-libs/tiny-pubsub.min',
    jsPDF: 'external-libs/jspdf/jspdf.min',
    mustache: 'external-libs/mustache',
    bootstrap: 'external-libs/bootstrap/bootstrap.min',
    text: 'external-libs/require-text',
    JsonDelta: 'external-libs/json_delta_1.1.3_minified'
  },
  shim: {
    'qunit': {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    },
    'vexflow': {
      exports: 'Vex'
    },
    'Midijs': {
      exports: 'MIDI'
    },
    JsonDelta: {
      exports: 'JSON_delta'
    }
  }
});

define(function(require) {
  var QUnit = require('qunit');
  var testUserLog = require('utils/test/testUserLog');
  var testAjaxUtils = require('utils/test/testAjaxUtils');
  var testChordUtils = require('utils/test/testChordUtils');
  var testNoteUtils = require('utils/test/testNoteUtils');

  var testSongModel = require('modules/core/test/testSongModel');
  var testSectionModel = require('modules/core/test/testSectionModel');
  var testChordManager = require('modules/core/test/testChordManager');
  var testChordModel = require('modules/core/test/testChordModel');
  var testNoteManager = require('modules/core/test/testNoteManager');
  var testNoteModel = require('modules/core/test/testNoteModel');
  var testBarModel = require('modules/core/test/testBarModel');
  var testBarManager = require('modules/core/test/testBarManager');
  var testSongBarsIterator = require('modules/core/test/testSongBarsIterator');
  var testNotesIterator = require('modules/core/test/testNotesIterator');
  var testPitchClass = require('modules/core/test/testPitchClass');
  var testNote = require('modules/core/test/testNote');

  var testTimeSignatureModel = require('modules/core/test/testTimeSignatureModel');
  var testKeySignatureModel = require('modules/core/test/testKeySignatureModel');

  var testSongModel_CSLJson = require('modules/converters/MusicCSLJson/test/testSongModel_CSLJson');
  var testSectionModel_CSLJson = require('modules/converters/MusicCSLJson/test/testSectionModel_CSLJson');
  var testBarModel_CSLJson = require('modules/converters/MusicCSLJson/test/testBarModel_CSLJson');
  var testChordManager_CSLJson = require('modules/converters/MusicCSLJson/test/testChordManager_CSLJson');
  var testChordModel_CSLJson = require('modules/converters/MusicCSLJson/test/testChordModel_CSLJson');
  var testNoteManager_CSLJson = require('modules/converters/MusicCSLJson/test/testNoteManager_CSLJson');
  var testNoteModel_CSLJson = require('modules/converters/MusicCSLJson/test/testNoteModel_CSLJson');

  var testSongModel_MusicXMl = require('modules/converters/MusicXML/test/testSongModel_MusicXML');

  var testSongView_chordSequence = require('modules/chordSequence/test/testSongView_chordSequence');

  var testSongModel_midiCSL = require('modules/MidiCSL/test/model/testSongModel_midiCSL');
  var testNoteModel_midiCSL = require('modules/MidiCSL/test/model/testNoteModel_midiCSL');
  var testPlayerModel_MidiCSL = require('modules/MidiCSL/test/model/testPlayerModel_MidiCSL');
  var testSongConverterMidi_MidiCSL = require('modules/MidiCSL/test/converters/testSongConverterMidi_MidiCSL');
  var testChordManagerConverterMidi_MidiCSL = require('modules/MidiCSL/test/converters/testChordManagerConverterMidi_MidiCSL');

  var testHistoryModel = require('modules/History/test/testHistoryModel');
  var testHistoryController = require('modules/History/test/testHistoryController');

  var testChordEditionController = require('modules/ChordEdition/test/testChordEditionController');
  var testNoteEditionController = require('modules/NoteEdition/test/testNoteEditionController');
  var testElementView = require('modules/Edition/test/testElementView');
  var testStructureEditionController = require('modules/StructureEdition/test/testStructureEditionController');
  var testFileEditionController = require('modules/FileEdition/test/testFileEditionController');

  var testMainMenuModel = require('modules/MainMenu/test/testMainMenuModel');
  var testMainMenuController = require('modules/MainMenu/test/testMainMenuController');

  var testBarWidthManager = require('modules/LSViewer/test/testBarWidthManager');

  var testCursorModel = require('modules/Cursor/test/testCursorModel');

  var testAudioController = require('modules/Audio/test/testAudioController');

  // Utils
  testUserLog.run();
  testAjaxUtils.run();
  testChordUtils.run();
  testNoteUtils.run();
  // Core Module
  testNoteModel.run();
  testChordModel.run();
  testNoteManager.run();
  testSongModel.run();
  testSectionModel.run();
  testBarModel.run();
  testBarManager.run();
  testChordManager.run();
  testTimeSignatureModel.run();
  testKeySignatureModel.run();
  testSongBarsIterator.run();
  testNotesIterator.run();
  testPitchClass.run();
  testNote.run();
  // MusicCSLJSON Module
  testSongModel_CSLJson.run();
  testSectionModel_CSLJson.run();
  testBarModel_CSLJson.run();
  testChordManager_CSLJson.run();
  testChordModel_CSLJson.run();
  testNoteManager_CSLJson.run();
  testNoteModel_CSLJson.run();

  // MusicXML Module
  testSongModel_MusicXMl.run();

  // Chord Sequence Module
  testSongView_chordSequence.run();

  // Chord Edition
  testChordEditionController.run();

  // Note Edition
  testNoteEditionController.run();
  testElementView.run();

  // Structure Edition
  testStructureEditionController.run();

  // File Edition
  testFileEditionController.run();

  // //LSViewer Module
  testBarWidthManager.run();

  // Midi sound model Module
  testPlayerModel_MidiCSL.run();
  testSongModel_midiCSL.run();
  testNoteModel_midiCSL.run();

  testSongConverterMidi_MidiCSL.run();
  testChordManagerConverterMidi_MidiCSL.run();


  testHistoryModel.run();
  testHistoryController.run();

  testMainMenuModel.run();
  testMainMenuController.run();

  testCursorModel.run();

  testAudioController.run();

  QUnit.load();
  QUnit.start();
});