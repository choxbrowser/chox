document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("searchForm");
    const input = document.getElementById("searchInput");
    const clearButton = document.getElementById("clearButton");
    const safeSearch = document.getElementById("safeSearch");
    const themeButton = document.getElementById("themeButton");
    const quickLinks = document.querySelectorAll("[data-search]");

    // Make sure the search form exists
    if (!form || !input) {
        console.error("Chox: Search form not found.");
        return;
    }

    // SEARCH
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();

        const query = input.value.trim();

        if (query === "") {
            input.focus();
            return;
        }

        let url =
            "https://www.google.com/search?q=" +
            encodeURIComponent(query);

        // Safe Search
        if (safeSearch && safeSearch.checked) {
            url += "&safe=active";
        }

        // Navigate to results
        window.location.assign(url);
    });

    // CLEAR SEARCH
    if (input && clearButton) {
        input.addEventListener("input", function () {
            clearButton.style.display =
                input.value.length > 0 ? "block" : "none";
        });

        clearButton.addEventListener("click", function (event) {
            event.preventDefault();

            input.value = "";
            clearButton.style.display = "none";
            input.focus();
        });
    }

    // QUICK SEARCH BUTTONS
    quickLinks.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const query = button.getAttribute("data-search");

            if (query) {
                input.value = query;

                if (clearButton) {
                    clearButton.style.display = "block";
                }

                input.focus();
            }
        });
    });

    // THEME BUTTON
    if (themeButton) {
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
            } else {
                document.documentElement.style.setProperty(
                    "--bg",
                    "#08090c"
                );

                document.documentElement.style.setProperty(
                    "--text",
                    "#ffffff"
                );
            }
        });
    }
});
