
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase, ref, push, get} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://centelli-team-stats-default-rtdb.europe-west1.firebasedatabase.app"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const itemToAdd = ref(database,"Item")


const inputfield = document.getElementById("inField")
const addbutton  = document.getElementById("btAdd")
const readbutton = document.getElementById("btShow")
const showresults = document.getElementById("showresults")


addbutton.addEventListener("click",function(){
    let inputvalue = inputfield.value
    push(itemToAdd,inputvalue)
    console.log(inputvalue)
})

readbutton.addEventListener("click",function(){
    get(itemToAdd)
        .then((snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log(data);
                showresults.innerHTML = "";
                Object.values(data).forEach(value => {
                    const para = document.createElement("p"); // Create a <p> element for each value
                    para.textContent = value; // Set the value as the content of the <p>
                    showresults.appendChild(para); // Append the <p> to showresults
                });

                
            } else {
                console.log("No data available");
            }
        })
        .catch((error) => {
            console.error("Error reading database:", error);
        });
});