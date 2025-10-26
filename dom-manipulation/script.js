// Array of Quote Objects
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "That which does not kill us makes us stronger.", category: "Resilience" }
];

// --- API Configuration ---
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
const FETCH_INTERVAL = 60000;

let quotes = JSON.parse(localStorage.getItem("localquotes")) || defaultQuotes;
let quoteDisplay;
let messageArea;
let newQuoteBtn;
let quoteTextInput;
let categoryInput;
let categoryFilter;

// --- Notification and Conflict Resolution UI Functions ---

/**
 * Displays a temporary notification in the message area.
 * @param {string} message The text to display.
 * @param {string} type 'success', 'warning', or 'error'.
 */
function showNotification(message, type = 'success') {
    if (!messageArea) return;

    messageArea.textContent = message;
    messageArea.className = `notification ${type}`;

    // Clear notification after 5 seconds
    setTimeout(() => {
        messageArea.textContent = '';
        messageArea.className = 'notification';
    }, 5000);
}

/**
 * Triggers a modal/alert to ask the user how to resolve a conflict.
 */
function promptManualResolution(serverData) {
    showNotification('⚠️ Conflict detected! New server data is available.', 'warning');

    const choice = confirm(
        "A difference was detected between local and server quotes. " +
        "Do you want to discard local changes and load the latest server data?\n\n" +
        "OK = Load Server Data (Server Precedence)\n" +
        "Cancel = Keep Local Data (Local Precedence)"
    );

    if (choice) {
        // User chose Server Precedence
        resolveConflict('server', serverData);
        showNotification('✅ Conflict resolved: Server data loaded.', 'success');
    } else {
        // User chose Local Precedence (Data remains as is, no change made)
        resolveConflict('local', serverData);
        showNotification('✅ Conflict resolved: Local data preserved.', 'success');
    }
}

/**
 * Resolves the conflict based on user's manual choice or automatic logic.
 * @param {string} precedence 'server' or 'local'.
 * @param {Array} serverData The fresh data from the API.
 */
function resolveConflict(precedence, serverData) {
    const defaultApiQuotes = serverData.map(item => ({
        text: item.title,
        category: 'API-' + (item.userId % 3 + 1)
    })).slice(0, 10);

    // Identify current local user additions (non-API-, non-default)
    const localUserQuotes = quotes.filter(
        quote => !defaultQuotes.some(d => d.text === quote.text) && !quote.category.startsWith('API-')
    );

    if (precedence === 'server') {
        // Server Precedence: Overwrite all old API data but keep unique local user additions
        quotes = [...defaultQuotes, ...defaultApiQuotes, ...localUserQuotes];
    } else if (precedence === 'local') {
        // Local Precedence: Keep the current 'quotes' array as is, but update the underlying API data structure
        const existingApiQuotes = quotes.filter(q => q.category.startsWith('API-'));
        if (existingApiQuotes.length === 0) {
             // If local data had no API quotes, we add the fresh ones
             quotes = [...quotes, ...defaultApiQuotes];
        }
    }
    
    saveQuotes();
    populateCategories();
    showRandomQuote();
}

// --- API Simulation Functions ---

/**
 * Simulates fetching initial data from the server.
 */
async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        // Map the mock API data to our quote structure
        const remoteQuotes = data.map(item => ({
            text: item.title,
            category: 'API-' + (item.userId % 3 + 1)
        })).slice(0, 10);

        // CONFLICT CHECK
        const currentApiQuotes = quotes.filter(q => q.category.startsWith('API-'));
        const remoteQuotesJSON = JSON.stringify(remoteQuotes.map(q => q.text).sort());
        const currentApiQuotesJSON = JSON.stringify(currentApiQuotes.map(q => q.text).sort());


        if (currentApiQuotes.length > 0 && remoteQuotesJSON !== currentApiQuotesJSON) {
            // Data has changed on the server, prompt user for manual resolution
            promptManualResolution(data); 
        } else if (currentApiQuotes.length === 0 && quotes.length !== defaultQuotes.length) {
             // Initial load or previous data cleared, apply automatic server precedence
             resolveConflict('server', data);
             showNotification('✅ Initial server data loaded successfully.', 'success');
        } else {
             // No effective change, or initial load with no conflict
             if (quotes.length > defaultQuotes.length + remoteQuotes.length) {
                 showNotification('🔄 Data checked. Local changes preserved.', 'info');
             } else {
                 showNotification('🔄 Data checked. No new changes found on server.', 'info');
             }
        }

    } catch (error) {
        console.error("Error fetching data from API:", error);
        showNotification("🚨 Could not fetch remote data. Using local quotes.", 'error');
    }
}

/**
 * Sets up periodic data fetching.
 */
function startPeriodicFetch() {
    // Fetch immediately upon starting
    fetchQuotesFromServer();

    // Set up the interval for continuous updates
    setInterval(fetchQuotesFromServer, FETCH_INTERVAL);
    console.log(`Starting periodic fetch every ${FETCH_INTERVAL / 1000} seconds...`);
}

