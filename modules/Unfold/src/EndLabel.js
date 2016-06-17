define([
	'modules/Unfold/src/PointLabel'
	], function(PointLabel) {

	var EndLabel = PointLabel.create();

	EndLabel.TOCODA = {
		name: 'coda',
		string: "Coda"
	};
	EndLabel.TOCODA2 = {
		name: 'coda2',
		string: "Coda2"
	};
	EndLabel.FINE = {
		name: 'fine',
		string: "Fine"
	};
	EndLabel.END = {
		name: 'end',
		string: "End"
	};

	EndLabel.TOCODAS.push(EndLabel.TOCODA);
	EndLabel.TOCODAS.push(EndLabel.TOCODA2);

	EndLabel.SOLOS.push(EndLabel.FINE);

	return EndLabel;
});