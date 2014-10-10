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


require(['tests/core/testNoteModel', 'tests/core/testChordModel', 'tests/core/testNoteManager', 'tests/core/testSongModel', 'tests/core/testChordManager',
 'tests/converters/MusicCSLJson/testSongModel_CSLJson', 'tests/converters/MusicCSLJson/testBarModel_CSLJson','tests/converters/MusicCSLJson/testSectionModel_CSLJson',  'tests/converters/MusicCSLJson/testChordManager_CSLJson', 'tests/converters/MusicCSLJson/testChordModel_CSLJson', 'tests/converters/MusicCSLJson/testNoteManager_CSLJson', 'tests/converters/MusicCSLJson/testNoteModel_CSLJson',
  'qunit'],
  function(testNoteModel, testChordModel, testNoteManager, testSongModel, testChordManager,
   testSongModel_CSLJson, testBarModel_CSLJson,testSectionModel_CSLJson, testChordManager_CSLJson, testChordModel_CSLJson, testNoteManager_CSLJson, testNoteModel_CSLJson,
    Qunit) {

    //Test qui ne marche pas: TypeError: undefined is not a function at NoteModel.populateFromStruct...
    
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



    QUnit.load();
    QUnit.start();
  });