/**
 * Manual trigger for conflict checking
 */
function manualConflictCheck() {
    showNotification('🔍 Checking server for updates...', 'info');
    fetchQuotesFromServer();
}

/**
 * Simulates posting a new quote to the server.
 */
async function postNewQuoteToServer(newQuote) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify({
                title: newQuote.text,
                body: `Category: ${newQuote.category}`,
                userId: 1,
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        });
        showNotification('✅ New quote saved locally and posted successfully!', 'success');

    } catch (error) {
        console.error("Error posting data to API:", error);
        showNotification('⚠️ New quote saved locally, but failed to post to server.', 'warning');
    }
}

// Function to clear all categories from the dropdown except the first one (All Categories).
function clearDropdown() {
    if (!categoryFilter) return;

    // Remove all children starting from the second element (index 1)
    while (categoryFilter.childElementCount > 1) {
        categoryFilter.removeChild(categoryFilter.lastChild);
    }
}

// Function to populate categories in the dropdown
function populateCategories() {
    if (!categoryFilter) return;

    clearDropdown();

    const allCategories = quotes.map(quote => quote.category);
    const uniqueCategories = [...new Set(allCategories)].sort();

    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        const textNode = document.createTextNode(category);
        option.appendChild(textNode);
        categoryFilter.appendChild(option);
    });
}

// Function to update the displayed quotes based on the selected category
function filterQuotes() {
    showRandomQuote();
}

// Function to save quotes to local storage
function saveQuotes() {
    localStorage.setItem("localquotes", JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {
    if (!quoteDisplay) return; // Safety check

    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    const quotesToDisplay = quotes.filter(quote => {
        if (selectedCategory === 'all') {
            return true;
        }
        return quote.category === selectedCategory;
    });

    if (quotesToDisplay.length === 0) {
        while (quoteDisplay.firstChild) {
            quoteDisplay.removeChild(quoteDisplay.firstChild);
        }
        return;
    }
    const randomIndex = Math.floor(Math.random() * quotesToDisplay.length);
    const Quote = quotesToDisplay[randomIndex];
    const figure = document.createElement('figure');
    const blockquote = document.createElement('blockquote');
    const figcaption = document.createElement('figcaption');

    while (quoteDisplay.firstChild) {
        quoteDisplay.removeChild(quoteDisplay.firstChild);
    }
    const quoteTextNode = document.createTextNode(`"${Quote.text}"`);
    const categoryTextNode = document.createTextNode(`— Category: ${Quote.category}`);

    blockquote.appendChild(quoteTextNode);
    figcaption.appendChild(categoryTextNode);

    figure.appendChild(blockquote);
    figure.appendChild(figcaption);

    quoteDisplay.appendChild(figure);
};

// Function to add a new quote
async function addQuote() {
    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert('🚨 Please provide both a quote and a category.');
        return;
    }

    const isDuplicate = quotes.some(quote => quote.text.toLowerCase() === newQuoteText.toLowerCase());
    if (isDuplicate) {
        alert('⚠️ This quote already exists!');
        return;
    }

    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };

    quotes.push(newQuote);
    saveQuotes();

    await postNewQuoteToServer(newQuote);

    populateCategories();

    quoteTextInput.value = '';
    categoryInput.value = '';
    
    showRandomQuote();
}

// Function to export quotes to JSON file
function exportQuotes() {
    const jsonString = JSON.stringify(quotes, null, 2);

    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_exported_quotes.json';

    a.click();

    URL.revokeObjectURL(url);

    showNotification('🎉 Quotes successfully exported to JSON!', 'success');
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        try {
            const importedQuotes = JSON.parse(event.target.result);
            if (!Array.isArray(importedQuotes)) {
                showNotification('🛑 Error: Imported file content is not a valid list of quotes.', 'error');
                return;
            }
            quotes.push(...importedQuotes);
            saveQuotes();
            populateCategories();
            showNotification('Quotes imported successfully!', 'success');
        } catch(e) {
            showNotification('🛑 Error parsing JSON file.', 'error');
        }
    };
    fileReader.readAsText(event.target.files[0]);
}


// --- Initialization ---
function initialize() {
    quoteDisplay = document.getElementById('quoteDisplay');
    messageArea = document.getElementById('message-area');
    newQuoteBtn = document.getElementById('newQuote');
    quoteTextInput = document.getElementById('newQuoteText');
    categoryInput = document.getElementById('newQuoteCategory');
    categoryFilter = document.getElementById('categoryFilter');
    
    const manualCheckBtn = document.getElementById('manualCheck'); 

    // Attach event listeners
    if (newQuoteBtn) {
        newQuoteBtn.addEventListener('click', showRandomQuote);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterQuotes);
    }
    if (manualCheckBtn) {
        manualCheckBtn.addEventListener('click', manualConflictCheck);
    }

    populateCategories();

    showRandomQuote(); 

    startPeriodicFetch();
}

document.addEventListener('DOMContentLoaded', initialize);