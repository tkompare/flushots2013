/**
 * Event class
 */
var Event = (function($){
	var constructor = function()
	{
		this.data = {};
		this.latlng = null;
		this.marker = null;
		this.infobox = null;
		this.infoboxtext = null;
		
		this.toggleInfoBox = function(Map,ThisEvent)
		{
			return function(){
				if(ThisEvent.infobox.visible)
				{
					ThisEvent.infobox.close(Map,ThisEvent.marker);
				}
				else
				{
					ThisEvent.infoboxtext = '<div class="infoBox" style="border:2px solid rgb(16,16,16); margin-top:8px; background:#ddd; padding:5px; font-size:90%;">';
					if(ThisEvent.data.url !== '') { ThisEvent.infoboxtext += '<a href="'+ThisEvent.data.url+'" target="_blank" style="color:#22f">More Information</a> <span id="isical-'+ThisEvent.data.id+'"></span><span id="ical-'+ThisEvent.data.id+'" class="ical"></span><br>'; }
					ThisEvent.infoboxtext += '<span style="font-size:133%">'+ThisEvent.data.facility_name+'</span>';
					if(ThisEvent.data.begin_date === ThisEvent.data.end_date) { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.begin_date; }
					ThisEvent.infoboxtext += '<br>'+ThisEvent.data.recurrence_days+'<br>'+ThisEvent.data.hours+'<br>Cost: '+ThisEvent.data.cost;
					ThisEvent.infoboxtext += '<br>'+ThisEvent.data.street1;
					if(ThisEvent.data.street2 !== '') { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.street2; }
					ThisEvent.infoboxtext += '<br>'+ThisEvent.data.city+', '+ThisEvent.data.state+' '+ThisEvent.data.postal_code;
					if(ThisEvent.data.contact !== '') { ThisEvent.infoboxtext += '<br>Contact: '+ThisEvent.data.contact; }
					if(ThisEvent.data.phone !== '') { ThisEvent.infoboxtext += '<br>'+ThisEvent.data.phone; }
					ThisEvent.infoboxtext += '<br><a class="directions" href="http://www.google.com/maps?';
					if($('#nav-address').val() !== '')
					{
						ThisEvent.infoboxtext += 'saddr='+$('#nav-address').val()+' Chicago, IL&';
					}
					ThisEvent.infoboxtext += 'daddr='+ThisEvent.data.street1+' '+ThisEvent.data.city+', '+ThisEvent.data.state+' '+ThisEvent.data.postal_code+'" target="_blank" style="color:#22f">Get Directions</a>';
					ThisEvent.infoboxtext += '</div>';
					/*
					google.maps.event.addListener(ThisEvent.infobox, 'domready', function() {
						$('#ical-'+ThisEvent.data.id).icalendar({
							start: Date._parse(ThisEvent.data.begin_date),
							end: Date._parse(ThisEvent.data.begin_date),
							title: 'Flu Shot Event',
							summary: 'Flu Shot Event',
							description: "Please remember to bring your immunization/shot records with you.",
							location: ThisEvent.data.facility_name+' - '+ThisEvent.data.street1+' - '+ThisEvent.data.city+' '+ThisEvent.data.state+' '+ThisEvent.data.postal_code,
							iconSize: 16,
							sites: ['icalendar'],
							echoUrl: 'ical.php'
						});
					});
					*/
					ThisEvent.infobox.setContent(ThisEvent.infoboxtext);
					ThisEvent.infobox.open(Map,ThisEvent.marker);
					
				}
			};
		};
		
		this.closeInfoBox = function(Map,Marker,InfoBox)
		{
			if(InfoBox.visible)
			{
				InfoBox.close(Map,Marker);
			}
		};
		
	};
	return constructor;
})(jQuery);