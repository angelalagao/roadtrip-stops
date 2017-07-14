import React from 'react';
import { loadJS } from '../helper.js';
import firebase, { dbRef } from '../firebase.js';

export default class RoadTripMap extends React.Component {
	constructor() {
		super();
		this.state = {
			roadTripStops: []
		}
		this.initMap = this.initMap.bind(this);
		this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
	}

	// need to call initmap to get autocomplete to work on our inputs
	// however we need to hide the map then only show it when user submits their origin and dest

	componentDidMount() {
		window.initMap = this.initMap;
		loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDAdUowwXhd2XJ22KGgBY6X2VaR1P6t21k&libraries=geometry,places&callback=initMap');
		const roadTripStops = [];
		dbRef.on('value', (snapshot) => {
			const dbRoadTripStop = snapshot.val();
			for (let key in dbRoadTripStop) {
				roadTripStops.push({
					roadtrip_stops: dbRoadTripStop[key].roadtripStop
				});
			}
			this.setState({
				roadTripStops
			});
		});
	}

	componentWillUnmount() {
		dbRef.off('value');
	}

	initMap() {

		// declaring variables to display waypoints and route path
		var directionsService = new google.maps.DirectionsService();
		var directionsDisplay = new google.maps.DirectionsRenderer();


		this.map = new google.maps.Map(this.refs.map, {
			center: {lat: 43.6532, lng: -79.3832},
			zoom: 12
		});

		directionsDisplay.setMap(this.map);
		// only call this function when user submits their origin and dest
		this.calculateAndDisplayRoute(directionsService, directionsDisplay);
	}

	calculateAndDisplayRoute(directionsService, directionsDisplay) {
		let waypts = [];
		// need the value of the user input origin and destination of their roadtrip to push into this array

		const origin = this.props.roadTrip.origin;
		const dest = this.props.roadTrip.dest;

		directionsService.route({
			origin,
			destination: dest,
			waypoints: waypts,
			optimizeWaypoints: true,
			travelMode: 'DRIVING',
		}, (response, status) => {
			if (status === 'OK') {
				directionsDisplay.setDirections(response);
				var summaryPanel = document.getElementById('directions-panel');
				 summaryPanel.innerHTML = '';
				 // For each route, display summary information.
				 for (var i = 0; i < route.legs.length; i++) {
				   var routeSegment = i + 1;
				   summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
					   '</b><br>';
				   summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
				   summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
				   summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
				 }
			   } else {
				 console.error('Directions request failed due to ' + status);
			}
		});
	}

	render() {
		// refactor to be react animations instead
		// const hideMap = {
		// 	visibility: 'hidden',
		// 	opacity: 0
		// }
		// const showMap = {
		// 	visibility: 'visible',
		// 	opacity: 1
		// }
		// only show the map if the hideMap state in our app is false (changed when form is submitted)
		return (
			<div className="map-container">
				<div id="map" ref="map"></div>
				<div id="directions-panel"></div>
			</div>
		)
	}
}