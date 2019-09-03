/*
	author	: Ghulam Abbass
	date	: 15-aug-2017
	copyritht @ zeddevelopers.com zeddevelopers25@gmail.com || ghulamabbass.1995@gmail.com
    app		: android sms caster
*/

		
		var user_global = null;
		
		var config = {
			apiKey: "AIzaSyAH4-7UgqgXkn0JIwmsds83QRII4NQLdOE",
			authDomain: "shopmm-3ef24.firebaseapp.com",
			databaseURL: "https://shopmm-3ef24.firebaseio.com",
			projectId: "shopmm-3ef24",
			storageBucket: "shopmm-3ef24.appspot.com",
			messagingSenderId: "245188352577"
		  };
		  firebase.initializeApp(config);
		
		var firebase_db				= firebase.database().ref();		
		var firebase_storage		= firebase.storage();	
		var firebase_con			= firebase.database().ref(".info/connected");
		
		var firebase_users			= firebase_db.child("users"); 
		var firebase_device_status	= firebase_db.child("device_status"); 
		
		/*var firebase_setting		= firebase_db.child("setting"); 
		var firebase_activity		= firebase_db.child("activity"); 
		
		var firebase_contact_sync	= firebase_db.child("contact_sync"); 
		var firebase_contact_list	= firebase_db.child("contact_list");*/
		
		var firebase_sms			= firebase_db.child("sms"); 
		var firebase_qr			    = firebase_db.child("qr"); 
		
		firebase_con.on('value', function(snap){
			if (snap.val() === true) {
				$(".connection").removeClass("message-error").removeClass("ui-icon-alert").addClass("message-success ui-icon-cloud")
				.html("You are connected!").fadeIn();
				setTimeout(function(){
					$(".connection").slideUp();
				},2000);
			} else {
				$(".connection").removeClass("message-success").removeClass("ui-icon-cloud").addClass("message-error ui-icon-alert")
				.html("Connecting..").fadeIn();
		 	}	
		});		
			
		firebase.auth().onAuthStateChanged(function(user){			
			if (user){
				$.mobile.changePage("#page", {transition: "slidedown"});
				
			}else{	
				$.mobile.changePage("#login", {transition: "slidedown"});	
			}
		});	
		$("#logout_btn").click(function(e) {
			firebase.auth().signOut().then(function() {
			  	alert("Logout Success!");
				window.location.replace("index.html");	
			}, function(error) {
				alert("Logout Error!");
			});	
        });
		$("#login-form").submit(function(e) {
					
			var email 		= $("#login-email").val();
			var password 	= $("#login-password").val();
			var messageBox 	= $(this).siblings(".message");
			$(messageBox).removeClass("message-error").text("Please wait, signing in..").slideDown();
			
			firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
				var errorCode = error.code;
				var errorMessage = error.message;					
				$(messageBox).addClass("message-error").text(errorMessage);
				$(messageBox).hide().slideDown();
				
			}).then(function(){
				var user 	= firebase.auth().currentUser;	
				if(user){
					$.mobile.changePage("#page", {transition: "slidedown"});
				}	
			}, function(error){
			});	
			e.preventDefault();
		});	
		
		"{\"text\":\"\",\"format\":\"\",\"cancelled\":true}"
		"{\"text\":\"BEGIN:VCARD\\nVERSION:2.1\\nN:Order  (ID:6212771)\\nORG:Shopmm \\nURL:https://shopmm.co\\nEND:VCARD\",\"format\":\"QR_CODE\",\"cancelled\":false}"
		
		function scan(type){
			
			$("#qr_success, #qr_failed").hide();
			
			
			cordova.plugins.barcodeScanner.scan(function(result){
				var cancelled 	= result.cancelled;
				var text 		= result.text;
				if(cancelled == false){
					$("#qr_load").show();
					firebase_qr.push({text:text,type:type}).then(function(e) {
						$("#qr_load").hide();
						$("#qr_success").html("Sent to server!").show();
						setTimeout(function(){
							scan(type);
						},250);
					});
				}
			},function(error){
				alert(JSON.stringify(error));
			});
		}
		
		var check_if_uid = setInterval(function(){
			try{
				var user 	= firebase.auth().currentUser;	
				if(user){					
					user_global = user.uid;					
					firebase_users.child(user.uid).on('value',function(snap) { 
						var user = snap.val();
						$(".display-login-name").text(user.name);
						$(".display-login-email").text(user.email);						
					});
					clearInterval(check_if_uid);
				}	
			}catch (e){}
		},1000);
		
		
		
		
		
		
		
		
	//});

//}

