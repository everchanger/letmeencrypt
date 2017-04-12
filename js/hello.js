var Startup = (function () {
    function Startup() {
    }
    Startup.prototype.main = function () {
        console.log('Testing TypeScript');
        return 0;
    };
    return Startup;
}());
var test = new Startup();
test.main();
