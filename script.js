// ==== In-memory data ====
let data = {
  categories: {
    Inspiration: [
      "Believe you can and you're halfway there.",
      "Start where you are. Use what you have. Do what you can."
    ],
    Humor: [
      "I'm not arguing; I'm just explaining why I'm right.",
      "I see food and I eat it."
    ]
  }
};

// ==== Cached elements ====
const els = {};
document.addEventListener("DOMContentLoaded", init);

function init() {
  els.quoteDisplay = document.getElementById("quoteDisplay");
  els.newQuoteBtn = document.getElementById("newQuote");
  els.categorySelect = document.getElementById("categorySelect");
  els.quoteForm = document.getElementById("quoteForm");
  els.newQuoteText = document.getElementById("newQuoteText");
  els.newQuoteCategory = document.getElementById("newQuoteCategory");
  els.feedback = document.getElementById("feedback");

  populateCategorySelect();
  showRandomQuote();

  els.newQuoteBtn.addEventListener("click", showRandomQuote);
  els.categorySelect.addEventListener("change", showRandomQuote);
  els.quoteForm.addEventListener("submit", onAddQuoteSubmit);
}

// ==== Functions ====
function populateCategorySelect() {
  els.categorySelect.innerHTML = "";
  const allOpt = document.createElement("option");
  allOpt.value = "All";
  allOpt.textContent = "All";
  els.categorySelect.appendChild(allOpt);

  Object.keys(data.categories).forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    els.categorySelect.appendChild(opt);
  });
}

function getQuotes() {
  const cat = els.categorySelect.value;
  if (cat === "All") {
    return Object.values(data.categories).flat();
  }
  return data.categories[cat] || [];
}

function showRandomQuote() {
  const quotes = getQuotes();
  if (quotes.length === 0) {
    els.quoteDisplay.textContent = "No quotes yet!";
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  els.quoteDisplay.textContent = quotes[randomIndex];
}

function onAddQuoteSubmit(e) {
  e.preventDefault();
  const text = els.newQuoteText.value.trim();
  const category = els.newQuoteCategory.value.trim();

  if (!text || !category) return;

  if (!data.categories[category]) {
    data.categories[category] = [];
    populateCategorySelect();
  }
  data.categories[category].push(text);

  els.feedback.textContent = `Quote added to "${category}"`;
  els.newQuoteText.value = "";
  els.newQuoteCategory.value = "";
  els.categorySelect.value = category;
  showRandomQuote();
}
