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
        var Audio = require('modules/Audio/src/AudioController');
        var AudioDrawer = require('modules/Audio/src/AudioDrawer');
        var AudioCursor = require('modules/Audio/src/AudioCursor');
        var Cursor = require('modules/Cursor/src/Cursor');

        var LSViewer = require('modules/LSViewer/src/main'),
          SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson'),
          Solar  = require('tests/songs/Solar'),
          CursorModel = require('modules/Cursor/src/CursorModel'),
          NoteEditionController = require('modules/NoteEdition/src/NoteEditionController'),
          NoteSpaceManager = require('modules/NoteEdition/src/NoteSpaceManager');

        var song = SongModel_CSLJson.importFromMusicCSLJSON(Solar);
        var cM = new CursorModel(song.getComponent('notes'));
        var viewer = new LSViewer.LSViewer($("#audioExample")[0],{heightOverflow:'resizeDiv',layer:true});
        var noteSpaceManager = new NoteSpaceManager(cM, viewer);
        LSViewer.OnWindowResizer(song);

        
        // var neC = new NoteEditionController(song, cM);
        // var params = {
        //   showHalfWave: true,
        //   //drawMargins: true,
        //   topAudio: -100,
        //   heightAudio: 75/*,
        //   marginCursor: 20*/
        // };
        var audio = new Audio(16.941);
        
        
        var params = {
          showHalfWave: true,
          //drawMargins: true,
          topAudio: -120,
          heightAudio: 75,
        };
        var audioDrawer = new AudioDrawer(song, viewer, 170, params);
        var audioCursor = new AudioCursor(audioDrawer, viewer,  song.getComponent('notes'), cM);
        
        //noteSpaceManager.refresh();
        audio.load('/tests/audio/solar.wav');


        $('#play').click(function(e){
            e.preventDefault();
            audio.play();
        });
        
        $('#pause').click(function(e){
            e.preventDefault();
            audio.pause();
        });
        $('#loopOn').click(function(e){
            e.preventDefault();
            audio.loop(1,3);
        });
        $('#loopOff').click(function(e){
            e.preventDefault();
            audio.disableLoop();
        });
        $('#loopOnWholeSong').click(function(e){
            e.preventDefault();
            audio.loop();
        });

        $('#stop').click(function(e){
            e.preventDefault();
            audio.stop();
        });
        setInterval(function(){
          console.log(audio.getCurrentTime());
        },500);

});