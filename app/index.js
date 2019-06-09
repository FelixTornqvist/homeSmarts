// This is the program for "HomeSmarts", a webapp for setting timers for, and 
// controlling your outlets manually. The server calls are commented out and
// replaced with alert()'s so that you can replace them with your own http calls.

// The structure that keeps track of all of the events
let outlets = [
	{
		"name": "Vardagsrum takfläkt",
		"events": [
			{ "time": 1080, "on": true },
			{ "time": 1260, "on": false },
			{ "time": 720, "on": false }
		]
	}
];

let editingEnabled = false;
let darkModeActive = null;
let darkModeOverride = false;

// these are indexes for the 'outlets' variable
let eventBeingEdited = -1;
let outletBeingEdited = -1;

// Initial setup
$(document).ready(function() {
	// get outlet settings from server. 
	// Tip: use python -m SimpleHTTPServer 8080 to test this
	$.get('outlet_settings.json', function(ret) {
		try {
			outlets = JSON.parse(ret);
			renderEvents();
			renderOutletOptions();
			renderOutletButtons();
		} catch (err) {
			alert('something went wrong while getting outlet settings: ' + err);
		}
	});

	$('#edit-event-fields').hide();
	$('#editing-tip').hide();
	$('#edit-events-btn').click(editbuttonClick);
	$('#darkmode-switch').click(darkmodeClick);

	renderEvents();
	
	// Using a timeout because the elements haven't appeared yet
	setTimeout(function () {
		$('.add-event-button').hide();
	}, 10);

	renderOutletOptions();
	renderOutletButtons();

	$('#outlet').change(eventFormUpdated);
	$('#edit-time').change(eventFormUpdated);
	$('#edit-outlet-on').change(eventFormUpdated);

	updateTime(new Date());
	setInterval(function(){updateTime(new Date())}, 10 * 1000); // update every 10th second
});

// ========== Events ==========

function updateTime(now) {
	$('.clock').text(getHourMinuteString(now));

	if (!darkModeOverride) {
		const hour = now.getHours();
		const oldMode = darkModeActive;
		darkModeActive = hour >= 18 || hour <= 7;

		if (oldMode !== darkModeActive) {
			renderDarkMode();
		}
	}
}

function powerButtonClick(outletInd, on) {
	const handleResponse = (response) => {
		 console.log('response: ' + response);
	};

	$.post('api/toggle',
		JSON.stringify({ outlet: outletInd, on: on }),
		handleResponse,
	);
}

function saveEventsClick() {
	// this would be sent to a server that controls actual power outlets.
	alert('save events:\n' + JSON.stringify(outlets));

	// Something like this:
	// $.post('api/events', { events: outlets });
}

function darkmodeClick() {
	darkModeActive = !darkModeActive;
	darkModeOverride = true;
	renderDarkMode();
}

function editbuttonClick() {
	if (!editingEnabled) {
		editingEnabled = true;
		$('#editing-tip').show();
		$('.add-event-button').show();
		$('#edit-events-btn').html('Save');
	} else {
		saveEventsClick();
		editingEnabled = false;
		$('#editing-tip').hide();
		$('#edit-event-fields').hide();
		$('.add-event-button').hide();
		$('#edit-events-btn').html('Edit');

		eventBeingEdited = -1;
		outletBeingEdited = -1;
	}
}

function editEventClick(outletInd, eveInd) {
	if (editingEnabled) {
		const outlet = outlets[outletInd];
		const eve = outlet.events[eveInd];

		$('#editing-tip').hide();
		$('#edit-event-fields').show();
		$('#outlet').val(outletInd);
		$('#edit-time').val(fromMinsToClock(eve.time));
		$('#edit-outlet-on').val(eve.on?'1':'0');

		eventBeingEdited = eveInd;
		outletBeingEdited = outletInd;
	}
}

// Called when the form for editing an event got one of its values changed.
function eventFormUpdated() {
	if (editingEnabled && eventBeingEdited >= 0 && outletBeingEdited >= 0) {
		const newOutletInd = Number($('#outlet').val());
		const newTime = inMinsFromStr($('#edit-time').val());
		const newOutletOn = $('#edit-outlet-on').val() == '1';

		// user wants to move event to other outlet
		if (newOutletInd !== outletBeingEdited) {
			removeEvent(outletBeingEdited, eventBeingEdited);
			const newOutlet = outlets[newOutletInd] 

			eventBeingEdited = newOutlet.events.length;
			outletBeingEdited = newOutletInd;
			newOutlet.events.push({time: newTime, on: newOutletOn});
		} else {
			const outlet = outlets[outletBeingEdited];
			const eve = outlet.events[eventBeingEdited];
			eve.time = newTime;
			eve.on = newOutletOn;
		}
		renderEvents()
	}
}


