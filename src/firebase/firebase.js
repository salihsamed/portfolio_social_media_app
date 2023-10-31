import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
    apiKey: "AIzaSyD8Dn2wCAKims61zud8DENOvWAzbxevVEM",
    authDomain: "socialz-7f079.firebaseapp.com",
    projectId: "socialz-7f079",
    storageBucket: "socialz-7f079.appspot.com",
    messagingSenderId: "557434579418",
    appId: "1:557434579418:web:d495c6fa4b7f2bf6ea78e3",
    measurementId: "G-WS7WN76JPW"
  };

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth=getAuth()
export const storage=getStorage(app)
export const db=getFirestore()