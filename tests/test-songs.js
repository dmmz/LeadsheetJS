define(function(){
	var simpleLeadSheet = {
		composer:"Random Composer",
		title: "Whatever song",
		time: "4/4",
		changes:[
			{
				id:0,
				name:"A",
				bars:[
					{
						chords:[{p:"A",ch:"M7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["g/4"], duration: "8" },
								{ keys: ["e/4"], duration: "8" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["c/4"], duration: "q" }								
						]
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"B",ch:"7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"E",ch:"m",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"F",ch:"7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					}
				]
			}
		]
	};
	var leadSheetTimeSigChanges = {
		composer:"Random Composer",
		title: "Whatever song",
		time: "4/4",
		changes:[
			{
				id:0,
				name:"A",
				bars:[
					{
						chords:[{p:"A",ch:"Maj7",beat:1},{p:"B",ch:"m7",beat:3}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						],
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "8" },
								{ keys: ["f/4"], duration: "8" },
								{ keys: ["g/4"], duration: "q" }
						],
						timeSignature:"3/4",
						chords:[{p:"D",ch:"7",beat:1},{p:"E",ch:"m7",beat:3}],
					},
					{
						chords:[{p:"B",ch:"7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q", tuplet:"start",time_modification:"3/2"},
								{ keys: ["f/4"], duration: "q",  time_modification:"3/2"},
								{ keys: ["g/4"], duration: "q", tuplet:"stop",time_modification:"3/2"},
								{ keys: ["g/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"C",ch:"7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" }
						],
						timeSignature:"2/4"
					},
					{
						chords:[{p:"E",ch:"m",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						],
						timeSignature:"4/4"
					},
					{
						chords:[{p:"G",ch:"m",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"F",ch:"7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					},
					{
						chords:[{p:"A",ch:"m7",beat:1}],
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
					}
				]
			}
		]
	};
	var allNoteFigures = {
		composer:"Random Composer",
		title: "All notes",
		time: "4/4",
		changes:[
			{
				id:0,
				name:"A",
				bars:
				[
					{
						chords:[{p:"A",ch:"M7",beat:1}],
						melody:
						[
								/*{ keys: ["g/4"], duration: "64" },
								{ keys: ["g/4"], duration: "32", dot:1 },
								{ keys: ["g/4"], duration: "32"},
								{ keys: ["g/4"], duration: "16", dot:1 },
								{ keys: ["g/4"], duration: "16"},
								{ keys: ["g/4"], duration: "64" },
								{ keys: ["g/4"], duration: "32", dot:1 },
								{ keys: ["g/4"], duration: "32"},
								{ keys: ["g/4"], duration: "16", dot:1 },
								{ keys: ["g/4"], duration: "16"},
								{ keys: ["g/4"], duration: "8", dot:1 },
								{ keys: ["g#/4"], duration: "8" },
								{ keys: ["g/4"], duration: "q", dot:1 },
								{ keys: ["g/4"], duration: "q", dot:1 },
								{ keys: ["g/4"], duration: "16" },
								{ keys: ["a/4"], duration: "16" },
								{ keys: ["b/4"], duration: "16" },
								{ keys: ["c/4"], duration: "16" },
								{ keys: ["d/4"], duration: "q" },
								
								{ keys: ["a/4"], duration: "8" },
								{ keys: ["b/4"], duration: "8" },
								{ keys: ["d/4"], duration: "q" }*/
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" },
								{ keys: ["g/4"], duration: "32" }
								
								
						]
					},
					{
						melody:
						[
								{ keys: ["a/4"], duration: "q" },
								{ keys: ["f/4"], duration: "q" },
								{ keys: ["g/4"], duration: "q" },
								{ keys: ["e/4"], duration: "q" }
						]
				}]
			}
		]
	};
	return {
		simpleLeadSheet: simpleLeadSheet,
		leadSheetTimeSigChanges: leadSheetTimeSigChanges,
		allNoteFigures: allNoteFigures

	};

});