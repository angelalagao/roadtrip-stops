import React from 'react';
import RoadTripMap from './RoadTripMap.js';
import { loadJS } from '../helper.js';
// generate a map
// users can post a "road trip stop" with a review and/or advice - on a certain location
// should display a photo-clip on the map
// when they click on the photo shows them more detail about the road-trip stop.
// users can input their starting point and destination 
// based on their input - generate a "road trip stops advice" for user
// based on the length of their trip generate a spotify playlist
// can save roadtrip on their profile - using firebase

export default class RoadTripForm extends React.Component {
	constructor() {
		super();
		this.state = {
			submitted: false
		}
	}
	componentDidMount() {
		loadJS('https://maps.googleapis.com/maps/api/js?key=AIzaSyDAdUowwXhd2XJ22KGgBY6X2VaR1P6t21k&libraries=places');
	}
	autocomplete(e) {
		e.preventDefault();
		const origin = new google.maps.places.Autocomplete((document.getElementById('origin')),
			{types: ['geocode']});
		const dest = new google.maps.places.Autocomplete((document.getElementById('dest')),
			{types: ['geocode']});
	}
	roadtripSubmit(e) {
		e.preventDefault();
		const roadTrip = {
			origin: this.origin.value,
			dest: this.dest.value
		}
		this.props.addRoadTrip(roadTrip);
		// will change our hideMap state in our app component to show the map 
		this.props.renderMap();
		// need to call initmap again on submit
		window.initMap;
		this.setState({
			submitted: true
		});
	}
	render() {
		const submittedStyle = {
			position: 'absolute',
			top: '50px',
			left: '50px',
			zIndex: 3,
			width: '20%'
		}
		return (
			<form onSubmit={(e) => this.roadtripSubmit(e)} className="roadtrip-form" style={this.state.submitted ? submittedStyle : null}>
				<input onChange={(e) => this.autocomplete(e)} 
						ref={(input) => this.origin = input}
						id="origin"
						type="text" placeholder="Origin"/>
				<input onChange={(e) => this.autocomplete(e)}
						ref={(input) => this.dest = input}
						id="dest"
						type="text" placeholder="Destination"/>
				<button className="roadtrip__button" type="submit">Get Roadtrip Stops</button>
			</form>
		)
	}
}