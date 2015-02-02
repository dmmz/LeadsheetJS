require.config({
	baseUrl: "../../",
	paths: {
		jquery: 'external-libs/jquery-2.1.0.min',
		vexflow: 'external-libs/vexflow-min'
		//Midijs: 'external-libs/Midijs/midijs.min',
		//pubsub: 'external-libs/tiny-pubsub.min'
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
	
	var LSViewer = require('modules/LSViewer/src/LSViewer');
	var SongModel = require('modules/core/src/SongModel');
	var SongModel_CSLJson = require('modules/converters/MusicCSLJson/src/SongModel_CSLJson');

	var AloneTogether = require('tests/songs/AloneTogether');
	var $ = require('jquery');
	var Vex = require('vexflow');

	// console.log(Vex);
	// var LeadsheetJS = {
	// 		init: function(divId, jsonLeadhseet, options){
	// 	}
	// };
	
	$(function(){
			// canvas = $("<canvas></canvas>");
			// canvas.width(width);
			// canvas.attr('id',"scoreCanvas");

		//	$("#score").append(canvas);
			//LeadsheetJS.init("leadsheet1",AloneTogether,{player:true});
			
			var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether, new SongModel());
			
			var score = $("#score");
			var canvasEl =  $('#scoreCanvas');
			canvasEl[0].width =  score.width();
			canvasEl[0].height= 1000;
			
			var renderer = new Vex.Flow.Renderer($('#scoreCanvas')[0], Vex.Flow.Renderer.Backends.CANVAS);
			var ctx = renderer.getContext("2d");
			
			var viewer = new LSViewer(ctx,{width:$('#scoreCanvas').width()});
			viewer.draw(songModel);

			$(window).resize(function() { 
				setInterval(function(){ 
					var score = $("#score");
					var canvasEl =  $('#scoreCanvas');
					canvasEl[0].width =  score.width();
					viewer.setWidth($('#scoreCanvas')[0].width);
					viewer.draw(songModel);

				}, 500);
				
			});
	});


});