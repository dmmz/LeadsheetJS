//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "../../",
  paths: {
    jquery: 'external-libs/jquery-2.1.0.min',
    qunit: 'external-libs/qunit/qunit',
    vexflow_helper: 'external-libs/vexflow_test_helpers',
    vexflow: 'external-libs/vexflow-min',
    Midijs: 'external-libs/Midijs/midijs.min',
    pubsub: 'external-libs/tiny-pubsub.min',
    mustache: 'external-libs/mustache',
    LeadsheetJS: 'build/LeadsheetJS-1.0.0.min',
  },
  shim: {
    'LeadsheetJS': {
      exports: 'LS'
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

  var UserLog = require('utils/Userlog');
  var AjaxUtils = require('utils/AjaxUtils');

  /*var SongModel = require('modules/core/src/SongModel');
  var ChordManager = require('modules/core/src/ChordManager');
  var ChordModel = require('modules/core/src/ChordModel');
  var NoteManager = require('modules/core/src/NoteManager');
  var NoteModel = require('modules/core/src/NoteModel');
  var TimeSignatureModel = require('modules/core/src/TimeSignatureModel');

  var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');
  var SectionModel_CSLJson = require('modules/converters/MusicCSLJson/src/SectionModel_CSLJson');
  var BarModel_CSLJson = require('modules/converters/MusicCSLJson/src/BarModel_CSLJson');
  var ChordManager_CSLJson = require('modules/converters/MusicCSLJson/src/ChordManager_CSLJson');
  var ChordModel_CSLJson = require('modules/converters/MusicCSLJson/src/ChordModel_CSLJson');
  var NoteManager_CSLJson = require('modules/converters/MusicCSLJson/src/NoteManager_CSLJson');
  var NoteModel_CSLJson = require('modules/converters/MusicCSLJson/src/NoteModel_CSLJson');

  var SongView_chordSequence = require('modules/chordSequence/src/SongView_chordSequence');

  var SongModel_midiCSL = require('modules/MidiCSL/src/model/SongModel_midiCSL');
  var NoteModel_midiCSL = require('modules/MidiCSL/src/model/NoteModel_midiCSL');
  var PlayerModel_MidiCSL = require('modules/MidiCSL/src/model/PlayerModel_MidiCSL');
  var SongConverterMidi_MidiCSL = require('modules/MidiCSL/src/converters/SongConverterMidi_MidiCSL');

  var LSViewer = require('modules/LSViewer/src/LSViewer');*/

  var HarmonizerController = require('modules/Harmonizer/src/HarmonizerController');
  var HarmonizerView = require('modules/Harmonizer/src/HarmonizerView');
  var ModuleManager = require('modules/ModuleManager/src/ModuleManager');
  var MainMenuModel = require('modules/MainMenu/src/MainMenuModel');
  var MainMenuController = require('modules/MainMenu/src/MainMenuController');
  var MainMenuView = require('modules/MainMenu/src/MainMenuView');

  var menuM = new MainMenuModel();
  var menuV = new MainMenuView(menuM, document.getElementsByTagName('body')[0]);
  var menuC = new MainMenuController(menuM, menuV);

  
  $.subscribe('MainMenuView-render', function(el) {

    var hV = new HarmonizerView();
    var hC = new HarmonizerController(hV);
    hV.render(undefined, true, function(){
      menuM.addMenu({title:'Harmonizer', view: hV});      
      menuC.activeMenu('Harmonizer');
    });

    var hV2 = new HarmonizerView();
    var hC2 = new HarmonizerController(hV2);
    hV2.render(undefined, true, function(){
      menuM.addMenu({title:'Constraint', view: hV2});
    });


  });
  
});