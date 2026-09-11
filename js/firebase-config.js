// ======================================================
// CONFIGURACIÓN GENERAL DE FIREBASE
// ======================================================

// Este archivo únicamente se encarga
// de inicializar Firebase.
//
// Puede utilizarlo cualquier parte del proyecto:
// - Portfolio
// - Testimonios
// - PeruRes
// - Futuros proyectos


const firebaseConfig = {
    apiKey: "AIzaSyCiwjGqeQ3yzrT_Y7A_VTdr5Qu4pjVfmRY",
    authDomain: "portofolio-marvin.firebaseapp.com",
    databaseURL: "https://portofolio-marvin-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "portofolio-marvin",
    storageBucket: "portofolio-marvin.firebasestorage.app",
    messagingSenderId: "618532477183",
    appId: "1:618532477183:web:f8faef9863378fc81dd4ca",
    measurementId: "G-KLHYSTGDGS"
};


// ======================================================
// INICIALIZAR FIREBASE
// ======================================================

export function obtenerFirebaseDB() {

    // Evitamos inicializar Firebase
    // más de una vez.
    if (!firebase.apps.length) {

        firebase.initializeApp(
            firebaseConfig
        );
    }


    // Devolvemos la base de datos.
    return firebase.database();
}