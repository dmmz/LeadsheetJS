define([
	'modules/Unfold/src/PointLabel'
	], function(PointLabel) {
	var StartLabel = PointLabel.create();

	StartLabel.CAPO = "CAPO";
	StartLabel.SEGNO = "SEGNO";
	StartLabel.SEGNO2 = "SEGNO2";
	StartLabel.CODATO = "CODATO";
	StartLabel.CODA2TO = "CODA2TO";
	
/*	StartLabel.CAPO = {
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
*/
	StartLabel.SOLOS.push(StartLabel.SEGNO);
	StartLabel.SOLOS.push(StartLabel.SEGNO2);

	StartLabel.fromString = function(name){
		switch (name.toLowerCase()) {
			case "dc": return StartLabel.CAPO;
			case "ds": return StartLabel.SEGNO;
			case "ds2": return StartLabel.SEGNO2;
			case "coda to": return StartLabel.CODATO;
			case "coda2 to": return StartLabel.CODA2TO;
			default: return null;
		}
	};

	return StartLabel;
});