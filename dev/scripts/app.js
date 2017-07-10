import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	NavLink as Link,
	Route,
	Match,
	Miss
} from 'react-router-dom';
import RoadTripForm from './components/RoadTripForm.js';
import RoadTripMap from './components/RoadTripMap.js';
import RoadTripStop from './components/RoadTripStop.js';
import AddRoadTripStop from './components/AddRoadTripStop.js';
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
			roadTrip: {},
			hideMap: true
		}
		this.addRoadTrip = this.addRoadTrip.bind(this);
		this.renderMap = this.renderMap.bind(this);
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

	renderMap() {
		this.setState({
			hideMap: false
		});
	}

	render() {
		// const map = !this.state.hideMap ? <RoadTripMap /> : null;
		return (
			// hide the map on first run - then on submit of the form - show map
			<Router>
				<main>
					<header>
						<h1>Roadtrip Stops!</h1>
					</header>
					<div className="wrapper">
						<div className="roadtrip-main">
							<RoadTripForm addRoadTrip={this.addRoadTrip} renderMap={this.renderMap}/>
							<RoadTripMap hideMap={this.state.hideMap}/>
						</div>
						{/*<div className="roadtrip-sidebar">
							<Link to="/addRoadTripStop">
								<button>Add a roadtrip stop</button>
							</Link>
							<Route path="/addRoadTripStop" component={AddRoadTripStop}/>
							<RoadTripStop />
						</div>*/}
					</div>
				</main>
			</Router>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));