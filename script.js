// Krishi Procurement Platform - simple JavaScript
// Plain JavaScript only. No frameworks, no backend.
//
// How login works in this simple version:
// - Demo accounts are written below (for testing).
// - New accounts made from the registration form are saved in the
//   browser using localStorage, so they work only in this browser.
// - A real project would save accounts on a server instead.

// ---------------- Demo accounts ----------------

var demoUsers = [
  {
    name: "Ramesh Patil",
    phone: "9876543210",
    email: "ramesh.patil@example.com",
    password: "farmer123",
    village: "Shirwal",
    district: "Satara",
    state: "Maharashtra"
  },
  {
    name: "Sunita Devi",
    phone: "9812345678",
    email: "",
    password: "farmer123",
    village: "Barhi",
    district: "Hazaribagh",
    state: "Jharkhand"
  },
  {
    name: "District Procurement Officer",
    phone: "9000000001",
    email: "admin@krishi.gov.in",
    password: "admin123",
    village: "",
    district: "Satara",
    state: "Maharashtra"
  }
];

// ---------------- Small helper functions ----------------

function show(id) {
  var el = document.getElementById(id);
  if (el !== null) {
    el.classList.remove("hidden");
  }
}

function hide(id) {
  var el = document.getElementById(id);
  if (el !== null) {
    el.classList.add("hidden");
  }
}

function setError(field, message) {
  document.getElementById("error-" + field).textContent = message;
}

function setFormError(message) {
  var box = document.getElementById("formError");
  box.textContent = message;
  if (message === "") {
    box.classList.add("hidden");
  } else {
    box.classList.remove("hidden");
  }
}

