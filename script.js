document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");
    const safeSearch = document.getElementById("safeSearch");

    if (!form || !input) {
        console.error("Chox: Search elements not found.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const query = input.value.trim();

        if (!query) {
            input.focus();
            return;
        }

        let searchURL =
            "https://duckduckgo.com/?q=" +
            encodeURIComponent(query);

        // DuckDuckGo Safe Search
        if (safeSearch && safeSearch.checked) {
            searchURL += "&kp=1";
        }

        // Open the DuckDuckGo results in the current tab
        window.location.href = searchURL;
    });
});
