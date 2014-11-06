define([
	'utils/AjaxUtils',
], function(AjaxUtils) {
	return {
		run: function() {
			test("AjaxUtils", function(assert) {

				// request function : use like that
				/*var data = {
					'id': '517cc0c058e3388155000001',
					'setName': 'Take6',
				}
				var request = {
					url: 'http://apijava.flow-machines.com:8080/flow/harmonize',
					type: 'GET',
					data: data,
					dataType: 'json', 
					withCredentialsBool: true
				}
				var query = AjaxUtils.request(request, function(data){
					console.log(data);
				});*/
				assert.throws(function() {
					AjaxUtils.request();
				}, 'Empty request should throw an exception');

				assert.throws(function() {
					AjaxUtils.request({
						type: 'GET',
						data: data,
						dataType: 'json',
						withCredentialsBool: true
					});
				}, 'Request without url should throw an exception');


				// servletRequest function : use like that
				/*AjaxUtils.servletRequest('flow', 'harmonizer',{'id':xxx}, function(data){
					console.log(data);
				});*/
				assert.throws(function() {
					AjaxUtils.servletRequest();
				}, 'Empty request should throw an exception');
				assert.throws(function() {
					AjaxUtils.servletRequest('ServletRoot');
				}, 'Empty servletTitle or ServletRoot should throw an exception');
			});
		}
	};
});