import React from 'react';

export default class AddRoadTripStop extends React.Component {
	autocomplete(e) {
		e.preventDefault();
		const stop = new google.maps.places.Autocomplete((document.getElementById('roadtrip-stop')),
			{types: ['geocode']});
	}
	uploadImage(e) {
		e.preventDefault();
		console.log('image uploaded');
	}
	submitStop(e) {
		e.preventDefault();
		console.log('stop submitted');
	}
	render() {
		return (
			<div>
				<form onSubmit={(e) => this.submitStop(e)}>
					<label htmlFor="roadtrip-stop">Roadtrip Stop</label>
					<input onChange={(e) => this.autocomplete(e)}
							ref={(input) => this.stop = input} id="roadtrip-stop"
							type="text" name="roadtrip-stop" placeholder=""/>
					<Rating />
					<fieldset>
						<label htmlFor="roadtrip-image">Upload Images</label>
						<input ref={(input) => this.image = input} type="file"
								name="roadtrip-image" accept="image/*" />
						<button onClick={(e) => this.uploadImage(e)}>Upload Image</button>
					</fieldset>
					<textarea name="roadtrip-suggestion" cols="30" rows="10" 
							placeholder="This place was cool because..."></textarea>
					<button type="submit">+Add Stop</button>
				</form>
			</div>
		)
	}
}

const Rating = () => {
	return (
		<fieldset className="rating">
			<input type="radio" id="star5" name="rating" value="5" />
			<label className = "full" htmlFor="star5" title="Awesome - 5 stars"></label>
			<input type="radio" id="star4half" name="rating" value="4 and a half" />
			<label className="half" htmlFor="star4half" title="Pretty good - 4.5 stars"></label>
			<input type="radio" id="star4" name="rating" value="4" />
			<label className = "full" htmlFor="star4" title="Pretty good - 4 stars"></label>
			<input type="radio" id="star3half" name="rating" value="3 and a half" />
			<label className="half" htmlFor="star3half" title="Meh - 3.5 stars"></label>
			<input type="radio" id="star3" name="rating" value="3" />
			<label className = "full" htmlFor="star3" title="Meh - 3 stars"></label>
			<input type="radio" id="star2half" name="rating" value="2 and a half" />
			<label className="half" htmlFor="star2half" title="Kinda bad - 2.5 stars"></label>
			<input type="radio" id="star2" name="rating" value="2" />
			<label className = "full" htmlFor="star2" title="Kinda bad - 2 stars"></label>
			<input type="radio" id="star1half" name="rating" value="1 and a half" />
			<label className="half" htmlFor="star1half" title="Meh - 1.5 stars"></label>
			<input type="radio" id="star1" name="rating" value="1" />
			<label className = "full" htmlFor="star1" title="Sucks big time - 1 star"></label>
			<input type="radio" id="starhalf" name="rating" value="half" />
			<label className="half" htmlFor="starhalf" title="Sucks big time - 0.5 stars"></label>
		</fieldset>
	)
}