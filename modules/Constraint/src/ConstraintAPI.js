define([
    'utils/AjaxUtils',
], function(AjaxUtils) {

    function ConstraintAPI() {}

    /*
     * This function call the server to generate chords with markov constrain
     * @arg songset (string) is an id of a songset in the database
     * @arg numberOfChords (int) represent the desired number of elements to be returned
     * @arg constraints (array of object) represent the constraints in a specific format {position(int), type(eq|diff), values(array of int)}
     */
    ConstraintAPI.prototype.constraintAPI = function(request, callback) {
        if (typeof globalVariables !== "undefined" && globalVariables.username == "roy") {
            $.ajax({
                url: 'http://localhost:8080/flow/ct',
                dataType: 'json',
                type: 'POST',
                data: request,
                xhrFields: {
                    withCredentials: true
                },
                success: function(data) {
                    if (typeof data !== "undefined") {
                        if (typeof callback !== "undefined") {
                            callback(data);
                        }
                    }
                }
            });
        } else {
            AjaxUtils.servletRequest('flow', 'ct', request, callback);
        }
    };

    return ConstraintAPI;
});