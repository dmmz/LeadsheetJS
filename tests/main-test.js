//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "../",
  paths: {
    // jquery: 'external-libs/jquery-2.1.0.min',
    qunit: 'external-libs/qunit/qunit'

  },
  shim: {
    'qunit': {
      exports: 'QUnit',
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    }
  }
});


require(['modules/core/test/testNoteModel', 'modules/core/test/testChordModel', 'modules/core/test/testNoteManager', 'modules/core/test/testSongModel', 'modules/core/test/testChordManager',
 'modules/converters/MusicCSLJson/test/testSongModel_CSLJson', 'modules/converters/MusicCSLJson/test/testBarModel_CSLJson','modules/converters/MusicCSLJson/test/testSectionModel_CSLJson',  'modules/converters/MusicCSLJson/test/testChordManager_CSLJson', 'modules/converters/MusicCSLJson/test/testChordModel_CSLJson', 'modules/converters/MusicCSLJson/test/testNoteManager_CSLJson', 'modules/converters/MusicCSLJson/test/testNoteModel_CSLJson',
 'modules/chordSequence/test/testSongView_chordSequence',
 'modules/MidiCSLModel/test/testSongModel_midiCSLModel', 'modules/MidiCSLModel/test/testNoteModel_midiCSLModel',
 'modules/converters/MidiCSL/test/testSongConverterMidi_MidiCSL',
  'qunit'],
  function(testNoteModel, testChordModel, testNoteManager, testSongModel, testChordManager,
   testSongModel_CSLJson, testBarModel_CSLJson,testSectionModel_CSLJson, testChordManager_CSLJson, testChordModel_CSLJson, testNoteManager_CSLJson, testNoteModel_CSLJson,
   testSongView_chordSequence,
   testSongModel_midiCSLModel, testNoteModel_midiCSLModel,
   testSongConverterMidi_MidiCSL,
    Qunit) {

        
    // Core Module
    testNoteModel.run();
    testChordModel.run();
    testNoteManager.run();
    testSongModel.run();
    testChordManager.run();

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

    // Midi sound model Module
    testSongModel_midiCSLModel.run();
    testNoteModel_midiCSLModel.run();
    
    testSongConverterMidi_MidiCSL.run();

    QUnit.load();
    QUnit.start();
  });