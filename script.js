document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");

    if (!form || !input) {
        console.error("Chox: Search elements not found.");
        return;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = input.value.trim();

        if (!query) {
            input.focus();
            return;
        }

        // Send the query to Chox's own results page
        const resultsURL =
            "results.html?q=" + encodeURIComponent(query);

        window.location.href = resultsURL;
    });
});
