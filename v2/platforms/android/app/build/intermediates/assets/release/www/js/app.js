$(document).ready(function () {
	var customer_sign 		= "";
	var bar_code 			= "";
	var capture_photo 		= "";
	var app_notes 			= "";
	var global_job_id 		= "";
	var fail_reason 		= "";

	
	var global_name 		= "";
	var global_phone 		= "";
	var global_id 			= "";


	var latitude 			= null;
	var longitude 			= null;
	var altitude 			= null;
	var accuracy 			= null;
	var altitude_accuracy 	= null;
	var heading 			= null;
	var speed 				= null;
	var timestamp 			= null;
	var battery_status 		= null;
	var battery_plugin 		= null;
	var type 				= null;
	var check_battery 		= false;
	var check_gps 			= false;
	
	// barcode
	var barcode_confirm 	= false;
	// Set up the canvas
	var canvas = document.getElementById("sig-canvas");
	var ctx = canvas.getContext("2d");

	ctx.canvas.width = window.innerWidth;
	ctx.canvas.height = window.innerHeight - 55;

	ctx.strokeStyle = "#000000";
	ctx.lineWith = 2;


	// Set up mouse events for drawing
	var drawing = false;
	var mousePos = {
		x: 0,
		y: 0
	};
	var lastPos = mousePos;
	canvas.addEventListener("mousedown", function (e) {
		drawing = true;
		lastPos = getMousePos(canvas, e);
	}, false);
	canvas.addEventListener("mouseup", function (e) {
		drawing = false;
	}, false);
	canvas.addEventListener("mousemove", function (e) {
		mousePos = getMousePos(canvas, e);
	}, false);

	// Get the position of the mouse relative to the canvas
	function getMousePos(canvasDom, mouseEvent) {
		var rect = canvasDom.getBoundingClientRect();
		return {
			x: mouseEvent.clientX - rect.left,
			y: mouseEvent.clientY - rect.top
		};
	}
	// Get a regular interval for drawing to the screen
	window.requestAnimFrame = (function (callback) {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimaitonFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	$(".sign_btn").click(function(){
		window.screen.orientation.lock('landscape');		
		setTimeout(function(){
			ctx.canvas.width = window.innerWidth;
			ctx.canvas.height = window.innerHeight - 55;
		},1000);		
	});
	$(".sign-back-btn").click(function(){
		window.screen.orientation.unlock();
	});
	
	// Draw to the canvas
	function renderCanvas() {
		if (drawing) {
			ctx.moveTo(lastPos.x, lastPos.y);
			ctx.lineTo(mousePos.x, mousePos.y);
			ctx.stroke();
			lastPos = mousePos;
		}
	}

	// Allow for animation
	(function drawLoop() {
		requestAnimFrame(drawLoop);
		renderCanvas();
	})();


	// Set up touch events for mobile, etc
	canvas.addEventListener("touchstart", function (e) {
		mousePos = getTouchPos(canvas, e);
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousedown", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchend", function (e) {
		var mouseEvent = new MouseEvent("mouseup", {});
		canvas.dispatchEvent(mouseEvent);
	}, false);
	canvas.addEventListener("touchmove", function (e) {
		var touch = e.touches[0];
		var mouseEvent = new MouseEvent("mousemove", {
			clientX: touch.clientX,
			clientY: touch.clientY
		});
		canvas.dispatchEvent(mouseEvent);
	}, false);

	// Get the position of a touch relative to the canvas
	function getTouchPos(canvasDom, touchEvent) {
		var rect = canvasDom.getBoundingClientRect();
		return {
			x: touchEvent.touches[0].clientX - rect.left,
			y: touchEvent.touches[0].clientY - rect.top
		};
	}



	$(".logout-btn").click(function (e) {
		window.location.replace("index.html");
	});

	var my_job = function (global_id) {
		$.ajax({
			url: "https://ezay.co/app_services/courier_jobs.php?id=" + global_id,
			success: function (data) {
				data2 = $.parseJSON(data);

				var total = data2.length;

				$.each(data2, function (i, item) {
					var job_id = item.job_id;
					if ($("#parcel_list").children("li[job_id='" + job_id + "']").length == 0) {
						var parcel_receipt_name = "<h2 class='parcel_receipt_name'>" + item.parcel_receipt_name + "</h2>";
						var address = "<p class='address'><strong>" + item.address + "</strong></p>";
						var parcel_id = "<p class='parcel_id'>" + item.parcel_id + "<span class='ui-li-count'>" + item.status + "</span></p>";
						var aside = "<p class='ui-li-aside'></p>";
						$("#parcel_list").append("<li job_id='" + job_id + "'><a parcel_id='" + i + "' class='parcel_details success_box' href='#'>" + parcel_receipt_name + "" + address + "" + parcel_id + "" + aside + "</a></li>");
					} else {
						$("#parcel_list").children("li[job_id='" + job_id + "']").children("a").children(".parcel_receipt_name").text(item.parcel_receipt_name);
						$("#parcel_list").children("li[job_id='" + job_id + "']").children("a").children(".address").children("strong").text(item.address);
						$("#parcel_list").children("li[job_id='" + job_id + "']").children("a").children(".parcel_id").html(item.parcel_id + "<span class='ui-li-count'>" + item.status + "</span>");
					}

					$("#parcel_list")
					.children("li[job_id='" + job_id + "']")
					.children("a")
					.css("background-color", "#" + item.li_color);
				});
				
				$("#parcel_list li").each(function(){
					var job_id_this = $(this).attr("job_id");
					var delete_this = true; 
					$.each(data2, function (i, item) {
						if(job_id_this == item.job_id){
							delete_this = false;
						}
					});
					if(delete_this == true){
						$("#parcel_list").children("li[job_id='"+job_id_this+"']").remove();
					}
				});
				
				
				if (total == 0) {
					$(".total_job").empty().hide();
					$(".no_job").fadeIn();
					$(".jobs").hide();
				} else {
					$(".no_job").hide();
					$(".total_job").text(total + " Job(s) Available").fadeIn();
					$(".jobs").fadeIn();
				}
			},
			complete: function () {
				$(".searching_job").hide();
				$("#parcel_list").listview("refresh");

				setTimeout(function () {
					my_job(global_id);
				}, 2000);
			}
		});
	}


	

	

	

	var sec = 1;
	var my_location = function (global_id) {
		check_battery = false;
		check_gps = false;
		
		window.addEventListener("batterystatus", function(status) {
			//alert("Level: " + status.level + " isPlugged: " + status.isPlugged);
			battery_status = status.level;
			battery_plugin = status.isPlugged;
			check_battery = true;
		}, false);
		
		navigator.geolocation.getCurrentPosition(function(position) {
			latitude			= position.coords.latitude;
			longitude 			= position.coords.longitude;
			altitude 			= position.coords.altitude;
			accuracy 			= position.coords.accuracy;
			altitude_accuracy 	= position.coords.altitudeAccuracy;
			heading 			= position.coords.heading;
			speed 				= position.coords.speed;
			timestamp 			= position.timestamp;
			check_gps 			= true;
		}, function(error) {
			alert("Can not get location because " + error.message);
		});		
		

		//check && check_batttery == true
		var time_interval = setInterval(function () {
			if (check_gps == true ) {
				sec = 1;
				$(".gps_status").removeClass("message-error").addClass("message-success").text("GPS enabled!");

				setTimeout(function(){
					$(".gps_status").slideUp();
				},2000);

				$.ajax({
					url: "https://ezay.co/app_services/app_track_submit.php",
					data: {
						global_id			: global_id,
						latitude			: latitude,
						longitude			: longitude,
						altitude			: altitude,
						accuracy			: accuracy,
						altitude_accuracy	: altitude_accuracy,
						heading				: heading,
						speed				: speed,
						timestamp			: timestamp,
						battery_status		: battery_status,
						battery_plugin		: battery_plugin,
						type				: "location"
					},
					success: function (data) {},
					complete: function () {
						setTimeout(function () {
							my_location(global_id);
						}, 600000); //10 sec
					},error: function () {
						alert("Can not connect with server!");
					}
				});
				clearInterval(time_interval);
			}else{
				if(sec >= 3){
					$(".gps_status").addClass("message-error").html("Please enable your GPS!").fadeIn();
		
				}else{
					$(".gps_status").removeClass("message-error message-success");
					$(".gps_status").html("<img src='img/load-sm.gif' alt='' /> Getting location").fadeIn();
					sec++;
				}
			}
		}, 1000); // after every one sec



	}
	
	$("#login-form").submit(function (e) {
		var phone_number = $("#login-number").val();
		var this_ = $(this);
		var messageBox = $(this).siblings(".message");
		if (phone_number.length == 0) {
			$(messageBox).addClass("message-error").html("Please Enter your Phone No.").hide().fadeIn();
		} else {
			$(messageBox).removeClass("message-error message-success");
			$(messageBox).html("<img src='img/load-sm.gif' alt='' /> validating number...").hide().fadeIn();
			
			$.ajax({
				url: "https://ezay.co/app_services/validate_courier.php", //login page
				data: {
					number: phone_number
				},
				type: 'GET',
				dataType: 'html',
				beforeSend: function (xhr) {
				},
				success: function (data) {
					data = $.parseJSON(data);
					var status = data.status; //success or failed
					var msg = data.msg;
					var name = data.name;
					var id = data.id;

					if (status == "success") {
						$(messageBox).addClass("message-success").html(msg).hide().fadeIn();
						$.mobile.changePage("#dashboard", {
							transition: "slidedown"
						});

						global_name = name;
						global_phone = phone_number;
						global_id = id;

						$(".display-login-name").text(global_name + " (" + global_phone + ")");
						$(".searching_job").fadeIn();

						my_job(global_id); //job
						my_location(global_id); //location / battery
					} else {
						$(messageBox).addClass("message-error").html(msg).hide().fadeIn();
					}
				},
				error: function () {
					$(messageBox).addClass("message-error").html("Can not connect with server!").hide().fadeIn();
					setTimeout(function () {
						$(messageBox).slideUp();
					}, 3000);
				}
			});
		}

		/*		
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
				$.mobile.changePage("#dashboard", {transition: "slidedown"});
			}	
		}, function(error){
		});	
		*/
		e.preventDefault();
	});
	
	$("#fail").submit(function (e) {
		fail_reason = $("#fail_reason").val();
		var messageBox = $(this).siblings(".message");
		$(messageBox).removeClass("message-error message-success");
		if (fail_reason.length > 1) {
			$.ajax({
				url: "https://ezay.co/app_services/app_track_submit.php", //php page
				data: {
					global_id: global_id,
					fail_reason: fail_reason,
					job_id: global_job_id,
					status: "delivery_failed",
					type: "update"
				},
				type: 'GET',
				dataType: 'html',

				beforeSend: function (xhr) {
					$(messageBox).html("<img src='img/load-sm.gif' alt='' /> submitting.. ").hide().fadeIn();
				},
				success: function (data) {
					data = $.parseJSON(data);
					var msg = data.msg;
					var status = data.status;

					if (status == "success") {
						$(messageBox).addClass("message-success").html(msg).hide().fadeIn();
						
						
						//reset variables
						customer_sign 		= "";
						bar_code 			= "";
						capture_photo 		= "";
						app_notes 			= "";
						global_job_id 		= "";
						fail_reason 		= "";
						barcode_confirm 	= false;
					} else {
						$(messageBox).addClass("message-error").html(msg).hide().fadeIn();
					}

					setTimeout(function () {
						$(messageBox).hide();
					}, 3000);
					
					
					
					

					//$.mobile.changePage("#dashboard", {transition: "slidedown"});
				},
				error: function () {
					$(messageBox).addClass("message-error").html("Can not connect with server!").hide().fadeIn();
					setTimeout(function () {
						$(messageBox).slideUp();
					}, 3000);
				}
			});
		} else {
			$(messageBox).addClass("message-error").html("Please enter the reason of failing delivery").hide().fadeIn();
		}
		$("#fail_reason").val("");
		e.preventDefault();
	});
	$(".back-btn").click(function (e) {
		$("#fail_reason").val("");
		$.mobile.changePage("#parcel_detail", {
			transition: "slide"
		});
		e.preventDefault();
	});

	$(".capture_photo").click(function (e) {

		navigator.camera.getPicture(onSuccess, onFail, {
			quality: 25,
			destinationType: Camera.DestinationType.DATA_URL
		});

		function onSuccess(imageData) {
			var image 		= document.getElementById('myImage');
			capture_photo 	= "data:image/jpeg;base64," + imageData;
		}

		function onFail(message) {
			alert('Failed because: ' + message);
		}


	});


	$("#parcel_list").delegate(".parcel_details", "click", function (event) {
		var parcel_id = $(this).attr("parcel_id");

		$.ajax({
			url: "https://ezay.co/app_services/courier_jobs.php?id=" + global_id,
			beforeSend: function (xhr) {
				$(".parcel_details_status").removeClass("message-error");
				$(".parcel_details_status").removeClass("message-success");
				$(".parcel_details_status").html("<img src='img/load-sm.gif' alt='' /> sending to server...").hide().fadeIn();		
			},
			success: function (data) {
				//console.log(data2);
				data2 = $.parseJSON(data);

				global_job_id = data2[parcel_id]["job_id"]; //global
				var history = data2[parcel_id]["history"];
				var name = data2[parcel_id]["parcel_receipt_name"];
				var status = data2[parcel_id]["status"];
				var count = data2[parcel_id]["fail_count"]; //fail_count
				var address = data2[parcel_id]["address"];
				var label = data2[parcel_id]["parcel_id"];
				var notes = data2[parcel_id]["notes"];
				var history = data2[parcel_id]["history"];

				if (notes.length == 0) {
					notes = "No notes";
				}

				$(".name").text(name);
				$(".status").text(status);
				$(".count").text(count);
				$(".address").text(address);
				$(".label").text(label);
				$(".notes").text(notes);
				$(".history").empty();

				if (history.length > 0) {
					$.each(history, function (key, value) {
						$(".history").append("<li>" + value + "</li>");
					});
				} else {
					$(".history").append("<li>No history</li>");
				}

			},
			complete: function (data) {
				$(".parcel_details_status").hide();
			},error: function () {
				$(".parcel_details_status").hide();
				alert("Can not connect with server!");
			}
		});

		$.mobile.changePage("#parcel_detail", {
			transition: "slide"
		});
		event.preventDefault();
	});

	$(".cancel-btn").click(function () {
		$.mobile.changePage("#parcel_detail", {
			transition: "slide"
		});
	});

	$(".clearCanvas").click(function () {
		canvas.width = canvas.width;
		customer_sign = "";
	});

	$(".getCanvas").click(function () {
		customer_sign = canvas.toDataURL();
		window.screen.orientation.unlock();
		$.mobile.changePage("#parcel_detail");
	});
	
	$(".sign-back-btn").click(function () {
		window.screen.orientation.unlock();
	});


	//canvas height/width
	$(".clearNotes").click(function () {
		$("#notes").val("");
		app_notes = "";
		$.mobile.changePage("#parcel_detail");
	});

	$(".getNotes").click(function () {
		app_notes = $("#notes").val();
		$("#notes").val("");
		$.mobile.changePage("#parcel_detail");
	});

	//required for success
	$(".scan_barcode").click(function () {
		cordova.plugins.barcodeScanner.scan(function (result) {
			var cancelled 	= result.cancelled;
			var text 		= result.text;
			if (cancelled == false) {				
				$.ajax({
					url: "https://ezay.co/app_services/app_track_submit.php", //php page
					data: {
						global_id: 	global_id,
						text: 		text,
						type:		"barcode"
					},
					type: 'GET',
					dataType: 'html',
					beforeSend: function (xhr) {
						$(".parcel_details_status").removeClass("message-error");
						$(".parcel_details_status").removeClass("message-success");
						$(".parcel_details_status").html("<img src='img/load-sm.gif' alt='' /> sending to server...").hide().fadeIn();			
					},
					success: function (data) {						
						data = $.parseJSON(data);
						var msg = data.msg;
						var status = data.status;
						if (status == "success") {
							$(".parcel_details_status").addClass("message-success").html(msg).hide().fadeIn();
							barcode_confirm = true;
						} else {
							$(".parcel_details_status").addClass("message-error").html(msg).hide().fadeIn();
						}
						setTimeout(function () {
							$(".parcel_details_status").slideUp();
						}, 5000);
					},
					error: function () {
						$(".parcel_details_status").addClass("message-error").html("Can not connect with server!").hide().fadeIn();
						setTimeout(function () {
							$(".parcel_details_status").slideUp();
						}, 3000);
					}
				});


			}
		}, function (error) {
			alert(JSON.stringify(error));
		});
	});

	$(".scan_pickup, .no_job").click(function () {
		cordova.plugins.barcodeScanner.scan(function (result) {
			var cancelled 	= result.cancelled;
			var text 		= result.text;
			if (cancelled == false) {				
				$.ajax({
					url: "https://ezay.co/app_services/app_track_submit.php", //php page
					data: {
						global_id: 	global_id,
						text: 		text,
						status: 	"on_the_way",
						type:		"update"
					},
					type: 'GET',
					dataType: 'html',
					beforeSend: function (xhr) {
						$(".scan_pickup_status").removeClass("message-error");
						$(".scan_pickup_status").removeClass("message-success");
						$(".scan_pickup_status").html("<img src='img/load-sm.gif' alt='' /> sending to server...").hide().fadeIn();			
					},
					success: function (data) {						
						data = $.parseJSON(data);
						var msg = data.msg;
						var status = data.status;
						if (status == "success") {
							$(".scan_pickup_status").addClass("message-success").html(msg).hide().fadeIn();
						} else {
							$(".scan_pickup_status").addClass("message-error").html(msg).hide().fadeIn();
						}
						setTimeout(function () {
							$(".scan_pickup_status").slideUp();
						}, 5000);
					},
					error: function () {
						$(".scan_pickup_status").addClass("message-error").html("Can not connect with server!").hide().fadeIn();
						setTimeout(function () {
							$(".scan_pickup_status").slideUp();
						}, 3000);
					}
				});


			}
		}, function (error) {
			alert(JSON.stringify(error));
		});
	});

	$(".submit_success").click(function () {

		var messageBox = $(this).siblings(".message");
		$(messageBox).removeClass("message-error message-success");
		if (barcode_confirm == true) {
			$.ajax({
				url: "https://ezay.co/app_services/app_track_submit.php", //php page
				data: {
					global_id: global_id,
					job_id: global_job_id,
					status: "delivered",
					customer_sign: customer_sign,
					bar_code: bar_code,
					capture_photo: capture_photo,
					app_notes: app_notes,
					type: "update"
				},
				type: 'POST',
				beforeSend: function (xhr) {
					$(messageBox).html("<img src='img/load-sm.gif' alt='' /> submitting..").hide().fadeIn();
				},
				success: function (data) {
					data = $.parseJSON(data);
					var msg = data.msg;
					var status = data.status;

					if (status == "success") {
						$(messageBox).addClass("message-success").html(msg).hide().fadeIn();
						
						
						//reset variables
						customer_sign 		= "";
						bar_code 			= "";
						capture_photo 		= "";
						app_notes 			= "";
						global_job_id 		= "";
						fail_reason 		= "";
						barcode_confirm 	= false;
						
					} else {
						$(messageBox).addClass("message-error").html(msg).hide().fadeIn();
					}

					setTimeout(function () {
						$(messageBox).hide();
					}, 3000);
				},
				complete: function () {},
				error: function () {
					$(messageBox).addClass("message-error").html("Can not connect with server!").hide().fadeIn();
					setTimeout(function () {
						$(messageBox).slideUp();
					}, 3000);
				}
			});
		}else{
			$(messageBox).addClass("message-error").text("Please scan a barcode of shipping label, then submit again!").fadeIn();
			setTimeout(function(){
				$(messageBox).slideUp();
			},3000);
		}
	});

	/*
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
	*/


	//});

	//}

});
	
