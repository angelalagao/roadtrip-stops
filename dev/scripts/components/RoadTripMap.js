import React from 'react';
import { loadJS } from '../helper.js';

export default class RoadTripMap extends React.Component {
	constructor() {
		super();
		this.initMap = this.initMap.bind(this);
	}
	componentDidMount() {
		window.initMap = this.initMap
		loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDAdUowwXhd2XJ22KGgBY6X2VaR1P6t21k&libraries=places&callback=initMap');
	}
	initMap() {
		this.map = new google.maps.Map(this.refs.map, {
			center: {lat: 43.6532, lng: -79.3832},
			zoom: 12
		});
	}
	render() {
		return (
			<div className="map-container">
				<div id="map" ref="map"></div>
			</div>
		)
	}
}