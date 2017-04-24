function OnReady() 
{
    $('#target_friend').on('change', target_changed);
    $('#target_me').on('change', target_changed);

    $('#plain_file').on('change', function() {
		$('#encrypt').prop("disabled", false); 		
	});

    $('#encrypt').on('click',  function() {
		var files = $('#plain_file').prop("files");
		readDataFromFileInput(files, encryptUserFile);			
	});
}

function target_changed(evt) 
{
    if($(this).val() == "myself") {
        $('#friend_list').hide();
    } else {
        $('#friend_list').show();
    }
}

async function encryptUserFile(file) {
	var Crypt = window.crypto || window.msCrypto;
	
	console.log(file);
}