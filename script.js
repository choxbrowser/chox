const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const clearButton = document.getElementById("clearButton");
const themeButton = document.getElementById("themeButton");
const quickLinks = document.querySelectorAll("[data-search]");

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const query = input.value.trim();

    if (!query) {
        input.focus();
        return;
    }

    window.location.href =
        "results.html?q=" + encodeURIComponent(query);
});

input.addEventListener("input", function () {
    if (clearButton) {
        clearButton.style.display =
            input.value.length > 0 ? "block" : "none";
    }
});

if (clearButton) {
    clearButton.addEventListener("click", function () {
        input.value = "";
        clearButton.style.display = "none";
        input.focus();
    });
}

quickLinks.forEach(function (button) {
    button.addEventListener("click", function () {
        const query = button.dataset.search;

        window.location.href =
            "results.html?q=" + encodeURIComponent(query);
    });
});

if (themeButton) {
    let lightMode = false;

    themeButton.addEventListener("click", function () {
        lightMode = !lightMode;

        if (lightMode) {
            document.documentElement.style.setProperty("--bg", "#f4f5f7");
            document.documentElement.style.setProperty("--text", "#111216");
            document.documentElement.style.setProperty("--muted", "#626773");
            themeButton.textContent = "☾";
        } else {
            document.documentElement.style.setProperty("--bg", "#07080b");
            document.documentElement.style.setProperty("--text", "#f5f5f7");
            document.documentElement.style.setProperty("--muted", "#8d919d");
            themeButton.textContent = "☼";
        }
    });
}
