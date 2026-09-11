// Chox Search
// Simple, reliable client-side search handler

document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");
    const safeSearch = document.getElementById("safeSearch");

    if (!searchForm || !searchInput) {
        console.error("Chox: Search form or search input was not found.");
        return;
    }

    searchForm.addEventListener("submit", (event) => {
        // Stop the browser from refreshing the page
        event.preventDefault();

        const query = searchInput.value.trim();

        // Don't search if the box is empty
        if (!query) {
            searchInput.focus();
            return;
        }

        // Use DuckDuckGo for the search
        let searchURL =
            "https://duckduckgo.com/?q=" +
            encodeURIComponent(query);

        // Enable strict Safe Search when the option is checked
        if (safeSearch && safeSearch.checked) {
            searchURL += "&kp=1";
        }

        // Go to the search results
        window.location.href = searchURL;
    });

    // Allow pressing Escape to clear the search box
    searchInput.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            searchInput.value = "";
        }
    });
});
