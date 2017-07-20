import React from 'react';
import { loadJS } from '../helper.js';
import firebase, { dbRef } from '../firebase.js';
import _ from 'underscore';


// 1 solution:
// store user origin and destination route as lat/long coordinates (poly line) i.e 3-4 points along the route.
// get the road trip stops closest to these points by calculating the distance between each point
// if say distance in < 10km then display these road trip stops on the map.

export default class RoadTripMap extends React.Component {
	constructor() {
		super();
		this.state = {
			roadTripStops: [],
			routes: [],
			userStops: []
		}
		this.initMap = this.initMap.bind(this);
		this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
		this.getRouteCoordinates = this.getRouteCoordinates.bind(this);
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

		let routes = route.map(singleRoute => {
			return {
				lat: singleRoute.lat(),
				lng: singleRoute.lng()
			}
		});

		this.setState({
			routes
		});
	}


	componentDidUpdate(prevProps, prevState) {
		let roadTripStops = Array.from(this.state.roadTripStops);
		let finalRoadTripStops = [];
		let userStops = []

		// compare each roadtrop stop lat lng to the route lat lng

		if (this.state.routes !== prevState.routes) {
			let userRoutes = Array.from(this.state.routes);

			// finalRoadTripStops = roadTripStops.map(stop => {
			// 	let stopLatLng = stop.roadtrip_stops.roadtrip_latLng;
			// 	let stopObj = new google.maps.LatLng(stopLatLng.lat, stopLatLng.lng);
			// 	let routeObj;
			// 	userRoutes.map(route => {
			// 		routeObj = new google.maps.LatLng(route.lat, route.lng);
			// 		let difference = google.maps.geometry.spherical.computeDistanceBetween(routeObj, stopObj);
			// 		if (difference < 10000) {
			// 			userStops.push({
			// 				stop: stop,
			// 				difference: difference
			// 			});
			// 		}
			// 	});
			// });

			for (let x = 0; x < roadTripStops.length; x++) {
				let stopLatLng = roadTripStops[x].roadtrip_stops.roadtrip_latLng;
				let stop = new google.maps.LatLng(stopLatLng.lat, stopLatLng.lng);
				for (let y = 0; y < userRoutes.length; y++) {
					let routeLatLng = userRoutes[y];
					let route = new google.maps.LatLng(routeLatLng.lat, routeLatLng.lng);
					let difference = google.maps.geometry.spherical.computeDistanceBetween(route, stop);
					if (difference < 10000) {
						// record the roadtrip stops with distance difference less than 10 km
						finalRoadTripStops.push({
							stops: roadTripStops[x].roadtrip_stops
						})
					}
				}
			}
			const userStops = _.uniq(finalRoadTripStops, stop => {
				return stop.stops.id;
			});
			console.log(userStops);
		}
		
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