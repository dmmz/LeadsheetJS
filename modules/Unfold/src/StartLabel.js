define([
	'modules/Unfold/src/PointLabel'
	], function(PointLabel) {
	var StartLabel = PointLabel.create();

	StartLabel.CAPO = {
		name: 'capo',
		string: "CAPO"
	};
	StartLabel.SEGNO = {
		name: 'segno',
		string: "SEGNO"
	};
	StartLabel.SEGNO2 = {
		name: 'segno2',
		string: "SEGNO2"
	};
	StartLabel.CODATO = {
		name: 'coda_to',
		string: "CODATO"
	};
	StartLabel.CODA2TO = {
		name:'coda2_to',
		string: "CODA2TO"
	};

	StartLabel.SOLOS.push(StartLabel.SEGNO);
	StartLabel.SOLOS.push(StartLabel.SEGNO2);

	return StartLabel;
});