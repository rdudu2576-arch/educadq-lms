import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBdCMYxzLMXUqmQZjm-TqHqZed6kH0hdyw",
  authDomain: "educadq-auth.firebaseapp.com",
  projectId: "educadq-auth",
  storageBucket: "educadq-auth.firebasestorage.app",
  messagingSenderId: "319921289983",
  appId: "1:319921289983:web:e7e60729e89985f679aaca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
