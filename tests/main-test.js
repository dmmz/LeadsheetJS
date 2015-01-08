//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "../",
  paths: {
    jquery: 'external-libs/jquery-2.1.0.min',
    qunit: 'external-libs/qunit/qunit',
    vexflow_helper: 'external-libs/qunit/vexflow_test_helpers',
    vexflow: 'external-libs/vexflow-min',
    Midijs: 'external-libs/Midijs/midijs.min',
    pubsub: 'external-libs/tiny-pubsub.min',
    mustache: 'external-libs/mustache',
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
    }
  }
});

define(function(require) {
  var Qunit = require('qunit');

  var testUserLog = require('utils/test/testUserlog');
  var testAjaxUtils = require('utils/test/testAjaxUtils');

  var testSongModel = require('modules/core/test/testSongModel');
  var testChordManager = require('modules/core/test/testChordManager');
  var testChordModel = require('modules/core/test/testChordModel');
  var testNoteManager = require('modules/core/test/testNoteManager');
  var testNoteModel = require('modules/core/test/testNoteModel');
  var testTimeSignatureModel = require('modules/core/test/testTimeSignatureModel');

  var testSongModel_CSLJson = require('modules/converters/MusicCSLJson/test/testSongModel_CSLJson');
  var testSectionModel_CSLJson = require('modules/converters/MusicCSLJson/test/testSectionModel_CSLJson');
  var testBarModel_CSLJson = require('modules/converters/MusicCSLJson/test/testBarModel_CSLJson');
  var testChordManager_CSLJson = require('modules/converters/MusicCSLJson/test/testChordManager_CSLJson');
  var testChordModel_CSLJson = require('modules/converters/MusicCSLJson/test/testChordModel_CSLJson');
  var testNoteManager_CSLJson = require('modules/converters/MusicCSLJson/test/testNoteManager_CSLJson');
  var testNoteModel_CSLJson = require('modules/converters/MusicCSLJson/test/testNoteModel_CSLJson');

  var testSongView_chordSequence = require('modules/chordSequence/test/testSongView_chordSequence');

  var testSongModel_midiCSL = require('modules/MidiCSL/test/model/testSongModel_midiCSL');
  var testNoteModel_midiCSL = require('modules/MidiCSL/test/model/testNoteModel_midiCSL');
  var testPlayerModel_MidiCSL = require('modules/MidiCSL/test/model/testPlayerModel_MidiCSL');
  var testSongConverterMidi_MidiCSL = require('modules/MidiCSL/test/converters/testSongConverterMidi_MidiCSL');

  var testLSViewer = require('modules/LSViewer/test/testLSViewer');
  var testBarWidthManager  = require('modules/LSViewer/test/testBarWidthManager');

  var testHistoryModel = require('modules/History/test/testHistoryModel');

  var testHarmonizerController = require('modules/Harmonizer/test/testHarmonizerController');
  var testModuleManager = require('modules/ModuleManager/test/testModuleManager');
  var testMainMenuModel = require('modules/MainMenu/test/testMainMenuModel');
  var testMainMenuController = require('modules/MainMenu/test/testMainMenuController');

  // Utils
  testUserLog.run();
  testAjaxUtils.run();

  // Core Module
  testNoteModel.run();
  testChordModel.run();
  testNoteManager.run();
  testSongModel.run();
  testChordManager.run();
  testTimeSignatureModel.run();

  // MusicCSLJSON Module
  testSongModel_CSLJson.run();
  testSectionModel_CSLJson.run();
  testBarModel_CSLJson.run();
  testChordManager_CSLJson.run();
  testChordModel_CSLJson.run();
  testNoteManager_CSLJson.run();
  testNoteModel_CSLJson.run();

  // Chord Sequence Module
  testSongView_chordSequence.run();


  // //LSViewer Module
  console.log(Vex);
  testLSViewer.run(Vex);
  testBarWidthManager.run();

  // Midi sound model Module
  testPlayerModel_MidiCSL.run();
  testSongModel_midiCSL.run();
  testNoteModel_midiCSL.run();

  testSongConverterMidi_MidiCSL.run();

  testHarmonizerController.run();

  testHistoryModel.run();

  testModuleManager.run();
  testMainMenuModel.run();
  testMainMenuController.run();

  QUnit.load();
  QUnit.start();
});