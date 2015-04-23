//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "/",
  paths: {
    jquery: 'external-libs/jquery-2.1.0.min',
    qunit: 'external-libs/qunit/qunit',
    vexflow_helper: 'external-libs/qunit/vexflow_test_helpers',
    vexflow: 'external-libs/vexflow-min',
    Midijs: 'external-libs/Midijs/midijs.min',
    pubsub: 'external-libs/tiny-pubsub.min',
    mustache: 'external-libs/mustache'

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

        var LSViewer = require('modules/LSViewer/src/LSViewer'),
          SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson'),
          Solar  = require('tests/songs/Solar'),
          CursorModel = require('modules/Cursor/src/CursorModel'),
          NoteEditionController = require('modules/NoteEdition/src/NoteEditionController'),
          NoteSpaceManager = require('modules/NoteEdition/src/NoteSpaceManager'),
          WaveManager = require('modules/WaveManager/src/WaveManager'),
          WaveManagerView = require('modules/WaveManager/src/WaveManagerView'),
          WaveManagerController = require('modules/WaveManager/src/WaveManagerController');

        var viewer = new LSViewer($("#audioExample")[0],{heightOverflow:'resizeDiv',layer:true});

        var song = SongModel_CSLJson.importFromMusicCSLJSON(Solar);
        var cM = new CursorModel(song.getComponent('notes'));
        var neC = new NoteEditionController(song, cM);
        var params = {
          showHalfWave: true,
          //drawMargins: true,
          topAudio: -100,
          heightAudio: 75/*,
          marginCursor: 20*/
        };
        var waveMng = new WaveManager(song, cM, viewer, params);
        viewer.draw(song);
        var noteSpaceManager = new NoteSpaceManager(song, cM);
        noteSpaceManager.refresh(viewer);
        waveMng.load('/tests/audio/solar.wav');

        var wmv = new WaveManagerView($("#main-container")[0]),
        wmc = new WaveManagerController(waveMng);

        wmv.render();

});