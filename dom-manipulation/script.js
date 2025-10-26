// Array of Quote Objects
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "That which does not kill us makes us stronger.", category: "Resilience" }
];
let quotes =JSON.parse(localStorage.getItem("localquotes")) || defaultQuotes;
let quoteDisplay;
let messageArea;
let newQuoteBtn;
let quoteTextInput;
let categoryInput;

// /**
//         * Helper function to show messages.
//         * @param {string} message The message text.
//         */
// function showMessage(message) {

//     // Clear previous content
//     while (messageArea.firstChild) {
//         messageArea.removeChild(messageArea.firstChild);
//     }
    
//     if (message) {
//         // Create and append the new message text node
//         const messageTextNode = document.createTextNode(message);
//         messageArea.appendChild(messageTextNode);
        
//         // Set timeout to clear the message
//         setTimeout(() => { 
//             while (messageArea.firstChild) {
//                 messageArea.removeChild(messageArea.firstChild);
//             }
//         }, 3000);
//     }

    // Alternative simpler approach:
    // if (message) {
    //     messageArea.innerHTML = message;
    //     setTimeout(() => { messageArea.innerHTML = ''; }, 3000);
    // } else {
    //     messageArea.innerHTML = '';
    // }
// }

// Save quotes to local storage
function saveQuotes() {
    localStorage.setItem("localquotes", JSON.stringify(quotes));
}

// Function to display a random quote
function showRandomQuote() {

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const Quote = quotes[randomIndex];

    // Displaing the quote using DOM manipulation
    // Create elements
    const figure = document.createElement('figure');
    const blockquote = document.createElement('blockquote');
    const figcaption = document.createElement('figcaption');

    // Clear previous content
    while (quoteDisplay.firstChild) {
        quoteDisplay.removeChild(quoteDisplay.firstChild);
    }
    // Text nodes for content
    const quoteTextNode = document.createTextNode(`"${Quote.text}"`);
    const categoryTextNode = document.createTextNode(`— Category: ${Quote.category}`);

    // Build the hierarchy using appendChild
    blockquote.appendChild(quoteTextNode);
    figcaption.appendChild(categoryTextNode);

    figure.appendChild(blockquote);
    figure.appendChild(figcaption);

    // Add the final structure to the DOM
    quoteDisplay.appendChild(figure);

    // --------- Alternative Approach ----------
    // quoteDisplay.innerHTML = `
    // <figure>
    //     <blockquote>
    //         "${Quote.text}"
    //     </blockquote>
    //     <figcaption>
    //         — Category: ${Quote.category}
    //     </figcaption>
    // </figure>`
    // ----------------------------------------

    // alert(''); // Clear any previous messages
};

// Function to add a new quote
function addQuote() {
    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    // Input Validation Logic
    if (!newQuoteText || !newQuoteCategory) {
        alert('🚨 Please provide both a quote and a category.');
        return; // Stop the function if validation fails
    }

    // Check for duplicates (Simple check on text)
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

    quoteTextInput.value = '';
    categoryInput.value = '';

    alert('✅ New quote added successfully!');

    showRandomQuote();
}

// Function to export quotes to JSON file
function exportQuotes() {
    // Convert the quotes array to a formatted JSON string
    const jsonString = JSON.stringify(quotes); 
    
    // Create a Blob object containing the JSON data
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element (<a>)
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_exported_quotes.json'; // Set the default file name
    
    // Programmatically click the anchor element to trigger the download
    a.click();
    
    // Revoke the URL to release the memory.
    URL.revokeObjectURL(url);
    
    showMessage('🎉 Quotes successfully exported to JSON!');
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      alert('Quotes imported successfully!');
    };
    fileReader.readAsText(event.target.files[0]);
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

    function createAddQuoteForm() {
        addQuote();
    }
}

// Run the initialization function when the document is ready
document.addEventListener('DOMContentLoaded', initialize);