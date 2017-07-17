import React from 'react';
import { loadJS } from '../helper.js';
import firebase, { dbRef } from '../firebase.js';


// 1 solution:
// store user origin and destination route as lat/long coordinates (poly line) i.e 3-4 points along the route.
// get the road trip stops closest to these points by calculating the distance between each point
// if say distance in < 10km then display these road trip stops on the map.

export default class RoadTripMap extends React.Component {
	constructor() {
		super();
		this.state = {
			roadTripStops: [],
			map: ''
		}
		this.initMap = this.initMap.bind(this);
		this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
		this.getRouteCoordinates = this.getRouteCoordinates.bind(this);
		this.getRoadtripStopLatLng = this.getRoadtripStopLatLng.bind(this);
		this.getResultLatLng = this.getResultLatLng.bind(this);
		this.compareRoadtripStopsToRoute = this.compareRoadtripStopsToRoute.bind(this);
	}

	// need to call initmap to get autocomplete to work on our inputs
	// however we need to hide the map then only show it when user submits their origin and dest

	componentDidMount() {
		window.initMap = this.initMap;
		loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDAdUowwXhd2XJ22KGgBY6X2VaR1P6t21k&libraries=geometry,places&callback=initMap');
		const roadTripStops = [];
		// getting road trip stops from firebase to compare its lat lng to the route the user input
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

		this.setState({
			map: this.map
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
				this.getRouteCoordinates(response);
				directionsDisplay.setDirections(response);
				var summaryPanel = document.getElementById('directions-panel');
				// var route = response.routes[0];
				//  summaryPanel.innerHTML = '';
				//  // For each route, display summary information.
				//  for (var i = 0; i < route.legs.length; i++) {
				//    var routeSegment = i + 1;
				//    summaryPanel.innerHTML += '<b>Route Segment: ' + routeSegment +
				// 	   '</b><br>';
				//    summaryPanel.innerHTML += route.legs[i].start_address + ' to ';
				//    summaryPanel.innerHTML += route.legs[i].end_address + '<br>';
				//    summaryPanel.innerHTML += route.legs[i].distance.text + '<br><br>';
				//  }
			   } else {
				 console.error('Directions request failed due to ' + status);
			}
		});
	}

	getRouteCoordinates(response) {
		const routeArray = response.routes[0]; // returned as an object
		const route = routeArray.overview_path;
		console.log(response);

		const polyline = new google.maps.Polyline({
			map: this.state.map
		});

		let latArray = [];
		let lngArray = [];

		let path = polyline.getPath();
		for (let x = 0; x < route.length; x++) {
			const position = new google.maps.LatLng(route[x].lat(), route[x].lng());
			// console.log(position);
			latArray[x] = route[x].lat;
			lngArray[x] = route[x].lng;
			path.push(position);
		}
		this.compareRoadtripStopsToRoute();
		// console.log(path);
		// console.log(latArray);
	}

	getRoadtripStopLatLng(callback, address) {
		let geocoder = new google.maps.Geocoder();
		if (geocoder) {
			geocoder.geocode({
				'address': address
			}, (results, status) => {
				if (status == google.maps.GeocoderStatus.OK) {
					callback(results[0]);
				}
			});
		}
	}

	getResultLatLng(result) {
		const lat = result.geometry.location.lat();
		const lng = result.geometry.location.lng();
		console.log('lat', lat);
		console.log('lng', lng);

		// need to compare distances b/w these lat lngs with the route lat lngs 
	}

	compareRoadtripStopsToRoute() {
		let roadTripStops = Array.from(this.state.roadTripStops);
		let finalRoadTripStops = [];
		finalRoadTripStops = roadTripStops.forEach((stop) => {
			let latStop = stop.roadtrip_stops.roadtrip_stop;
			let lngStop = stop.roadtrip_stops.roadtrip_stop;
			this.getRoadtripStopLatLng(this.getResultLatLng, latStop);
			this.getRoadtripStopLatLng(this.getResultLatLng, lngStop);
		});
	}

	render() {
		// only show the map if the hideMap state in our app is false (changed when form is submitted)
		return (
			<div className="map-container">
				<div id="map" ref="map"></div>
				<div id="directions-panel"></div>
			</div>
		)
	}
}