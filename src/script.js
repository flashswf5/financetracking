const ALPHA_VANTAGE_API_KEY = '56BTR2Q1HUESZZ4A'; // Replace with your actual API key

// Function to get stock price from Alpha Vantage API
async function getStockPrice(symbol) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data["Global Quote"] && data["Global Quote"]["05. price"]) {
            return parseFloat(data["Global Quote"]["05. price"]);
        } else {
            throw new Error(`Could not retrieve price for ${symbol}`);
        }
    } catch (error) {
        logError(`Error getting price for ${symbol}: ${error.message}`);
        return null;
    }
}

// Function to handle user registration
function registerUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    if (users[username]) {
        alert('Username already exists!');
        return false;
    }
    users[username] = { password, profile: { stocks: {}, groups: {}, googleSheet: null, options: []} };
    localStorage.setItem('users', JSON.stringify(users));
    alert('Registration successful!');
    return true;
}

// Function to handle user login
function loginUser(username, password) {
    const users = JSON.parse(localStorage.getItem('users')) || {};
    const user = users[username];
    if (user && user.password === password) {
        localStorage.setItem('currentUser', username);
        alert('Login successful!');
        return true;
    } else {
        alert('Invalid username or password!');
        return false;
    }
}

// Function to get the current user profile
function getCurrentUserProfile() {
    const currentUsername = localStorage.getItem('currentUser');
    if (!currentUsername) return null;
    const users = JSON.parse(localStorage.getItem('users')) || {};
    return users[currentUsername].profile;
}

// Function to save the user profile
function saveUserProfile(profile) {
    const currentUsername = localStorage.getItem('currentUser');
    if (currentUsername) {
        const users = JSON.parse(localStorage.getItem('users')) || {};
        if(users[currentUsername]){
            users[currentUsername].profile = profile;
            localStorage.setItem('users', JSON.stringify(users));
        }
    }
}

// Function to log errors
function logError(message) {
    const errorDiv = document.getElementById('errors');
    if (errorDiv) {
        const p = document.createElement('p');
        p.textContent = message;
        errorDiv.appendChild(p);
    }
}

// Function to add stock symbol to the user's profile
function addStock(symbol, group, subgroup) {
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in");
        return;
    }
    if (!symbol) {
        logError("Stock symbol not provided.");
        return;
    }

    if (!group || !subgroup) {
        logError("Group or Subgroup not selected.");
        return;
    }

    if (!profile.groups[group]) {
        profile.groups[group] = {};
    }

    if (!profile.groups[group][subgroup]) {
        profile.groups[group][subgroup] = [];
    }

    profile.groups[group][subgroup].push(symbol);
    saveUserProfile(profile);
    displayStockInformation();
}

// Function to create groups and subgroups
function addGroupSubgroup(group, subgroup) {
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in.");
        return;
    }
    if (!group) {
        logError("Group not provided.");
        return;
    }
    if (!subgroup) {
        logError("Subgroup not provided.");
        return;
    }

    if (!profile.groups[group]) {
        profile.groups[group] = {};
    }
    profile.groups[group][subgroup] = [];
    saveUserProfile(profile);
    displayStockInformation();
}

// Function to add stocks from a file
function addStocksFromFile(fileContent, group, subgroup) {
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in");
        return;
    }
    if (!fileContent || fileContent === "") {
        logError("File content is empty.");
        return;
    }
    if (!group || !subgroup) {
        logError("Group or Subgroup not selected.");
        return;
    }
    const stocks = fileContent.trim().split('\n');
    if (!profile.groups[group]) {
        profile.groups[group] = {};
    }

    if (!profile.groups[group][subgroup]) {
        profile.groups[group][subgroup] = [];
    }

    for (const stock of stocks){
        profile.groups[group][subgroup].push(stock);
    }

    saveUserProfile(profile);
    displayStockInformation();
}

