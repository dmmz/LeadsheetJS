require.config({
	// baseUrl: "./",
	deps: ['jquery', 'pubsub', 'bootstrap', 'vexflow'],
	paths: {
		jquery: 'node_modules/jquery/dist/jquery.min',
		jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		vexflow: 'external-libs/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'external-libs/mustache',
		text: 'external-libs/require-text',
		bootstrap: 'external-libs/bootstrap/bootstrap.min',
		jsPDF: 'external-libs/jspdf/jspdf.min',
		underscore: 'node_modules/underscore/underscore-min',
		deepdiff: 'node_modules/deep-diff/index',
	},
	shim: {
		jquery: {
			exports: '$'
		},
		pubsub: {
			deps: ['jquery']
		},
		bootstrap: {
			deps: ['jquery']
		},
		vexflow: {
			exports: 'Vex'
		},
		Midijs: {
			exports: 'MIDI'
		},
		underscore : {
			exports: '_'	
		}
	}
});