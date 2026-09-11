const searchForm = document.getElementById("searchForm");
const searchInput = document.getElementById("searchInput");

if (searchForm) {

    searchForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) return;

        window.location.href =
            "results.html?q=" +
            encodeURIComponent(query);

    });

}


/*
 * Quick search buttons
 */

document.querySelectorAll("[data-search]").forEach(button => {

    button.addEventListener("click", function() {

        const query = this.dataset.search;

        window.location.href =
            "results.html?q=" +
            encodeURIComponent(query);

    });

});
