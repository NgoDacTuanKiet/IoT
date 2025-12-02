import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC_Krb3LGcmfwuGWOIqS1zd3FxfhuV1yq4",
    authDomain: "iot-gas-6bce5.firebaseapp.com",
    databaseURL: "https://iot-gas-6bce5-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "iot-gas-6bce5",
    storageBucket: "iot-gas-6bce5.firebasestorage.app",
    messagingSenderId: "907814021574",
    appId: "1:907814021574:web:2c2c596d74862dde376ac7"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
