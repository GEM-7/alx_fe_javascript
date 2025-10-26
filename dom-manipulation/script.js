// Array of Quote Objects
const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Inspiration" },
    { text: "The mind is everything. What you think you become.", category: "Philosophy" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "That which does not kill us makes us stronger.", category: "Resilience" }
];
let quotes = JSON.parse(localStorage.getItem("localquotes")) || defaultQuotes;
let quoteDisplay;
let messageArea;
let newQuoteBtn;
let quoteTextInput;
let categoryInput;
let categoryFilter;


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
    
    // Using .map to efficiently extract categories
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
    // Determine which quotes to display based on the filter
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';

    const quotesToDisplay = quotes.filter(quote => {
        if (selectedCategory === 'all') {
            return true;
        }
        return quote.category === selectedCategory;
    });

    // Handle case where no quotes match the filter
    if (quotesToDisplay.length === 0) {
        while (quoteDisplay.firstChild) {
            quoteDisplay.removeChild(quoteDisplay.firstChild);
        }
        alert(`⚠️ No quotes found in the '${selectedCategory}' category.`);
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
};

// Function to add a new quote
function addQuote() {
    const newQuoteText = quoteTextInput.value.trim();
    const newQuoteCategory = categoryInput.value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert('🚨 Please provide both a quote and a category.');
        return; // Stop the function if validation fails
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

    // Add the new quote to the quotes array
    quotes.push(newQuote);

    // Save the updated quotes array to local storage
    saveQuotes();

    // Update the categories dropdown in case a new category was added
    populateCategories();

    quoteTextInput.value = '';
    categoryInput.value = '';

    alert('✅ New quote added successfully!');

    // Show a random quote after adding a new one
    showRandomQuote();
}

// Function to export quotes to JSON file
function exportQuotes() {
    const jsonString = JSON.stringify(quotes);

    const blob = new Blob([jsonString], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'my_exported_quotes.json'; // Set the default file name

    a.click();

    URL.revokeObjectURL(url);

    alert('🎉 Quotes successfully exported to JSON!');
}

// Function to import quotes from JSON file
function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function (event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes();
        alert('Quotes imported successfully!');
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

    // Attach event listener to the "Show Random Quote" button
    newQuoteBtn.addEventListener('click', showRandomQuote);

    // Display an initial random quote on load
    showRandomQuote();

    function createAddQuoteForm() {
        addQuote();
    }

    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterQuotes);
        populateCategories(); // Populate categories on load
    }
}

// Run the initialization function when the document is ready
document.addEventListener('DOMContentLoaded', initialize);