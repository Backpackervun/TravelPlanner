import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC5pqFJseGJKWE06ANMeBKCGt5UkTfkeyM",
  authDomain: "travel-planner-96d77.firebaseapp.com",
  projectId: "travel-planner-96d77",
  storageBucket: "travel-planner-96d77.appspot.com",
  messagingSenderId: "302819586379",
  appId: "1:302819586379:web:97df96b767c112ff0078ce",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
