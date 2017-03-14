$(document).ready(function() {	
	// Check if we have a function to run on this page!
	if (typeof OnReady == 'function') { 
		OnReady();
	}	
});

function ajaxUploadFile(elm, callback) {
	var formID = '#' + elm.id;
	var form = $(formID);
	
	$.ajax ({
		type: 'POST',
		url: form.attr('action'),
		data: new FormData(form[0]),
		mimeType:"multipart/form-data",
		processData: false,
		contentType: false,
		success: function (data) {
			callback(formID, data);
		},
		error: function(jqXHR, textStatus, errorThrown) 
		{
			console.log(jqXHR.status, textStatus, errorThrown);     
		}
	});
	
	form.preventDefault();
}

function submitAndRedirect(formName, redirectUrl) {
	formName = '#' + formName;
	var form = $(formName);
	// what if we were to send a url we want the server to respond with, we could then just submit the form without ajax, we simply set the url in a hidden field and then submit the form, the server will look at the hidden form and send us to that page.
	form.append('<input type="hidden" name="url_redirect" value="'+redirectUrl+'" />');
	form.submit();
}