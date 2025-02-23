// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Global variables to store fetched data and the Firebase app instance
let Glitchdata = null;
let app = null;

async function fetchData() {
  try {
    const response = await fetch("https://quaint-cuboid-jaborosa.glitch.me/api/data");
    Glitchdata = await response.json();
    console.log("Data retrieved from Glitch");
  } catch (error) {
    console.error("Failed to retrieve data from Glitch:", error);
  }
}

async function initializeFirebaseConfig() {
  await fetchData(); // Wait for data to be fetched
  const firebaseConfig = {
    apiKey: Glitchdata.apiKey,
    authDomain: Glitchdata.authDomain,
    databaseURL: Glitchdata.databaseURL,
    projectId: Glitchdata.projectId,
    storageBucket: Glitchdata.storageBucket,
    messagingSenderId: Glitchdata.messagingSenderId,
    appId: Glitchdata.appId,
  };

  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  console.log("Firebase initialized")

  // If on the login page, set up login handling
  if (window.location.pathname.includes("/CentelliTeamStats/") && !window.location.pathname.includes("/Dashboard.html")) {
    const loginButton = document.getElementById("loginButton");
    const errorMessage = document.createElement("p");
    errorMessage.style.color = "red";
    errorMessage.style.textAlign = "center";
    errorMessage.style.display = "none";
    loginButton.insertAdjacentElement("afterend", errorMessage);

    loginButton.addEventListener("click", function () {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      signInWithEmailAndPassword(auth, email, password)
        .then(() => {
          console.log("Logging in...");
          window.location.href = "Dashboard.html";
        })
        .catch((error) => {
          errorMessage.style.display = "block";
          switch (error.code) {
            case "auth/invalid-email":
              errorMessage.textContent = "Invalid email format.";
              break;
            case "auth/user-not-found":
              errorMessage.textContent = "User not found. Please check your email.";
              break;
            case "auth/wrong-password":
              errorMessage.textContent = "Incorrect password. Please try again.";
              break;
            case "auth/too-many-requests":
              errorMessage.textContent = "Too many failed attempts. Try again later.";
              break;
            default:
              errorMessage.textContent = "Login failed: " + error.message;
          }
        });
    });
  }
  
  return app;
}

// Export a promise that resolves when the Firebase app is initialized.
// Other modules can import this promise and await it before using the app.
export const firebaseAppPromise = initializeFirebaseConfig().then(appInstance => {
  if (appInstance) {
    return appInstance;
  } else {
    throw new Error("Firebase app not initialized");
  }
});
