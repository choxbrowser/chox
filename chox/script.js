const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const safeSearch = document.getElementById("safeSearch");

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const query = input.value.trim();

  if (!query) {
    return;
  }

  /*
   * Chox currently sends the search to DuckDuckGo.
   * A real Chox backend can be added later so searches
   * can be processed server-side.
   */

  const safe = safeSearch.checked ? "&kp=1" : "";

  const url =
    "https://html.duckduckgo.com/html/?q=" +
    encodeURIComponent(query) +
    safe;

  window.open(url, "_blank", "noopener,noreferrer");
});
