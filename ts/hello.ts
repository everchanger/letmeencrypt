/// <reference path="jquery.d.ts" />

class Startup {
    public main(input:JQuery): number {
        input.val('Testing');
        return 0;
    }
}

$(document).ready(function(){
    let test: Startup = new Startup();
    test.main($('#email'));
});

