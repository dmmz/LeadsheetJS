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
        var AudioPlayer = require('modules/Audio/src/AudioPlayer');
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
        var audioDrawer = new AudioDrawer(song, viewer, params);
        var audioCursor = new AudioCursor(audioDrawer, viewer,  song.getComponent('notes'), cM);
        var audioPlayer = new AudioPlayer(audio);
        
        //noteSpaceManager.refresh();
        audio.load('/tests/audio/solar.wav', 170);


        $('#play').click(function(e){
            e.preventDefault();
            console.log("play");
            $.publish('ToPlayer-play');
        });
        $('#pause').click(function(e){
            e.preventDefault();
            console.log("pause");
            $.publish('ToPlayer-pause');
        });
        $('#stop').click(function(e){
            e.preventDefault();
            console.log("stop");
            $.publish('ToPlayer-stop');
        });
        $('#loopOn').click(function(e){
            e.preventDefault();
            console.log("loopOn");
            audio.loop(1,3);
        });
        $('#loopOff').click(function(e){
            e.preventDefault();
            console.log("loopOff");
            audio.disableLoop();
        });
        $('#loopOnWholeSong').click(function(e){
            e.preventDefault();
            console.log("loopOnWholeSong");
            audio.loop();
        });
        (function(){
            var active = false;
            var idSetInterval;
            $("#currentTime").click(function(e){
                e.preventDefault();
                active = !active;
                if (active){
                    console.log("console.log currentTime On");
                    idSetInterval = setInterval(function(){
                        console.log(audio.getCurrentTime());
                    },500);
                    $(this).css({fontWeight:'bold'});
                }else{
                    console.log("console.log currentTime Off");
                    clearInterval(idSetInterval);
                    $(this).css({fontWeight:'normal'});
                }
            })
        })();

        (function(){

          var audios = [
          {
            file:'/tests/audio/Solar_120_bpm.335.mp3',
            tempo: 120
          },{
            file:'/tests/audio/solar.wav',
            tempo: 170
          }];
          var indexAudio = 0;

          $("#switchAudio").click(function(){
            var currAudio = audios[indexAudio];
            audio.load(currAudio.file,currAudio.tempo);
            indexAudio = (indexAudio + 1) % audios.length;
          });
        })();
});