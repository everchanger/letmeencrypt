g_keyStore = new KeyStore();

var g_Crypt = window.crypto || window.msCrypto;

$(document).on('change', ':file', function() {
var input = $(this),
	numFiles = input.get(0).files ? input.get(0).files.length : 1,
	label = input.val().replace(/\\/g, '/').replace(/.*\//, '');
	input.trigger('fileselect', [numFiles, label]);
});

$(document).ready(function() {	
	try 
	{
		compabilityCheck();
	} 
	catch(e) 
	{
		showError("Your browser is missing functionallity to run this page correctly");
		return;
	}


	$('#sign-in-button').on('click', function() {
		// This is not as shady as it looks, we stored the users password temporary to be able to decrypt the private key!
		localStorage.setItem("userPassword", $('#user-password').val());
	});

	if($('#friend-search')) {
		$('#friend-search').typeahead({
        autoSelect: true,
        minLength: 2,
        delay: 400,
        source: function (query, process) {
            $.ajax({
                url: '?controller=user&action=find',
                data: {query: query},
                dataType: 'json'
            })
			.done(function(response) {
				return process(response);
			});
        },
		updater: function (item) {
			window.location = '?controller=user&action=profile&id='+item.id;
			return item;
		}
    });
	}
				
	$(':file').on('fileselect', function(event, numFiles, label) {
		var input = $(this).parents('.input-group').find(':text'),
		log = numFiles > 1 ? numFiles + ' files selected' : label;

		if( input.length ) {
			input.val(log);
		} else {
			if( log ) alert(log);
		}

	});
});

var loading_goal = 0;
function startLoading()
{
	$('#loading-bar').removeClass('paused');
	$('#loading-bar').addClass('running');
	$('#loading').show();
	$('#loading').width("1%");

	loading_goal = 1;
}

function loading(progress)
{
	loading_goal += progress; 
	
	if(loading_goal > 100) {
		loading_goal = 100;
	}

	$('#loading').animate({width:(loading_goal + "%")}, 75);
}

function endLoading()
{
	$('#loading-bar').removeClass('running');
	$('#loading-bar').addClass('paused');
	loading(100);
	$('#loading').delay(1500).slideUp();
}

function compabilityCheck() 
{
	if(!window.crypto && !window.msCrypto )
	{
		throw new Error("No crypto object availible");
	}

	if(!window.indexedDB) 
	{
		throw new Error("No indexedDB object availible");
	}
}

function readDataFromFileInput(files, callback) {
	if(files.length <= 0) {
		return;
	}
	
	var file = files[0];
	var fileContent = { data:null };
	
	var reader = new FileReader();
	reader.onloadend = handleReadDone(fileContent, callback);
	reader.onload = (function(output) { return function(e) { output.data = e.target.result; }; })(fileContent);
	reader.readAsArrayBuffer(file);
}

function handleReadDone(input, callback) {
	return function(e) { 
		callback(input.data); 
	};	
}

function readKeyFromInput(keys) {
	if(keys.length <= 0) {
		return;
	}
	
	var key = keys[0];
	var outputArea = $('#output');
	
	var reader = new FileReader();
    reader.onload = (function(output) { return function(e) { output.val(ab2str(e.target.result)); }; })(outputArea);
    reader.readAsArrayBuffer(key);
}

function saveBinaryDataAs(data, filename) {
	saveAs(new Blob([data], {type: "example/binary"}), filename);	
}

function findArrayInArray(haystack, needle, startOffset = 0)
{
    var foundPos = -1;
    var matched = 0;

	if(startOffset >= haystack.length || needle.length > haystack.length) 
	{
		return -1;
	}

    for(var i = 0 + startOffset; i< haystack.length; i++)
    {
        if(haystack[i] == needle[matched]) 
        {
            if(matched == 0) 
            {
                foundPos = i;
            }

            matched++;
            if(matched == needle.length)
            {
                break;
            }
        } 
        else
		{
            matched = 0;
            foundPos = -1;
        }
    }

    return foundPos;
}

function parseResponseBlobs(responseBlob, numberOfBlobs)
{
     // We will recieve a blob containing 'sub-blobs'
    var tmp = new Uint8Array(responseBlob);
    var blobs = Array();
                
    var splitter = new Uint8Array([95,45,124,45,95]);

    var startPos = 0;
    var pos = 0;
    for(var i = 0; i < numberOfBlobs-1; ++i) 
    {
        var pos = findArrayInArray(tmp, splitter, startPos);
        if(pos == -1) {
            throw new Error('No more blob entries found while looking!');
        }

        blobs.push(tmp.slice(startPos, pos));        
        startPos = pos+splitter.length
    }

    blobs.push(tmp.slice(pos+splitter.length));

    return blobs;
}