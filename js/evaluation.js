var serverurl = "http://ec2-52-11-203-1.us-west-2.compute.amazonaws.com/evaluation_server";
var login_data;
var leadership_data
var EMAIL;
var PASSWORD;
var TASKID;
$(function() {

  $('#signup-button').on('click', function() {
    var newemail = $("#newemail").val();
    var newpassword = $("#newpassword").val();
    var newfirstname = $("#newfirstname").val();
    var newlastname = $("#newlastname").val();
	var organization = $("#organization").val();
	var emailreg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
	var isFormValid = true;
	var errormsg = "";
	var inputcon = $('input.form-control');
	$('#register-input input.form-control').each(function() {
    if($.trim($(this).val()).length == 0 && $(this).attr('placeholder') != 'Organization')
		{
			isFormValid = false;
			errormsg += $(this).attr('placeholder') + ',';
		}
    });
	
	if(!isFormValid)
	{	
		var message = errormsg + 'can not be empty';
		print_msg(message);	
		
	}else{
		if(emailreg.test(newemail)){
			$.ajax({
				url:serverurl + "/logging.php",
				type:"POST",
				data:{action: "adduser", email: newemail, password: newpassword,
					  firstname: newfirstname, lastname: newlastname, organization:organization},
				success: function(data) {
				  var email = JSON.parse(data)[0];
				  var password = JSON.parse(data)[1];
				  
				  if (email) {
					$('#email').val(email);
					$('#password').val(password);
					$('#login-button').click();
				  }
				  else {
					var message = 'Email address already taken';
					print_msg(message);
				  }
				}
			  });
		}else{
			var message = 'Please type correct email';
			print_msg(message);
		}  
	}
	});


  $('#login-button').on('click', function() {
	  var email = $('#email').val();
      var password = $('#password').val();
	  $.ajax({
      	url:serverurl + "/logging.php",
      	type:"POST",
      	data:{action: "validate_login", email: email, password: password},
      	success: function(data) {
       		login_data = data;			
        	EMAIL = JSON.parse(login_data)[2];
       		PASSWORD = JSON.parse(login_data)[3];
        	var firstname = JSON.parse(login_data)[0];
        	var lastname = JSON.parse(login_data)[1];
        	if (firstname) {
          		localStorage.setItem("EMAIL_CACHED", EMAIL);
          		localStorage.setItem("PASSWORD_CACHED", PASSWORD);
          		view_as_logged();
			}
			else {
			  $("#warning-message").hide();
			  $("#warning-message").html('<span class="help-inline text-danger">Invalid username or password</span>');
			  $("#warning-message").fadeIn('slow');
			}
      	}
    });
  });
  

  if (localStorage.getItem("EMAIL_CACHED") && localStorage.getItem("PASSWORD_CACHED")) {
    $('#email').val(localStorage.getItem("EMAIL_CACHED"));
    $('#password').val(localStorage.getItem("PASSWORD_CACHED"));
    $('#login-button').click();
  } 
  
});

function print_msg(msg){
	$("#warning-register").hide();
	$("#warning-register").html('</br><span class="help-inline text-danger "><i class="glyphicon glyphicon-warning-sign"></i>' + msg + '</span>');
	$("#warning-register").fadeIn('slow');
}

function hover_subtab(){
	$(".navbar-nav >li").hover(function(){
		$(this).find(".nav-folder").css("display","block");
		},function(){
		$(this).find(".nav-folder").css("display","none");
	});
}

function view_as_logged() {
  $.ajax({
    url:serverurl + "/logged.html",
    type:"POST",
    success: function(html) {
      var firstname = JSON.parse(login_data)[0];
      var lastname = JSON.parse(login_data)[1];
      var homepage = sprintf(html, firstname, lastname);
      $('.homepage').html(homepage);
      $(function() {
        fill_logged_content();
		hover_subtab();
      });
    }
  });
}

function print_home_content() {
  var html = "<h1>Home</h1> Fill your content here... ";
  $("#evaluation-page").html(html);
}

function print_classification_content() {
  //TASKID = 1;
  var html = '<section id="classification">'+
  		'<div style="margin-top:100px;padding-bottom:300px"><h2>Classification</h2> Classification task description... ';
  html += '<h4>Upload your results</h4>' +
		'<label class="control-label">Select File</label>' + 
		'<input id="file_to_upload" name="file_to_upload" type="file" multiple=false class="file-loading">' +
		'<div id="kv-success-2" class="alert alert-success fade in" style="margin-top:10px;display:none"></div><div></section>'+
		'<section id="detection"></section>';
  $("#evaluation-page").html(html);
  print_detection_content();
    $("#file_to_upload").fileinput({
        maxFileCount: 1,
        uploadAsync: false,
        uploadUrl:serverurl + "/upload.php",
        mainClass: "input-group-lg",
        allowedFileExtensions: ["json"],
        uploadExtraData: function() {
            return {
                email: EMAIL,
                taskid: 1
            };
        }
    }).on('filebatchpreupload', function(event, data, id, index) {
      $('#kv-success-2').html('<h4>Upload Status</h4><ul></ul>').hide();
    }).on('filebatchuploadsuccess', function(event, data) {
      var out = '';
      var result_url = data.response[0];
      var accuracy = data.response[1];
      $.each(data.files, function(key, file) {
        var fname = file.name;
        out = out + '<li>' + 'Uploaded file: ' +  fname + ' successfully.' + '</li><li>Download your results <a href="' + result_url + '" download>click here!&nbsp <i class="fa fa-download"></i></a></li>';
       });
      $('#kv-success-2 ul').append(out);
      $('#kv-success-2').fadeIn('slow');
    });

    $('#file_to_upload').on('filebrowse', function(event) {
      $('#kv-success-2').hide();
    });

    $('#file_to_upload').on('fileclear', function(event) {
      $('#kv-success-2').hide();
    });
}

