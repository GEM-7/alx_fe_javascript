// Array of Quote Objects
const quotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "That which does not kill us makes us stronger.", category: "Resilience" }
];

let quoteDisplay;
let messageArea;
let newQuoteBtn;
let quoteTextInput;
let categoryInput;

/**
        * Helper function to show messages.
        * @param {string} message The message text.
        */
function showMessage(message) {
    if (message) {
        messageArea.innerHTML = message;
        setTimeout(() => { messageArea.innerHTML = ''; }, 3000);
    } else {
        messageArea.innerHTML = '';
    }
}

// Function to display a random quote
function showRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const Quote = quotes[randomIndex];
    quoteDisplay.innerHTML = `
    <figure>
        <blockquote>
            "${Quote.text}"
        </blockquote>
        <figcaption>
            — Category: ${Quote.category}
        </figcaption>
    </figure>`
    showMessage(''); // Clear any previous messages
};

// Function to add a new quote
function addQuote() {
    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    // Input Validation Logic
    if (!newQuoteText || !newQuoteCategory) {
        showMessage('🚨 Please provide both a quote and a category.');
        return; // Stop the function if validation fails
    }
    
    // Check for duplicates (Simple check on text)
    const isDuplicate = quotes.some(quote => quote.text.toLowerCase() === newQuoteText.toLowerCase());
    if (isDuplicate) {
        showMessage('⚠️ This quote already exists!');
        return;
    }

    const newQuote = {
        text: newQuoteText,
        category: newQuoteCategory
    };

    quotes.push(newQuote);

    quoteTextInput.value = '';
    categoryInput.value = '';


    function createAddQuoteForm() {
        showRandomQuote();
    }
}

// --- Initialization ---
function initialize() {
    // Assigning DOM elements *inside* the initialize function 
    // to ensure they have been loaded by the browser.
    quoteDisplay = document.getElementById('quoteDisplay');
    messageArea = document.getElementById('message-area');
    newQuoteBtn = document.getElementById('newQuote');
    quoteTextInput = document.getElementById('newQuoteText');
    categoryInput = document.getElementById('newQuoteCategory');

    // Attach event listener to the "Show Random Quote" button
    newQuoteBtn.addEventListener('click', showRandomQuote);

    // Display an initial random quote on load
    showRandomQuote();
}

// Run the initialization function when the document is ready
document.addEventListener('DOMContentLoaded', initialize);