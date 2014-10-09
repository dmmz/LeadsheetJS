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


require(['tests/testNoteModel', 'tests/testChordModel', 'tests/testNoteManager',  'tests/testChordManager', 'qunit'],
  function(testNoteModel, testChordModel, testNoteManager, testChordManager, Qunit) {

    //Test qui ne marche pas: TypeError: undefined is not a function at NoteModel.populateFromStruct...
    testNoteModel.run();
    testChordModel.run();
    testNoteManager.run();
    testChordManager.run();

    QUnit.load();
    QUnit.start();
  });
