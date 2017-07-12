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
	}

	componentDidMount() {
		window.initMap = this.initMap;
		loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDAdUowwXhd2XJ22KGgBY6X2VaR1P6t21k&libraries=places&callback=initMap');
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
		this.map = new google.maps.Map(this.refs.map, {
			center: {lat: 43.6532, lng: -79.3832},
			zoom: 12
		});
	}
	
	render() {
		// refactor to be react animations instead
		const hideMap = {
			visibility: 'hidden',
			opacity: 0
		}
		const showMap = {
			visibility: 'visible',
			opacity: 1
		}
		// only show the map if the hideMap state in our app is false (changed when form is submitted)
		return (
			<div className="map-container">
				<div id="map" ref="map" style={!this.props.hideMap ? showMap : hideMap}></div>
			</div>
		)
	}
}