// ========== Rendering ==========

function renderEvents() {
	renderEventSliders();
	renderEventsTable();
}

function renderEventSliders() {
	const container = $('#event-sliders');
	let contents = '';

	for(let outletInd = 0; outletInd < outlets.length; outletInd++) {
		const outlet = outlets[outletInd];
		contents += '<b>' + outlet.name + "</b>";
		contents += '<div class="event-slider-row">';
		contents += '<div class="event-slider">';
		for(let eveInd = 0; eveInd < outlet.events.length; eveInd++) {
			const eve = outlet.events[eveInd];
			const clss = eve.on?'event-on':'event-off';

			contents += '<div class="event '
				+ clss + '" '
				+ 'style="left: ' + (eve.time / 14.40) + '%;"'
				+ 'onclick="editEventClick('+outletInd+','+eveInd+')" '
				+ '>';
			contents += fromMinsToClock(eve.time);
			contents += '</div>';
		}
		contents += '</div>';
		contents += '<button class="add-event-button" onclick="addEvent(';
		contents += outletInd +')" >+</button>';
		contents += '</div>';
	}
	container.html(contents);
}

function renderEventsTable() {
	const table = $('#events-table');
	let contents = '<table><tr><th>Outlet</th><th>Time</th><th>Power</th></tr>';

	for(let outletInd = 0; outletInd < outlets.length; outletInd++) {
		const outlet = outlets[outletInd];

		for(let eveInd = 0; eveInd < outlet.events.length; eveInd++) {
			const eve = outlet.events[eveInd];
			contents += '<tr '
				+ 'onclick="editEventClick('+outletInd+','+eveInd+')" '
				+ '>';
			contents += '<td>' + outlet.name + "</td>";
			contents += '<td>' + fromMinsToClock(eve.time) + '</td>';
			contents += '<td>' + (eve.on?'on':'off') + '</td>';
			contents += '</tr>';
		}
	}
	contents += '</table>';
	table.html(contents);
}

function renderOutletOptions() {
	let contents = '';

	for(let outletInd = 0; outletInd < outlets.length; outletInd++) {
		const outlet = outlets[outletInd];
		contents += '<option value="' + outletInd + '" >';
		contents += outlet.name;
		contents += '</option>';
	}
	$('#outlet').html(contents);
}

// Render buttons for outlet power control
function renderOutletButtons() {
	let contents = '';

	for(let outletInd = 0; outletInd < outlets.length; outletInd++) {
		const outlet = outlets[outletInd];
		contents += '<div class="outlet-row"><b>';
		contents += outlet.name;
		contents += '</b><div class="button-row">'

		contents += '<button onclick="powerButtonClick(' + outletInd + ', true)" >';
		contents += 'on</button>';

		contents += '<button onclick="powerButtonClick(' + outletInd + ', false)" >';
		contents += 'off</button>';

		contents += '</div>';
		contents += '</div>';
	}
	$('#outlet-buttons').html(contents);
}

function renderDarkMode() {
	const darkmodeSwitch = $('#darkmode-switch');

	if (!darkModeActive) {
		darkmodeSwitch.removeClass('on');
		$('.dark-stylesheet').remove();
	} else {
		darkmodeSwitch.addClass('on');
		$('head').append('<link class="dark-stylesheet" rel="stylesheet" href="./default_dark.css" type="text/css" />');
	}
}


// ========== Util functions ==========

function addEvent(outletInd) {
	const outlet = outlets[outletInd];
	outlet.events.push({time: 12*60, on: false});
	editingEnabled = true;

	renderEvents();
	editEventClick(outletInd, outlet.events.length - 1);
}

function removeEvent(outletInd, eveInd) {
	const outlet = outlets[outletInd];
	outlet.events.splice(eveInd, 1);
	renderEvents();
}

function getHourMinuteString(date) {
	let hour = date.getHours();
	let minute = date.getMinutes();

	if (hour < 10) {
		hour = '0' + hour;
	}
	if (minute < 10) {
		minute = '0' + minute;
	}
	return hour + ':' + minute;
}

function inMinsFromStr(timeString) {
	const split = timeString.split(':');
	return inMins(Number(split[0]), Number(split[1]));
}

function inMins(hour, min) {
	return 60 * hour + min;
}

function fromMinsToClock(mins) {
	let minute = mins % 60;
	let hour = Math.floor(mins / 60);

	if (hour < 10) {
		hour = '0' + hour;
	}
	if (minute < 10) {
		minute = '0' + minute;
	}
	return hour + ':' + minute;
}

