// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAdRCY-3vQ48gFPP_dcbEJCfkslkhYZfes",
  authDomain: "centelli-team-stats.firebaseapp.com",
  databaseURL: "https://centelli-team-stats-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "centelli-team-stats",
  storageBucket: "centelli-team-stats.firebasestorage.app",
  messagingSenderId: "233068119475",
  appId: "1:233068119475:web:51d40ce2e9bd110c6177c6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
console.log(window.location.pathname)

// Ensure script runs only on login page
if ( window.location.pathname.includes("/CentelliTeamStats/") && !window.location.pathname.includes("/Dashboard.html") ) {
  const loginButton = document.getElementById("loginButton");
  const errorMessage = document.createElement("p");
  errorMessage.style.color = "red";
  errorMessage.style.textAlign = "center";
  errorMessage.style.display = "none"; // Hide initially
  loginButton.insertAdjacentElement("afterend", errorMessage);

  loginButton.addEventListener("click", function () {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
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

export { app };
