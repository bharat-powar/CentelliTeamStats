import { firebaseAppPromise } from "./index.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-database.js";

// Adjustable disable duration (in milliseconds)
const BUTTON_DISABLE_TIME = 2000;

firebaseAppPromise.then(app => {

// Helper function: Disable all buttons except Sign Out temporarily
function disableAllButtonsExceptSignOut(duration = BUTTON_DISABLE_TIME) {
    const buttons = document.querySelectorAll("button:not(#btSignout)"); // Exclude Sign Out button
    buttons.forEach((button) => (button.disabled = true));
    setTimeout(() => {
        buttons.forEach((button) => (button.disabled = false));
    }, duration);
}

// Initialize Firebase services
const auth = getAuth(app);
const database = getDatabase(app);
let UsersEmail = "";

// Elements from DOM
const ShowResults = document.getElementById("ButtonClients");
const ShowVMResults = document.getElementById("Buttons&LabelsVM");
const SignOut = document.getElementById("btSignout");
const RefreshActiveSessions = document.getElementById("btnRefreshActiveSessions");
const ShowActiveSessions = document.getElementById("ButtonsActiveSessions");
const RefreshVMs = document.getElementById("btnRefreshVMs");

// Global variables
let selectedClient = "";
let arrstrClients = [];

// Check authentication state
auth.onAuthStateChanged((user) => {
    if (!user) {
        window.location.href = "/CentelliTeamStats/";
    } else {
        console.log("User is logged in");
        UsersEmail = user.email.split("@")[0]; // Use part before "@" as identifier
    }
});

// Function to load clients
function loadClients() {
    const clientsRef = ref(database, "Clients");
    get(clientsRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log("No clients found.");
                return;
            }
            ShowResults.innerHTML = "";
            const clients = snapshot.val();
            Object.keys(clients).forEach((clientName) => {
                const btn = document.createElement("button");
                btn.textContent = clientName;
                btn.id = clientName;
                btn.classList.add("client-button");
                ShowResults.appendChild(btn);
            });
        })
        .catch((error) => console.error("Error loading clients:", error));
}

// Function to load VMs for a given client
function loadVMs(client) {
    const vmRef = ref(database, `Clients/${client}`);
    get(vmRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                console.log(`No VMs for client ${client}.`);
                ShowVMResults.innerHTML = "";
                return;
            }
            ShowVMResults.innerHTML = "";
            const vms = snapshot.val();
            Object.entries(vms).forEach(([vmName, assignedTo]) => {
                const wrapper = document.createElement("div");
                wrapper.classList.add("vm-wrapper");

                const label = document.createElement("label");
                label.textContent = `${vmName}: ${assignedTo ? assignedTo : "Available"}`;
                label.id = vmName;
                wrapper.appendChild(label);

                const button = document.createElement("button");
                button.textContent = "Assign to me";
                button.id = vmName;
                if (!assignedTo) {
                    label.style.color = "green";
                }
                button.classList.add("assign-button");
                // Disable button if VM is already assigned
                button.disabled = !!assignedTo;
                wrapper.appendChild(button);

                ShowVMResults.appendChild(wrapper);
            });
        })
        .catch((error) => console.error("Error loading VMs:", error));
}

// Function to load active sessions (across all clients) for the current user
function loadActiveSessions() {
    const clientsRef = ref(database, "Clients");
    get(clientsRef)
        .then((snapshot) => {
            if (!snapshot.exists()) {
                ShowActiveSessions.innerHTML = "";
                return;
            }
            arrstrClients = Object.keys(snapshot.val()); // All clients
            ShowActiveSessions.innerHTML = "";
            
            arrstrClients.forEach((client) => {
                const vmRef = ref(database, `Clients/${client}`);
                get(vmRef)
                    .then((snap) => {
                        if (!snap.exists()) return;
                        const vms = snap.val();
                        Object.entries(vms).forEach(([vmName, assignedTo]) => {
                            if (assignedTo === UsersEmail) {
                                const wrapper = document.createElement("div");
                                wrapper.classList.add("as-wrapper");

                                const label = document.createElement("label");
                                label.textContent = `${client}/${vmName}`;
                                label.id = vmName;
                                wrapper.appendChild(label);

                                const button = document.createElement("button");
                                button.textContent = "Unassign";
                                button.id = `${client}/${vmName}`;
                                button.classList.add("unassign-button");
                                wrapper.appendChild(button);

                                ShowActiveSessions.appendChild(wrapper);
                            }
                        });
                    })
                    .catch((error) => console.error(`Error loading VMs for ${client}:`, error));
            });
        })
        .catch((error) => console.error("Error loading active sessions:", error));
}

// Event listener: Client selection (disable all buttons except Sign Out)
ShowResults.addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    disableAllButtonsExceptSignOut();
    selectedClient = event.target.id;
    console.log("Selected client:", selectedClient);
    loadVMs(selectedClient);
    loadActiveSessions();
});

// Event listener: Assign VM button (disable all buttons except Sign Out)
ShowVMResults.addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    disableAllButtonsExceptSignOut();
    const vmName = event.target.id;
    const vmRef = ref(database, `Clients/${selectedClient}/${vmName}`);

    get(vmRef)
        .then((snapshot) => {
            if (snapshot.exists() && snapshot.val()) {
                loadVMs(selectedClient);
                alert("This VM is already assigned");
                return;
            }
            set(vmRef, UsersEmail)
                .then(() => {
                    console.log("VM assigned successfully");
                    loadVMs(selectedClient);
                    loadActiveSessions();
                })
                .catch((error) => console.error("Error assigning VM:", error));
        })
        .catch((error) => console.error("Error reading VM data:", error));
});

// Event listener: Unassign VM button (disable all buttons except Sign Out)
ShowActiveSessions.addEventListener("click", (event) => {
    if (event.target.tagName !== "BUTTON") return;
    disableAllButtonsExceptSignOut();
    const parts = event.target.id.split('/');
    if (parts.length !== 2) return;
    const [client, vmName] = parts;
    const vmRef = ref(database, `Clients/${client}/${vmName}`);
    set(vmRef, "")
        .then(() => {
            console.log("VM unassigned successfully");
            if (selectedClient !== "") {
                loadVMs(selectedClient);
            }
            loadActiveSessions();
        })
        .catch((error) => console.error("Error unassigning VM:", error));
});

// Event listener: Refresh VMs button (disable all buttons except Sign Out)
RefreshVMs.addEventListener("click", () => {
    disableAllButtonsExceptSignOut();
    if (selectedClient) {
        loadVMs(selectedClient);
    } else {
        console.log("No client selected to refresh VMs");
    }
});

// Event listener: Refresh Active Sessions button (disable all buttons except Sign Out)
RefreshActiveSessions.addEventListener("click", () => {
    disableAllButtonsExceptSignOut();
    loadActiveSessions();
});

// Event listener: Sign out button (Sign Out button remains enabled)
SignOut.addEventListener("click", () => {
    signOut(auth)
        .then(() => alert("Signing out"))
        .catch((error) => console.error("Error signing out:", error));
});

// Initial load
loadClients();

}).catch(error => {
    console.error("Firebase initialization failed:", error);
});
