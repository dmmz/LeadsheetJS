require.config({
	// baseUrl: "./",
	deps: ['jquery', 'pubsub', 'bootstrap', 'vexflow'],
	paths: {
		jquery: 'node_modules/jquery/dist/jquery.min',
		jquery_autocomplete: 'external-libs/jquery.autocomplete.min',
		vexflow: 'node_modules/vexflow/releases/vexflow-min',
		Midijs: 'external-libs/Midijs/midijs.min',
		pubsub: 'external-libs/tiny-pubsub.min',
		mustache: 'node_modules/mustache/mustache.min',
		text: 'node_modules/requirejs-text/text',
		bootstrap: 'node_modules/bootstrap/docs/assets/js/bootstrap.min',
		jsPDF: 'node_modules/jspdf/dist/jspdf.min',
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