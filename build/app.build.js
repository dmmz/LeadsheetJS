// 1. Install nodejs (it will automatically installs requirejs)
 
//- assuming the folder structure for your app is:
// app
// css
// img
// js
// main.js
// index.html
// build
// app.build.js
// r.js (downloaded from requirejs website)
 
// 2. the command line to run:
// $ node r.js -o app.build.js
//
({
	//- paths are relative to this app.build.js file
		appDir: "../../",
		baseUrl: "js",
		//- this is the directory that the new files will be. it will be created if it doesn't exist
		dir: "../app-build",
		paths: {
			jquery: 'external-libs/jquery-2.1.0',
		},
//	optimizeCss: "standard.keepLines",
	modules: 
	[
		{
			name: "main"
		}
	],
	fileExclusionRegExp: /\.git/
})