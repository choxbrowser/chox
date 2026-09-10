```javascript
const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const safeSearch = document.getElementById("safeSearch");
const themeButton = document.getElementById("themeButton");
const quickLinks = document.querySelectorAll("[data-search]");


// ------------------------------
// SEARCH
// ------------------------------

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    input.focus();
    return;
  }

  /*
    Chox currently uses DuckDuckGo's HTML search endpoint.

    This keeps the frontend simple and does not attempt
    to bypass network filtering or restrictions.
  */

  let url =
    "https://html.duckduckgo.com/html/?q=" +
    encodeURIComponent(query);

  if (safeSearch.checked) {
    url += "&kp=1";
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
});


// ------------------------------
// CLEAR SEARCH
// ------------------------------

input.addEventListener("input", function () {
  clearButton.style.display =
    input.value.length > 0 ? "block" : "none";
});

clearButton.addEventListener("click", function () {
  input.value = "";

  clearButton.style.display = "none";

  input.focus();
});


// ------------------------------
// QUICK SEARCHES
// ------------------------------

quickLinks.forEach(button => {

  button.addEventListener("click", function () {

    const query = button.dataset.search;

    input.value = query;

    clearButton.style.display = "block";

    input.focus();

  });

});


// ------------------------------
// THEME BUTTON
// ------------------------------

let lightMode = false;

themeButton.addEventListener("click", function () {

  lightMode = !lightMode;

  if (lightMode) {

    document.documentElement.style.setProperty(
      "--bg",
      "#f4f5f7"
    );

    document.documentElement.style.setProperty(
      "--text",
      "#111216"
    );

    document.documentElement.style.setProperty(
      "--muted",
      "#626773"
    );

    document.body.style.background =
      "#f4f5f7";

    themeButton.textContent = "☾";

  } else {

    document.documentElement.style.setProperty(
      "--bg",
      "#07080b"
    );

    document.documentElement.style.setProperty(
      "--text",
      "#f5f5f7"
    );

    document.documentElement.style.setProperty(
      "--muted",
      "#8d919d"
    );

    document.body.style.background =
      "#07080b";

    themeButton.textContent = "☼";
  }

});
```

