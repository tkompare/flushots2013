/**
 * @classDestription - Placeholder for Flu Shot application variables and functions.
 * @class - Flushot
 */
var Flushots = (function($) {
	var constructor = function(infoboxoptions){
		this.AddressMarker = null;
		
		// Now
		this.now = Date.parse('now');
		
		this.Events = [];
		
		// Can we geolocate?
		this.geolocate = navigator.geolocation;
		
		this.setIcal = function(Event)
		{
			return function(){
				$('#ical-'+Event.data.id).icalendar({
					start: new Date(Date._parse(Event.data.begin_date+' '+Event.data.begin_time)),
					end: new Date(Date._parse(Event.data.begin_date+' '+Event.data.end_time)),
					title: 'Flu Shot Event',
					summary: 'Flu Shot Event',
					description: "Please remember to bring your immunization/shot records with you.",
					location: Event.data.facility_name+' - '+Event.data.street1+' - '+Event.data.city+' '+Event.data.state+' '+Event.data.postal_code,
					iconSize: 16,
					sites: ['icalendar'],
					echoUrl: 'ical.php'
				});
			};
		};
		
		this.getEvents = function(columns,rows,Map)
		{
			// Copy the flu shot data to the Event object
			for (var i in rows)
			{
				this.Events[i] = new Event();
				for(var j in columns)
				{
					var colname = columns[j];
					this.Events[i].data[colname] = rows[i][j];
				}
				// Create the Google LatLng object
				this.Events[i].latlng = new google.maps.LatLng(this.Events[i].data.latitude,this.Events[i].data.longitude);
				// Create the markers for each event
				var icon = 'img/red.png';
				if($.trim(this.Events[i].data.cost.toLowerCase()) === 'free')
				{
					icon = 'img/blue.png';
				}
				this.Events[i].marker = new google.maps.Marker({
					position: this.Events[i].latlng,
					map: Map.Map,
					icon:icon,
					shadow:'img/shadow.png',
					clickable:true
				});
				// Make the info box
				this.Events[i].infobox = new InfoBox(infoboxoptions);
			}
			for(var i in this.Events)
			{
				google.maps.event.addListener(this.Events[i].marker, 'click', this.Events[i].toggleInfoBox(Map.Map,this.Events[i]));
				if(this.Events[i].data.begin_date === this.Events[i].data.end_date)
				{
					google.maps.event.addListener(this.Events[i].infobox, 'domready', this.setIcal(this.Events[i]));
				}
			}
		};
		
		/**
		 * Set the address for a latlng
		 */
		this.codeLatLng = function(Latlng)
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
		};
		
		// Put a Pan/Zoom control on the map
		this.setFindMeControl = function(controlDiv,Map,Flu)
		{
			// Set CSS styles for the DIV containing the control
			// Setting padding to 5 px will offset the control
			// from the edge of the map.
			controlDiv.style.padding = '1em';
			// Set CSS for the control border.
			var controlUI = document.createElement('div');
			controlUI.style.backgroundColor = '#333';
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
			controlText.style.fontFamily = '"Helvetica Neue",Helvetica,Arial,sans-serif';
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
							Flu.codeLatLng(Latlng);
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
		};
		
		this.setMarkersByDay = function(day)
		{
			for(var i in this.Events)
			{
				// Let's see if 'day' is in the day of week list for this event.
				var dayArray = this.Events[i].data.recurrence_days.split(',');
				var onDay = false;
				for(var j in dayArray)
				{
					if (
						$.trim(day.toLowerCase()) === 'all'
						||
						(
							// If 'today'
							$.trim(day.toLowerCase()) === 'today'
							&& Date.getDayNumberFromName(this.now.toString('dddd')) === Date.getDayNumberFromName($.trim(dayArray[j]))
						)
						||
						(
							// If a day of the week
							Date.getDayNumberFromName(day) === Date.getDayNumberFromName($.trim(dayArray[j]))
						)
					)
					{
						onDay = true;
					}
				}
				// If event is after begin date and before end date, and is in the list of days of the week...
				if (
					// If 'day' is in the recurrence days list.
					onDay === true
					&& (
						// When 'day is a day of week, don't worry if event has not begun. 
						// We are looking for today as well as future events.
						$.trim(day.toLowerCase()) !== 'today'
						// Make sure today is on of after event start date.
						|| parseInt(this.now.toString('yyyyMMdd'),10) >= parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10)
					)
					// If today is before or on event end date
					&& parseInt(this.now.toString('yyyyMMdd'),10) <= parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10)
				)
				{
					// See if it is a free event
					if($.trim(this.Events[i].data.cost.toLowerCase()) === 'free')
					{
						this.Events[i].marker.setIcon('img/blue.png');
					}
					else
					{
						// Hand over some dead presidents.
						this.Events[i].marker.setIcon('img/red.png');
					}
				}
				else if
				(
					$.trim(day.toLowerCase()) === 'seven'
					&& onDay === false
					// If today is before or on event end date
					&& (
						parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10) >= parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10)
						|| (
							(parseInt(Date.today().toString('yyyyMMdd'),10) >= parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10) && parseInt(Date.today().toString('yyyyMMdd'),10) <= parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10))
							|| (parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10) >= parseInt(Date.parse(this.Events[i].data.begin_date).toString('yyyyMMdd'),10) && parseInt(Date.today().add({days:6}).toString('yyyyMMdd'),10) <= parseInt(Date.parse(this.Events[i].data.end_date).toString('yyyyMMdd'),10))
						)
					)
				)
				{
					// See if it is a free event
					if($.trim(this.Events[i].data.cost.toLowerCase()) === 'free')
					{
						this.Events[i].marker.setIcon('img/blue.png');
					}
					else
					{
						// Hand over some dead presidents.
						this.Events[i].marker.setIcon('img/red.png');
					}
				}
				else
				{
					this.Events[i].marker.setIcon('img/grey-transparent.png');
				}
			}
		};
	};
	return constructor;
})(jQuery);