function print_detection_content(){
  //TASKID = 2;
  var html ='<div style="margin-top:400px;padding-bottom:100px"><h2>Detection</h2> Detection task description... ';
  html += '<h4>Upload your results</h4>' +
		'<label class="control-label">Select File</label>' + 
		'<input id="detection_upload" name="detection_upload" type="file" multiple=false class="file-loading">' +
		'<div id="kv-success" class="alert alert-success fade in" style="margin-top:10px;display:none"></div><div>';
				
  $("#detection").html(html);
    $("#detection_upload").fileinput({
        maxFileCount: 1,
        uploadAsync: false,
        uploadUrl:serverurl + "/upload.php",
        mainClass: "input-group-lg",
        allowedFileExtensions: ["json"],
        uploadExtraData: function() {
            return {
                email: EMAIL,
                taskid: 2
            };
        }
    }).on('filebatchpreupload', function(event, data, id, index) {
      $('#kv-success').html('<h4>Upload Status</h4><ul></ul>').hide();
    }).on('filebatchuploadsuccess', function(event, data) {
      var out = '';
      var result_url = data.response[0];
      var accuracy = data.response[1];
      $.each(data.files, function(key, file) {
        var fname = file.name;
        out = out + '<li>' + 'Uploaded file: ' +  fname + ' successfully.' + '</li><li>Download your results <a href="' + result_url + '" download>click here!&nbsp <i class="fa fa-download"></i></a></li>';
       });
      $('#kv-success ul').append(out);
      $('#kv-success').fadeIn('slow');
    });

    $('#detection_upload').on('filebrowse', function(event) {
      $('#kv-success').hide();
    });

    $('#detection_upload').on('fileclear', function(event) {
      $('#kv-success').hide();
    });
}


function print_classification_result() {
	var html = '<div class="container-fluid col-sm-12" style="margin-top:100px;margin-bottom:500px"><table id="myTable" class="table table-striped dataTable no-footer sort_table" role="grid" style=" background-color:#EBEBEB;width:100%"><thead><tr role="row">'+
  			   '<th class="sort sorting_desc_disabled" style="width:50px" rowspan="1" colspan="1">RANK</th>'+
			   '<th class="no-sort" style="width:50px" rowspan="1" colspan="1">USERNAME</th>'+
			   '<th class="no-sort" style="width:50px" rowspan="1" colspan="1">ORGANIZATION</th>'+
			   '<th class="no-sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">UPLOADTIME</th>'+
			   '<th class="sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">METRIC1</th>'+
			   '<th class="sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">METRIC2</th>'+
			   '</tr></thead><tbody></tbody></table></div>'+ '<div id="detection-result-page"></div>';
  	$("#evaluation-page").html(html);
	print_detection_result();	
	$.ajax({
		url:serverurl + "/leadership.php",
		type:"POST",
   		data:{action: "classification_action"},
      	success: function(data) {
			//Take all records from JSON 
			var leadership_data = jQuery.parseJSON(data);
			 $.each(leadership_data, function(i, ls){
				 var rank = i + 1;
				$('#myTable').append('<tr><td>'+ ls['rank'] +'</td><td>'+ ls['username'] +'</td><td>'+ ls['organization'] +'</td><td>'+ ls['uploadtime'] +'</td><td>'+ ls['metric1'] +'</td><td>'+ ls['metric2'] +'</td></tr>');
		  	});
			$("table.sort_table").sort_table({ "action" : "init" });		
    	}
	});
}

function print_detection_result() {
	var html = '<section id="task2">' +
			   '<div class="container-fluid col-sm-12" style="margin-top:200px;margin-bottom:500px"><table id="detectionTable" class="table table-striped dataTable no-footer sort_table" role="grid" style=" background-color:#EBEBEB;width:100%"><thead><tr role="row">'+
  			   '<th class="sort sorting_desc_disabled" style="width:50px" rowspan="1" colspan="1">RANK</th>'+
			   '<th class="no-sort" style="width:50px" rowspan="1" colspan="1">USERNAME</th>'+
			   '<th class="no-sort" style="width:50px" rowspan="1" colspan="1">ORGANIZATION</th>'+
			   '<th class="no-sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">UPLOADTIME</th>'+
			   '<th class="sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">METRIC1</th>'+
			   '<th class="sort" sort_status="sortable" style="width:50px" rowspan="1" colspan="1">METRIC2</th>'+
			   '</tr></thead><tbody></tbody></table></div>' + '</section>';
  	$("#detection-result-page").html(html);	
	$.ajax({
		url:serverurl + "/leadership.php",
		type:"POST",
   		data:{action: "detection_action"},
      	success: function(data) {
			//Take all records from JSON 
			var leadership_data = jQuery.parseJSON(data);
			 $.each(leadership_data, function(i, ls){
				 var rank = i + 1;
				$('#detectionTable').append('<tr><td>'+ ls['rank'] +'</td><td>'+ ls['username'] +'</td><td>'+ ls['organization'] +'</td><td>'+ ls['uploadtime'] +'</td><td>'+ ls['metric1'] +'</td><td>'+ ls['metric2'] +'</td></tr>');
		  	});
			$("table.sort_table").sort_table({ "action" : "init" });		
    	}
	});
}

function fill_logged_content() {
  print_home_content();
  $("#home-btn").on("click", function() {
    print_home_content();
  });
  $("#classification-btn").on("click", function() {
    print_classification_content();
	print_detection_content();
  });
  $("#leadership-btn").on("click", function() {
    print_classification_result();
  });
  $("#signout-btn").on("click", function() {
    localStorage.clear();
    location.reload();
  });
}
