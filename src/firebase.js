import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAT7kBGQ5rBmmlLH8W72_X-nnwxTo5UV64",
  authDomain: "robotrestaurant-8f4bd.firebaseapp.com",
  projectId: "robotrestaurant-8f4bd",
  storageBucket: "robotrestaurant-8f4bd.firebasestorage.app",
  messagingSenderId: "821920488118",
  appId: "1:821920488118:web:6a2b8a728b0993e4bea417",
  measurementId: "G-4FWLZ0P2R8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
