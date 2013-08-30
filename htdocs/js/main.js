(function($){
	/**
	 * @classDescription - Default settings for this application
	 * @class - Default
	 */
	var Default = {
		// City
		city:'Chicago',
		// DOM ID of where the Google Map is rendered
		domid:'map',
		// Can we geolocate?
		geolocate:navigator.geolocation,
		// Start center latutude of the Google map
		lat:41.875,
		// Start center longitude of the Google map
		lng:-87.6425,
		// State
		state:'Illinois',
		// Defined style types passed to TkMap
		styles:'grey minlabels',
		// Initial zoom level for the Google map
		zoom:12,
		// Zoom for finding address
		zoomaddress:14
	};
	
	/**
	 * @classDestription - Placeholder for Flu Shot application variables and functions.
	 * @class - Flushot
	 */
	var Flushots = {
		AddressMarker:null,
		codeLatLng:function(Latlng)
		{
			var Geocoder = new google.maps.Geocoder();
			Geocoder.geocode(
				{'latLng': Latlng},
				function(Results,Status)
				{
					if (Status == google.maps.GeocoderStatus.OK)
					{
						if (Results[0])
						{
							var formattedAddress = Results[0].formatted_address.split(',');
							$('#nav-address').val(formattedAddress[0]);
							$('#nav-address').blur();
							$('#nav-go').click();
						}
						else
						{
							alert('We\'re sorry. We could not find an address for this location.');
						}
					}
					else
					{
						alert('We\'re sorry. We could not find an address for this location.');
					}
				}
			);
		},
		// Put a Pan/Zoom control on the map
		panZoomControl:function(controlDiv,Map)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '1em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#000';
			//controlUI.style.color = 'white';
			controlUI.style.borderStyle = 'solid';
			controlUI.style.borderWidth = '0px';
			controlUI.style.cursor = 'pointer';
			controlUI.style.textAlign = 'center';
			controlUI.style.borderRadius = '6px';
			controlUI.title = 'Click to find your location.';
			controlDiv.appendChild(controlUI);
			// Set CSS for the control interior.
			var controlText = document.createElement('div');
			controlText.style.fontFamily = 'sans-serif';
			controlText.style.fontSize = '12px';
			controlText.style.color = '#fff';
			controlText.style.paddingLeft = '.5em';
			controlText.style.paddingRight = '.5em';
			controlText.style.paddingTop = '.3em';
			controlText.style.paddingBottom = '.3em';
			controlText.innerHTML = 'Find Me';
			controlUI.appendChild(controlText);
			// Setup the click event listeners.
			google.maps.event.addDomListener(controlUI, 'click', function() {
				console.log('click!');
				if(navigator.geolocation)
				{
					navigator.geolocation.getCurrentPosition(
						// Success
						function(position)
						{
							//_gaq.push(['_trackEvent', 'GPS', 'Success']);
							var Latlng = new google.maps.LatLng(
								position.coords.latitude,
								position.coords.longitude
							);
							Flushots.codeLatLng(Latlng);
						},
						// Failure
						function()
						{
							alert('We\'re sorry. We could not find you. Please type in an address.');
						},
						{
							timeout:5000,
							enableHighAccuracy:true
						}
					);
				}
			});
		}
	};
	
	/* 
	 * jQuery's 'on document ready' function
	 * Run this after the DOM is fully loaded.
	 */
	$(function(){
		/**
		 * @classDescription - Construct the Map object
		 * @class - Map
		 */
		var Map = new TkMap({
			domid:Default.domid,
			init:true,
			lat:Default.lat,
			lng:Default.lng,
			styles:Default.styles,
			zoom:Default.zoom
		}); // END Map object constructor
		if(Default.geolocate)
		{
			var PanZoomControlDiv = document.createElement('div');
			Flushots.panZoomControl(PanZoomControlDiv,Map);
			PanZoomControlDiv.index = 1;
			Map.Map.controls[google.maps.ControlPosition.TOP_RIGHT].push(PanZoomControlDiv);
		}
		
		/*
		 * The brand popover
		 */
		$('#nav-brand').popover({
			placement:'auto top',
			title:'<b>Get A Flu Shot Help</b>',
			html:true,
			content:'<small>This is some <b>help</b> text. Bacon turducken t-bone tri-tip jowl biltong pork belly kielbasa drumstick venison short loin. Shoulder andouille strip steak filet mignon meatball, ham short loin swine chuck brisket. Ground round tenderloin meatball shank. Pork loin strip steak short loin shank turducken tenderloin chicken ball tip corned beef ground round spare ribs. Shank ham chicken turkey, doner meatloaf tri-tip beef ribs cow tenderloin pork chop. Jowl frankfurter ground round, tail swine filet mignon salami fatback leberkas.</small>'
		}); // END brand popover
		
		/*
		 * The agency popover
		 */
		$('#nav-agency').popover({
			placement:'auto top',
			title:'<b>About This Web App</b>',
			html:true,
			content:'<small>Built by <a href="http://about.me/tomkompare" target="_blank">Tom Kompare</a>. This was not developed by the <a href="http://www.cityofchicago.org/city/en/depts/cdph.html" target="_blank">Chicago Department of Public Health (CDPH)</a> and CDPH makes no representations as to the accuracy of the information provided by this map application. <a href="https://github.com/tkompare/flushots2013" target="_blank">The code behind this web application</a> is free and open under an MIT License. <a href="https://github.com/tkompare/flushots2013/issues" target="_blank">Feel free to send me comments</a>.</small>'
		}); // END brand popover
		
		/*
		 * The Day dropup list listener
		 */
		$('.day').change(function(){
			$('#nav-li-today').removeClass('active');
			$('#nav-li-days').addClass('active');
			$('#nav-days-text').text($(this).val());
		}); // END Day dropup listener
		
		$('#nav-today').click(function(){
			$('#nav-li-days,.day-btn').removeClass('active');
			$('#nav-li-today').addClass('active');
			$('#nav-days-text').text('On A Day');
		}); // END Day dropup listener
		
		$('#nav-address').change(function(){
			if($(this).val().length === 0)
			{
				if(Flushots.AddressMarker !== null)
				{
					Flushots.AddressMarker.setMap(null);
				}
			}
		});
		
		// Go button listener
		$('#nav-go').click(function(){
			if($('#nav-address').val().length > 0)
			{
				var Geocoder = new google.maps.Geocoder();
				Geocoder.geocode(
					{
						address:$('#nav-address').val()+', '+Default.city+', '+Default.state
					},
					// Google returned a status
					function(Results, Status)
					{
						// Google returned an OK status
						if (Status == google.maps.GeocoderStatus.OK)
						{
							// Google returned a location
							if (Results[0])
							{
								Map.Map.panTo(Results[0].geometry.location);
								Map.Map.setZoom(Default.zoomaddress);
								// Make a map marker if none exists yet
								if(Flushots.AddressMarker === null)
								{
									Flushots.AddressMarker = new google.maps.Marker({
										position:Results[0].geometry.location,
										map: Map.Map,
										icon:'/img/red-dot.png',
										clickable:false
									});
								}
								else
								{
									// Move the marker to the new location
									Flushots.AddressMarker.setPosition(Results[0].geometry.location);
									// If the marker is hidden, unhide it
									if(Flushots.AddressMarker.getMap() === null)
									{
										Flushots.AddressMarker.setMap(Map.Map);
									}
								}
							}
							else
							{
								// Google didn't return a location
								alert('Sorry! We couldn\'t find that address.');
							}
						}
						else
						{
							// Google didn't return an OK status
							alert('Sorry! We couldn\'t find that address.');
						}
					}
				);
			}
			else
			{
				// Dude. The 'nav-address' input is empty
				alert('Please enter a Chicago street address in the box next to the "Go" button in the bottom navigation bar.');
			}
		}); // END Go button listener
		
		// Find me button listener
		$('body').on('click','#address-gps',function(){
			_gaq.push(['_trackEvent', 'Find Me Button', 'Click']);
			if(navigator.geolocation)
			{
				navigator.geolocation.getCurrentPosition(
					// Success
					function(position)
					{
						_gaq.push(['_trackEvent', 'GPS', 'Success']);
						var latlng = new google.maps.LatLng(
							position.coords.latitude,
							position.coords.longitude
						);
						codeLatLng(latlng);
					},
					// Failure
					function()
					{
						alert('We\'re sorry. We could not find you. Please type in an address.');
					},
					{
						timeout:5000,
						enableHighAccuracy:true
					}
				);
			}
		});
		
	}); // END jQuery on document ready
})(jQuery);