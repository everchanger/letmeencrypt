/// <reference path="jquery.d.ts" />
var Startup = (function () {
    function Startup() {
    }
    Startup.prototype.main = function (input) {
        input.val('Testing');
        return 0;
    };
    return Startup;
}());
$(document).ready(function () {
    var test = new Startup();
    test.main($('#email'));
});
