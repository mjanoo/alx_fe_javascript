// Simulated server storage
let serverQuotes = [
  { text: "Server quote 1", category: "Motivation" },
  { text: "Server quote 2", category: "Inspiration" }
];

// Simulate fetching data from server
function fetchServerQuotes() {
  return new Promise((resolve) => {
    setTimeout(() => resolve(serverQuotes), 500); // simulate network delay
  });
}

// Simulate sending data to server
function sendQuotesToServer(localQuotes) {
  return new Promise((resolve) => {
    setTimeout(() => {
      serverQuotes = [...localQuotes]; // server accepts local quotes
      resolve(true);
    }, 500);
  });
}

// Load quotes from localStorage or use defaults
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", category: "Perseverance" },
  { text: "Don’t let yesterday take up too much of today.", category: "Inspiration" }
];

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ------------------------
// Notification system
function notifyUser(message) {
  let feedback = document.getElementById("feedback");
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.id = "feedback";
    document.body.appendChild(feedback);
  }
  feedback.textContent = message;

  setTimeout(() => { feedback.textContent = ""; }, 5000);
}

// Displays a random quote in #quoteDisplay
function showRandomQuote(filteredQuotes = quotes) {
  if (filteredQuotes.length === 0) {
    document.getElementById("quoteDisplay").innerHTML = "<p>No quotes in this category.</p>";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  const quoteText = document.createElement("p");
  quoteText.textContent = `"${randomQuote.text}"`;

  const quoteCategory = document.createElement("span");
  quoteCategory.textContent = `Category: ${randomQuote.category}`;
  quoteCategory.style.fontStyle = "italic";

  quoteDisplay.appendChild(quoteText);
  quoteDisplay.appendChild(quoteCategory);

  // Save last viewed quote to sessionStorage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// Show the last viewed quote (from sessionStorage)
function displayLastQuote() {
  const lastQuote = JSON.parse(sessionStorage.getItem("lastQuote"));
  const quoteDisplay = document.getElementById("quoteDisplay");

  if (lastQuote) {
    quoteDisplay.innerHTML = `"${lastQuote.text}" <br><span style="font-style:italic">Category: ${lastQuote.category}</span>`;
  } else {
    quoteDisplay.innerHTML = "No last viewed quote found!";
  }
}

// Build dropdowns dynamically
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  if (!categoryFilter) return;

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  const categories = [...new Set(quotes.map(q => q.category))];
  categories.forEach(cat => {
    let option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes();
  }
}

// Filter quotes by category
function filterQuotes() {
  const filter = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", filter);

  if (filter === "all") {
    showRandomQuote(quotes);
  } else {
    const filtered = quotes.filter(q => q.category === filter);
    showRandomQuote(filtered);
  }
}

// Builds the “add quote” form dynamically and wires submit -> addQuote
function createAddQuoteForm() {
  if (document.getElementById("quoteForm")) return; // avoid duplicates

  const form = document.createElement("form");
  form.id = "quoteForm";

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Add Quote";

  form.append(textInput, catInput, addBtn);
  document.body.appendChild(form);

  form.addEventListener("submit", addQuote);
}

// Adds a new quote
async function addQuote(e) {
  e.preventDefault();

  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category!");
    return;
  }

  quotes.push({ text, category });
  saveQuotes(); // persist to localStorage

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  populateCategories();
  filterQuotes();

  await sendQuotesToServer(quotes); // sync to server
  notifyUser("New quote synced to server!");
}

// Export quotes to JSON file
function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "quotes.json";
  link.click();
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        notifyUser("✅ Quotes imported successfully!");
      } else {
        alert("❌ Invalid JSON format. Expected an array of quotes.");
      }
    } catch (error) {
      alert("❌ Error parsing JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Sync with server periodically
async function syncWithServer() {
  const serverData = await fetchServerQuotes();

  // Conflict resolution: server wins
  serverData.forEach(serverQuote => {
    const exists = quotes.find(q => q.text === serverQuote.text && q.category === serverQuote.category);
    if (!exists) {
      quotes.push(serverQuote);
    }
  });

  saveQuotes();
  populateCategories();
  filterQuotes();
  notifyUser("Quotes synced with server!");
}

// Run sync every 30 seconds
setInterval(syncWithServer, 30000);

// Hook up events after DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  createAddQuoteForm();
  populateCategories();

  const btn = document.getElementById("newQuote");
  if (btn) btn.addEventListener("click", filterQuotes);

  const filter = document.getElementById("categoryFilter");
  if (filter) filter.addEventListener("change", filterQuotes);

  // Show last viewed quote if exists, else random
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    displayLastQuote();
  } else {
    filterQuotes();
  }
});
