import * as firebase from "firebase/app";
import "firebase/auth";
import 'firebase/database';
import 'firebase/firestore';

firebase.initializeApp({
  apiKey: "AIzaSyBRkHlyUFzvXhM9KR0t3VHon99r2cwMGis",
  authDomain: "comp4920-4a9c6.firebaseapp.com",
  databaseURL: "https://comp4920-4a9c6.firebaseio.com",
  projectId: "comp4920-4a9c6",
  storageBucket: "",
  messagingSenderId: "903784116715",
  appId: "1:903784116715:web:5fcabce4662b890de5e9ae",
  measurementId: "G-BLHJYZR76L"
});

firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
  // console.log("PERSISTENCE SET.");
}).catch((error) => {
  console.log("PERSISTANCE FAILED.");
  console.log(error.message);
});

// Create reference to our firestore database
export const fs = firebase.firestore();

const app = firebase;
export default app;