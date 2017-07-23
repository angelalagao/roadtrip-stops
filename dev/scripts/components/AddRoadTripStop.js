import React from 'react';
import firebase, {dbRef} from '../firebase.js';
import _ from 'underscore';

export default class AddRoadTripStop extends React.Component {
	constructor() {
		super();
		this.state = {
			roadtripStop: {},
			images: [],
			loading: false,
			latLng: {}
		}
		this.baseState = this.state;
		this.uploadImage = this.uploadImage.bind(this);
		this.convertToLatLng = this.convertToLatLng.bind(this);
		this.resetForm = this.resetForm.bind(this);
		this.getRoadtripStopLatLng = this.getRoadtripStopLatLng.bind(this);
		this.submitStop = this.submitStop.bind(this);
	}
	// should be able to send this data to firebase
	// use roadtrip data to render points on the map when a user searches for their road trip
	autocomplete(e) {
		e.preventDefault();
		const stop = new google.maps.places.Autocomplete((document.getElementById('roadtrip_stop')),
			{types: ['geocode']});
		
	}
	uploadImage(e) {
		e.preventDefault();
		const imagesArray = [];
		const images = this.image.files;
		_.each(images, image => {
			if (image.size < 2048576) {
				const storageRef = firebase.storage().ref('/');
				const thisImage = storageRef.child(image.name);
				thisImage.put(image).then((snapshot) => {
					thisImage.getDownloadURL().then((url) => {
						imagesArray.push(url);
						this.setState({ images: imagesArray, loading: true });
					});
				});
			}
		});
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

	convertToLatLng(result) {
		const locations = result.geometry;
		this.setState({
			latLng: {lat: locations.location.lat(), lng: locations.location.lng()}
		});
	}

	submitStop(e) {
		e.preventDefault();
		this.getRoadtripStopLatLng(this.convertToLatLng, this.stop.value);
		const roadtripStop = {
			roadtrip_stop: this.stop.value,
			roadtrip_suggestion: this.suggestion.value,
			roadtrip_images: this.state.images,
			roadtrip_latLng: {},
			id: ''
		}

		console.log(roadtripStop);
		this.setState({
			roadtripStop
		});
		this.props.closeModal();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.latLng !== prevState.latLng && this.state.roadtripStop) {
			const roadtripStop = this.state.roadtripStop;
			dbRef.push({
				roadtripStop
			}).then(snapshot => {
				dbRef.child(`${snapshot.key}/roadtripStop`).update({
					id: snapshot.key,
					roadtrip_latLng: this.state.latLng
				});
			}, () => {
				this.resetForm();
			})
		}
	}

	resetForm() {
		this.setState(this.baseState);
	}

	render() {
		const openModal = {
			visibility: 'visible',
			opacity: 1,
			position: 'absolute',
			top: 0,
			zIndex: 9,
			left: '50%',
			background: 'white'
		}
		const hideModal = {
			visibility: 'hidden',
			opacity: 0
		}
		return (
			<div className="form-modal" ref="roadtripForm" style={this.props.isModalOpen ? openModal : hideModal}>
				<form onSubmit={(e) => this.submitStop(e)}>
					<label htmlFor="roadtrip_stop">Roadtrip Stop</label>
					<input onChange={(e) => this.autocomplete(e)}
							ref={(input) => this.stop = input} id="roadtrip_stop"
							type="text" name="roadtrip_stop" placeholder=""/>
					<fieldset>
						<label htmlFor="roadtrip_image">Upload Images</label>
						<input ref={(input) => this.image = input} type="file"
								name="roadtrip_image" accept="image/*" multiple="multiple" />
						<button onClick={(e) => this.uploadImage(e)}>Upload Image</button>
					</fieldset>
					<textarea name="roadtrip_suggestion"
								ref={(input) => this.suggestion = input}
								cols="30" rows="10" 
							placeholder="This place was cool because..."></textarea>
					<button type="submit">+Add Stop</button>
				</form>
			</div>
		)
	}
}

// need to map out 5 on the render()
const Rating = () => {
	return (
		<fieldset className="rating">
			<svg xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 12 12">
				<polygon
					fill="#4080FF"
					points="6 8.5200001 2.47328849 10.854102 3.60333748 6.77872286 0.293660902 4.14589803 4.51878111 3.96127709 6 0 7.48121889 3.96127709 11.7063391 4.14589803 8.39666252 6.77872286 9.52671151 10.854102">
				</polygon>
			</svg>
		</fieldset>
	)
}