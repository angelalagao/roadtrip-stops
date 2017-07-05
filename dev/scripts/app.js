import React from 'react';
import ReactDOM from 'react-dom';
import RoadTripForm from './components/RoadTripForm.js';
import RoadTripMap from './components/RoadTripMap.js';
// generate a map
// users can post a "road trip stop" with a review and/or advice - on a certain location
// should display a photo-clip on the map
// when they click on the photo shows them more detail about the road-trip stop.
// users can input their starting point and destination 
// based on their input - generate a "road trip stops advice" for user
// based on the length of their trip generate a spotify playlist
// can save roadtrip on their profile - using firebase

class App extends React.Component {
	constructor() {
		super();
		this.state = {
			roadTrip: {}
		}
		this.addRoadTrip = this.addRoadTrip.bind(this);
	}

	addRoadTrip(trip) {
		// update our state
		// take a copy of our state
		// spread operator will take every item in our object and spread it into this object
		const roadTrip = this.state.roadTrip;
		// add in our new roadtrip
		const timestamp = Date.now(); // using unique timestamp as a key
		roadTrip[`roadTrip-${timestamp}`] = trip;
		// set state
		this.setState({
			roadTrip
		});
	}

	render() {
		return (
			<div>
				<RoadTripForm addRoadTrip={this.addRoadTrip} />
				<RoadTripMap />
			</div>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));