// Function to display stock information
async function displayStockInformation() {
    const profile = getCurrentUserProfile();
    const stockInfoDiv = document.getElementById('stockInformation');
    stockInfoDiv.innerHTML = '';

    if (!profile) return;

    for (const group in profile.groups) {
        const groupDiv = document.createElement('div');
        groupDiv.innerHTML = `<h3>${group}</h3>`;
        stockInfoDiv.appendChild(groupDiv);

        for (const subgroup in profile.groups[group]) {
            const subgroupDiv = document.createElement('div');
            subgroupDiv.innerHTML = `<h4>${subgroup}</h4>`;
            groupDiv.appendChild(subgroupDiv);

            for (const symbol of profile.groups[group][subgroup]) {
                const price = await getStockPrice(symbol);
                const stockDiv = document.createElement('div');
                stockDiv.textContent = `${symbol}: ${price !== null ? price : 'N/A'}`;
                subgroupDiv.appendChild(stockDiv);
            }
        }
    }
}

// Function to handle options simulation
function simulateOption(type, symbol, amount) {
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in");
        return;
    }
    if(!type || !symbol || !amount){
        logError("Please fill all the fields");
        return;
    }
    profile.options.push({ type, symbol, amount });
    saveUserProfile(profile);
    alert('Option simulated!');
}

// Function to add the Google Sheet link to user profile.
function addGoogleSheet(googleSheetLink){
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in");
        return;
    }
    if (!googleSheetLink) {
        logError("Please provide the google sheet link");
        return;
    }
    profile.googleSheet = googleSheetLink;
    saveUserProfile(profile);
    alert("Google Sheet added!");
}

// Function to send the Google Sheet info to main.py
async function sendGoogleSheetInfo(link) {
    const profile = getCurrentUserProfile();
    if (!profile) {
        logError("User not logged in");
        return;
    }
    try {
        const response = await fetch('/google-sheet-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({googleSheet: link, user:localStorage.getItem('currentUser') })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log('Google Sheet link sent successfully!');
    } catch (error) {
        logError(`Failed to send Google Sheet link: ${error.message}`);
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    displayStockInformation();

    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('regUsername').value;
            const password = document.getElementById('regPassword').value;
            registerUser(username, password);
        });
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(username, password);
            displayStockInformation();
        });
    }

    const stockForm = document.getElementById('stockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const symbol = document.getElementById('stockSymbol').value;
            const group = document.getElementById('groupSelect').value;
            const subgroup = document.getElementById('subgroupSelect').value;
            addStock(symbol, group, subgroup);
        });
    }

    const groupSubgroupForm = document.getElementById('groupSubgroupForm');
    if (groupSubgroupForm) {
        groupSubgroupForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const group = document.getElementById('groupName').value;
            const subgroup = document.getElementById('subgroupName').value;
            addGroupSubgroup(group, subgroup);
        });
    }

    const fileUploadForm = document.getElementById('fileUploadForm');
    if (fileUploadForm) {
        fileUploadForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const fileInput = document.getElementById('fileInput');
            const file = fileInput.files[0];
            const group = document.getElementById('groupSelectFile').value;
            const subgroup = document.getElementById('subgroupSelectFile').value;
            if (!file) {
                logError("Please select a file to upload.");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                addStocksFromFile(e.target.result, group, subgroup);
            };
            reader.readAsText(file);
        });
    }

    const optionsSimulatorForm = document.getElementById('optionsSimulatorForm');
    if (optionsSimulatorForm) {
        optionsSimulatorForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const type = document.getElementById('optionType').value;
            const symbol = document.getElementById('optionStockSymbol').value;
            const amount = document.getElementById('optionAmount').value;
            simulateOption(type, symbol, amount);
        });
    }

    const googleSheetForm = document.getElementById('googleSheetForm');
    if (googleSheetForm) {
        googleSheetForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const googleSheetLink = document.getElementById('googleSheetLink').value;
            sendGoogleSheetInfo(googleSheetLink);
        });
    }
});