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
			userStops: [],
			map: ''
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
			center: {lat: 0, lng: 0},
			zoom: 12,
			styles: [{ "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#1D3543" }] }, { "featureType": "administrative.country", "elementType": "all", "stylers": [{ "saturation": "0" }] }, { "featureType": "landscape", "elementType": "all", "stylers": [{ "color": "#E6E9F2" }] }, { "featureType": "poi", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "road", "elementType": "all", "stylers": [{ "saturation": -100 }, { "lightness": 45 }] }, { "featureType": "road.highway", "elementType": "all", "stylers": [{ "visibility": "simplified" }] }, { "featureType": "road.arterial", "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit", "elementType": "all", "stylers": [{ "visibility": "off" }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#9CC9DD" }, { "visibility": "on" }] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "lightness": "11" }, { "saturation": "18" }] }]
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
		if (prevProps.roadTrip !== this.props.roadTrip) {
			this.initMap();
		}
		let roadTripStops = Array.from(this.state.roadTripStops);
		let finalRoadTripStops = [];
		let userStops = []

		// compare each roadtrop stop lat lng to the route lat lng

		if (this.state.routes !== prevState.routes) {
			let userRoutes = Array.from(this.state.routes);

			for (let x = 0; x < roadTripStops.length; x++) {
				let stopLatLng = roadTripStops[x].roadtrip_stops.roadtrip_latLng;
				let stop = new google.maps.LatLng(stopLatLng.lat, stopLatLng.lng);
				for (let y = 0; y < userRoutes.length; y++) {
					let routeLatLng = userRoutes[y];
					let route = new google.maps.LatLng(routeLatLng.lat, routeLatLng.lng);
					let difference = google.maps.geometry.spherical.computeDistanceBetween(route, stop);
					if (difference < 25000) {
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
			this.setState({
				userStops
			});
		}
		if (this.state.userStops !== prevState.userStops) {
			this.state.userStops.forEach(stop => {
				const lat = stop.stops.roadtrip_latLng.lat;
				const lng = stop.stops.roadtrip_latLng.lng;
				const content = `Stop by ${stop.stops.roadtrip_stop}!
								<br>Suggestions: ${stop.stops.roadtrip_suggestion}`
				const infoWindow = new google.maps.InfoWindow({
					content: content
				});
				const marker = new google.maps.Marker({
					position: {lat, lng},
					map: this.state.map,
					icon: {
						path: 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z',
						fillColor: '#8B756C',
						fillOpacity: 0.6,
						anchor: new google.maps.Point(0,0),
						strokeWeight: 2,
						strokeColor: '#1d3543',
						scale: 2
					}
				});
				marker.addListener('click', () => {
					infoWindow.open(this.state.map, marker);
				});
			});
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