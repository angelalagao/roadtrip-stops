import firebase from 'firebase';

// Initialize Firebase
var config = {
		apiKey: "AIzaSyA77RyqeMs-1BApoEbijI0lAS7Jkh493xQ",
		authDomain: "roadtrip-stops.firebaseapp.com",
		databaseURL: "https://roadtrip-stops.firebaseio.com",
		projectId: "roadtrip-stops",
		storageBucket: "roadtrip-stops.appspot.com",
		messagingSenderId: "760758456083"
};
firebase.initializeApp(config);

export const auth = firebase.auth();
export const database = firebase.database();
let googleProvider = new firebase.auth.GoogleAuthProvider()
googleProvider.setCustomParameters({ "prompt": "select_account" });
export const provider = googleProvider;
export const dbRef = firebase.database().ref('/');
export default firebase;