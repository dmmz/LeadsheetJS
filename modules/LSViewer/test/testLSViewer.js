define(['tests/DisplayTester',
	'modules/LSViewer/src/LSViewer',
	'modules/core/src/SongModel',
	'modules/converters/MusicCSLJson/src/SongModel_CSLJson',
	'modules/NoteEdition/src/NoteSpaceManager',
	'modules/ChordEdition/src/ChordSpaceManager',
	'modules/Cursor/src/CursorModel',
	'modules/Cursor/src/CursorController',
	'modules/Cursor/src/CursorListener',
	'modules/NoteEdition/src/NoteEditionController',
	'modules/Tag/src/TagManager',
	'modules/Audio/src/AudioModule',
	//'modules/AudioComments/src/AudioCommentsController',
	'tests/songs/allRhythmicFigures',
	'tests/songs/AloneTogether',
	'tests/songs/Solar',
	'tests/songs/BandaUm',
], function(
	DisplayTester,
	LSViewer,
	SongModel,
	SongModel_CSLJson,
	NoteSpaceManager,
	ChordSpaceManager,
	CursorModel,
	CursorController,
	CursorView,
	NoteEditionController,
	TagManager,
	AudioModule,
	//AudioComments,
	allRhythmicFigures,
	AloneTogether,
	Solar,
	BandaUm) 
	{
	return {
		run: function() {
			
			//constructor functions
			var songModel = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);
			var dispTest = new DisplayTester();

			var viewer = new LSViewer($('#ls1')[0],{typeResize: 'fluid',heightOverflow: 'scroll'});
			viewer.draw(songModel);

			var viewer2 = new LSViewer($('#ls2')[0],{typeResize: 'scale'});
			viewer2.draw(songModel);
			
			dispTest.runTest(function(divContainer){
				var viewer = new LSViewer(divContainer,{heightOverflow:'resizeDiv',layer:true});
				var song = SongModel_CSLJson.importFromMusicCSLJSON(Solar);
				var cM = new CursorModel(song.getComponent('notes'));
			
				var audioModule = new AudioModule(song,{draw:
													{
														viewer: viewer,
														cursorNotes: cM
													}
												});
				var noteSpaceManager = new NoteSpaceManager(cM, viewer);
				var userSession = {name:'Dani', id:'323324422',img:'/tests/img/dani-profile.jpg'};
				//var audioComments = new AudioComments(waveMng,viewer,song,userSession);
				/*audioComments.addComment({
					userName: 'Dani',
					img: '/tests/img/dani-profile.jpg',
					text: 'I am hungry',
					timeInterval: [1.5891220809932014, 2.668046112917529],
					color: '#F00'
				});

				audioComments.addComment({
					userName: 'Dani',
					img: '/tests/img/dani-profile.jpg',
					text: 'I am hungry',
					timeInterval: [3.3, 10.1],
					color: '#0F0'
				});*/

				viewer.draw(song);
				//not used because is not interactive, but draws the score cursor
				audioModule.load('../tests/audio/solar.wav',170);
				//audioComments.draw();

			},{width:1200,height:1000}, "Painting audio");
			
			dispTest.runTest(
				function(divContainer){
					var song = SongModel_CSLJson.importFromMusicCSLJSON(allRhythmicFigures);
					var viewer = new LSViewer(divContainer);
					viewer.draw(song);
				},
				{width:1200,height:1000},
				"Rhythmic figures",
				[
				'Globally: adapting bars per line to width',
				'Bar 4: all figure durations',
				'Bar8: all tie types',
				'Bar 8 to 9: tie jumping line',
				'Bar 10: triplets'
				]
			);
			song = SongModel_CSLJson.importFromMusicCSLJSON(AloneTogether);
			dispTest.runTest(function(divContainer) {
			
				viewer = new LSViewer(divContainer,{heightOverflow:'scroll'});
				viewer.draw(song);
			},
			{width:1200,height:1000},
			"Real song: AloneTogether scroll. div height is 1000 and canvas is larger, so it scrolls. ");

			dispTest.runTest(function(divContainer) {
				viewer = new LSViewer(divContainer,{heightOverflow: 'scroll',layer:true});
				
				var cM = new CursorModel(song.getComponent('notes'));
				var noteSpaceManager = new NoteSpaceManager(cM, viewer);

				var cM = new CursorModel(song.getComponent('chords'));
				var chordSpaceManager = new ChordSpaceManager(song, cM, viewer);

				//drawing tags
				var managers = {
					chords: chordSpaceManager,
					notes: noteSpaceManager
				};
				var tagMng = new TagManager(song, managers, [], undefined, false, true);
				tagMng.setActive(true);
				tagMng.setTags([
					{startBeat:5, endBeat:13, name: "F Major",type:'notes'},
					{startBeat:1, endBeat:4, name: "this is a chord tag", type:'chords'}
				]);

				viewer.draw(song);
				//test drawing on layer 
				viewer.canvasLayer.ctx.font = "18px lato Verdana";
				viewer.canvasLayer.ctx.fillText(" This square is drawn in a new layer (canvas) placed on top of the main canvas", 65, 30);
				viewer.canvasLayer.ctx.fillStyle = "rgb(200,0,0)";
				viewer.canvasLayer.ctx.fillRect (10, 10, 55, 50);
				tagMng.drawTags(viewer);

			},
			{width:1200,height:500},
			"Real song: AloneTogether resideDiv. Same canvas as previous test,  same div height (1000), but now div height is adapted. Also, creating a new layer. Also testing tags");
			
			var songBandaUm = SongModel_CSLJson.importFromMusicCSLJSON(BandaUm);

			dispTest.runTest(function(divContainer){
				var buViewer = new LSViewer(divContainer,{heightOverflow: 'scroll',layer:true});
				buViewer.draw(songBandaUm);
			},
			{width:1200,height:500},
			"Testing whole silences in 2/4 time signatures");
			
		}
	};
});