import React from 'react';
import ReactDOM from 'react-dom';
import {
	BrowserRouter as Router,
	NavLink as Link,
	Route
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
			hideMap: true,
			isModalOpen: false
		}
		this.addRoadTrip = this.addRoadTrip.bind(this);
		this.renderMap = this.renderMap.bind(this);
		this.renderModal = this.renderModal.bind(this);
		this.closeModal = this.closeModal.bind(this);
	}

	addRoadTrip(roadTrip) {
		// update our state
		// take a copy of our state
		// spread operator will take every item in our object and spread it into this object
		// const roadTrip = this.state.roadTrip;
		// // add in our new roadtrip
		// const timestamp = Date.now(); // using unique timestamp as a key
		// roadTrip[`roadTrip-${timestamp}`] = trip;
		// set state
		this.setState({
			roadTrip
		});
		// we should be able to compare distances between the roadtrip start and dest within the roadtrip stops database from firebase
		// from there we generate the road trip stop markers to be displayed on the map
	}

	renderMap() {
		// on form submit we change the state and will pass it down as props to our RoadTripMap component
		this.setState({
			hideMap: false
		});
	}

	renderModal() {
		// will render modal on click of "add a roadtrip stop" button
		this.setState({
			isModalOpen: true
		});
	}

	closeModal() {
		this.setState({
			isModalOpen: false
		});
	}

	render() {
		const showMap = !this.state.hideMap ? <RoadTripMap roadTrip={this.state.roadTrip} /> : null;
		return (
			// hide the map on first run - then on submit of the form - show map
			<Router>
				<div className="map-background">
					{showMap}
					<main className="main-wrapper">
						<header>
							<h1>Roadtrip Stops</h1>
							<p>Search some cool stops along your roadtrip route! Or suggest some cool stops for other roadtrippers!</p>
						</header>
						<div className="wrapper">
							<RoadTripForm addRoadTrip={this.addRoadTrip} renderMap={this.renderMap}/>
							<div className="roadtrip-sidebar">
								{/*on click of this button a modal should appear*/}
								<button onClick={this.renderModal}>Add a Roadtrip Stop</button>
								<AddRoadTripStop 
									isModalOpen={this.state.isModalOpen} 
									closeModal={this.closeModal}
								/>
							</div>
						</div>
					</main>
				</div>
			</Router>
		)
	}
}

ReactDOM.render(<App />, document.getElementById('app'));