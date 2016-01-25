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

        var LSViewer = require('modules/LSViewer/src/LSViewer'),
          SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson'),
          Solar  = require('tests/songs/Solar'),
          CursorModel = require('modules/Cursor/src/CursorModel'),
          NoteEditionController = require('modules/NoteEdition/src/NoteEditionController'),
          NoteSpaceManager = require('modules/NoteEdition/src/NoteSpaceManager');

        var viewer = new LSViewer($("#audioExample")[0],{heightOverflow:'resizeDiv',layer:true});
        var song = SongModel_CSLJson.importFromMusicCSLJSON(Solar);
        var cM = new CursorModel(song.getComponent('notes'));
        var noteSpaceManager = new NoteSpaceManager(cM, viewer);
        viewer.draw(song);
        
        // var neC = new NoteEditionController(song, cM);
        // var params = {
        //   showHalfWave: true,
        //   //drawMargins: true,
        //   topAudio: -100,
        //   heightAudio: 75/*,
        //   marginCursor: 20*/
        // };
        var audio = new Audio(16.941);

        var audioDrawer = new AudioDrawer(song, viewer, 170);
        
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
        // var wmv = new WaveManagerView($("#main-container")[0]),
        // wmc = new WaveManagerController(waveMng);

        //wmv.render();

});