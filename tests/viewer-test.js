//Require and Qunit working, done following  http://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests
require.config({
  baseUrl: "../../",
  paths: {
    jquery: 'external-libs/jquery-2.1.0.min',
    qunit: 'external-libs/qunit/qunit',
    text: 'external-libs/require-text',
    vexflow_helper: 'external-libs/qunit/vexflow_test_helpers',
    vexflow: 'external-libs/vexflow-min',
    Midijs: 'external-libs/Midijs/midijs.min',
    pubsub: 'external-libs/tiny-pubsub.min',
    mustache: 'external-libs/mustache'

  },
  shim: {
    'vexflow': {
      exports: 'Vex'
    }/*,
    'Midijs': {
      exports: 'MIDI'
    }*/
  }
});

define(function(require) {

  var Qunit = require('qunit');
  QUnit.config.autostart = false; // to prevent error in chrome  (Uncaught Error: pushFailure() assertion outside test context, was at F.QUnit.start)

  var testLSViewer = require('modules/LSViewer/test/testLSViewer');
  var testBarWidthManager  = require('modules/LSViewer/test/testBarWidthManager');


  // //LSViewer Module
  // //console.log(Vex);
  testLSViewer.run(Vex);
  testBarWidthManager.run();

  QUnit.load();
  QUnit.start();
});