// A valid Indian mobile number: 10 digits, starting with 6, 7, 8 or 9.
function isValidPhone(phone) {
  return /^[6-9][0-9]{9}$/.test(phone);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---------------- Saving users (browser storage) ----------------

// Accounts created from the registration form.
function getRegisteredUsers() {
  var saved = localStorage.getItem("krishi_users");
  if (saved === null) {
    return [];
  }
  return JSON.parse(saved);
}

// Demo accounts + registered accounts together.
function getAllUsers() {
  return demoUsers.concat(getRegisteredUsers());
}

function saveRegisteredUser(user) {
  var users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem("krishi_users", JSON.stringify(users));
}

// ---------------- Login / logout state ----------------

function saveLogin(user) {
  // Save only basic details of the logged-in user - never the password.
  var safeUser = {
    name: user.name,
    phone: user.phone,
    email: user.email,
    village: user.village,
    district: user.district,
    state: user.state
  };
  localStorage.setItem("krishi_loggedInUser", JSON.stringify(safeUser));
}

function getLoggedInUser() {
  var saved = localStorage.getItem("krishi_loggedInUser");
  if (saved === null) {
    return null;
  }
  return JSON.parse(saved);
}

function logout() {
  localStorage.removeItem("krishi_loggedInUser");
  window.location.href = "index.html";
}

// Show a green message on the home page after going there
// (for example: "Welcome back, Ramesh Patil!").
function setPageMessage(text) {
  sessionStorage.setItem("krishi_message", text);
}

function showPageMessage() {
  var box = document.getElementById("pageMessage");
  var text = sessionStorage.getItem("krishi_message");
  if (box !== null && text !== null) {
    box.textContent = text;
    box.classList.remove("hidden");
    sessionStorage.removeItem("krishi_message");
  }
}

// ---------------- Top bar ----------------
// If logged in: hide Login/Register, show the user's name and Logout.

function setupNav() {
  var user = getLoggedInUser();
  if (user !== null) {
    hide("navLogin");
    hide("navRegister");
    document.getElementById("navUser").textContent = "👋 " + user.name;
    show("navUser");
    show("navLogout");
  }
}

// ---------------- Home page ----------------

function initHome() {
  var user = getLoggedInUser();
  if (user === null) {
    return; // not logged in - nothing extra to show
  }

  show("welcomeBox");
  hide("heroButtons");

  document.getElementById("welcomeTitle").textContent = "Welcome, " + user.name + " 👋";
  document.getElementById("dName").textContent = user.name;
  document.getElementById("dPhone").textContent = user.phone;
  document.getElementById("dDistrict").textContent = user.district;
  document.getElementById("dState").textContent = user.state;

  // Email and village are not present for every account
  // (email is optional, and the demo admin has no village).
  if (user.email) {
    document.getElementById("dEmail").textContent = user.email;
  } else {
    hide("rowEmail");
  }

  if (user.village) {
    document.getElementById("dVillage").textContent = user.village;
  } else {
    hide("rowVillage");
  }
}

// ---------------- Registration form ----------------

function initRegister() {
  // Already logged in? Go to the home page.
  if (getLoggedInUser() !== null) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("registerForm").addEventListener("submit", function (event) {
    event.preventDefault(); // do not reload the page
    setFormError("");

    // Read all the values typed by the user.
    var name = document.getElementById("name").value.trim();
    var phone = document.getElementById("phone").value.trim();
    var email = document.getElementById("email").value.trim();
    var password = document.getElementById("password").value;
    var confirmPassword = document.getElementById("confirmPassword").value;
    var village = document.getElementById("village").value.trim();
    var district = document.getElementById("district").value.trim();
    var state = document.getElementById("state").value;

    var ok = true;

    // Check the name.
    if (name === "") {
      setError("name", "Full name is required.");
      ok = false;
    } else if (name.length < 3) {
      setError("name", "Name must be at least 3 characters.");
      ok = false;
    } else {
      setError("name", "");
    }

    // Check the mobile number.
    if (phone === "") {
      setError("phone", "Mobile number is required.");
      ok = false;
    } else if (!isValidPhone(phone)) {
      setError("phone", "Enter a valid 10-digit Indian mobile number.");
      ok = false;
    } else {
      setError("phone", "");
    }

    // Email is optional, but if typed it must look like an email.
    if (email !== "" && !isValidEmail(email)) {
      setError("email", "Enter a valid email address, or leave it empty.");
      ok = false;
    } else {
      setError("email", "");
    }

    // Check the password.
    if (password === "") {
      setError("password", "Password is required.");
      ok = false;
    } else if (password.length < 6) {
      setError("password", "Password must be at least 6 characters.");
      ok = false;
    } else {
      setError("password", "");
    }

    // Check the confirm password.
    if (confirmPassword === "") {
      setError("confirmPassword", "Please re-enter your password.");
      ok = false;
    } else if (confirmPassword !== password) {
      setError("confirmPassword", "Passwords do not match.");
      ok = false;
    } else {
      setError("confirmPassword", "");
    }

    // Check the location fields.
    if (village === "") {
      setError("village", "Village is required.");
      ok = false;
    } else {
      setError("village", "");
    }

    if (district === "") {
      setError("district", "District is required.");
      ok = false;
    } else {
      setError("district", "");
    }

    if (state === "") {
      setError("state", "State is required.");
      ok = false;
    } else {
      setError("state", "");
    }

    if (!ok) {
      return; // stop here - the error messages are shown on the form
    }

    // Make sure this mobile number / email is not already registered.
    var users = getAllUsers();
    for (var i = 0; i < users.length; i++) {
      if (users[i].phone === phone) {
        setError("phone", "This mobile number is already registered. Please login.");
        return;
      }
      if (email !== "" && users[i].email !== "" &&
          users[i].email.toLowerCase() === email.toLowerCase()) {
        setError("email", "This email is already registered. Please login.");
        return;
      }
    }

    // Everything is fine - save the new account and log in.
    var newUser = {
      name: name,
      phone: phone,
      email: email,
      password: password,
      village: village,
      district: district,
      state: state
    };
    saveRegisteredUser(newUser);
    saveLogin(newUser);
    setPageMessage("Account created. Welcome, " + name + "!");
    window.location.href = "index.html";
  });
}

// ---------------- Login form ----------------

function initLogin() {
  // Already logged in? Go to the home page.
  if (getLoggedInUser() !== null) {
    window.location.href = "index.html";
    return;
  }

  document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // do not reload the page
    setFormError("");

    // The user can type a mobile number OR an email in this one box.
    var identifier = document.getElementById("identifier").value.trim();
    var password = document.getElementById("password").value;

    var ok = true;

    if (identifier === "") {
      setError("identifier", "Mobile number or email is required.");
      ok = false;
    } else {
      setError("identifier", "");
    }

    if (password === "") {
      setError("password", "Password is required.");
      ok = false;
    } else {
      setError("password", "");
    }

    if (!ok) {
      return;
    }

    // Find the account with this mobile number or email.
    var users = getAllUsers();
    var foundUser = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].phone === identifier ||
          (users[i].email !== "" &&
           users[i].email.toLowerCase() === identifier.toLowerCase())) {
        foundUser = users[i];
        break;
      }
    }

    if (foundUser === null) {
      setFormError("No account found with this mobile number or email. Please register first.");
      return;
    }

    if (foundUser.password !== password) {
      setFormError("Wrong password. Please try again.");
      return;
    }

    // Login successful.
    saveLogin(foundUser);
    setPageMessage("Welcome back, " + foundUser.name + "!");
    window.location.href = "index.html";
  });
}

// ---------------- Run when the page opens ----------------

document.addEventListener("DOMContentLoaded", function () {
  setupNav();
  showPageMessage();

  // Each page has only some of these parts, so check before using them.
  if (document.getElementById("welcomeBox") !== null) {
    initHome();
  }
  if (document.getElementById("registerForm") !== null) {
    initRegister();
  }
  if (document.getElementById("loginForm") !== null) {
    initLogin();
  }
});
