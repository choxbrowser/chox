/* =========================================================
   CHOX BROWSER - script.js
   Main browser/tab/navigation functionality
   ========================================================= */

"use strict";

/* -----------------------------
   STATE
----------------------------- */

let tabs = [];
let activeTabId = null;
let tabCounter = 1;

const HOME_URL = "chox://home";

const $ = (selector) => document.querySelector(selector);

function getTab(id) {
    return tabs.find(tab => String(tab.id) === String(id));
}

function getActiveTab() {
    return getTab(activeTabId);
}

/* -----------------------------
   INITIALIZE
----------------------------- */

document.addEventListener("DOMContentLoaded", () => {
    initializeChox();
});

function initializeChox() {
    // Prevent duplicate initialization
    if (tabs.length > 0) return;

    createNewTab();

    loadSettings();

    // Address bar Enter
    const addressBar = $("#addressBar");

    if (addressBar) {
        addressBar.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                openAddress();
            }
        });
    }

    // Search boxes
    document.querySelectorAll(".search-box input, #searchInput").forEach(input => {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                performSearch();
            }
        });
    });
}

/* -----------------------------
   TABS
----------------------------- */

function createNewTab() {
    const id = String(++tabCounter);

    const tab = {
        id,
        title: "New Tab",
        url: HOME_URL,
        type: "home",
        history: [HOME_URL],
        historyIndex: 0,
        bookmarked: false
    };

    tabs.push(tab);

    createTabButton(tab);
    createTabPage(tab);

    switchTab(id);

    return tab;
}

function createTabButton(tab) {
    const tabBar = $("#tabBar");

    if (!tabBar) return;

    const button = document.createElement("div");

    button.className = "browser-tab";
    button.dataset.tabId = tab.id;

    button.innerHTML = `
        <span class="tab-title">${escapeHTML(tab.title)}</span>
        <button class="tab-close" title="Close tab">×</button>
    `;

    button.addEventListener("click", event => {
        if (event.target.classList.contains("tab-close")) {
            return;
        }

        switchTab(tab.id);
    });

    button.querySelector(".tab-close").addEventListener("click", event => {
        event.stopPropagation();
        closeTab(tab.id);
    });

    // Put the tab before the + button
    const newTabButton = tabBar.querySelector(".new-tab");

    if (newTabButton) {
        tabBar.insertBefore(button, newTabButton);
    } else {
        tabBar.appendChild(button);
    }
}

function createTabPage(tab) {
    const container =
        $("#tabPages") ||
        $(".tab-pages") ||
        $("#browserPages");

    if (!container) return;

    const page = document.createElement("div");

    page.className = "tab-page";
    page.id = `tab-page-${tab.id}`;
    page.dataset.tabId = tab.id;

    container.appendChild(page);

    renderHome(tab);
}

function switchTab(id) {
    const tab = getTab(id);

    if (!tab) return;

    activeTabId = String(id);

    document.querySelectorAll(".browser-tab").forEach(button => {
        button.classList.toggle(
            "active",
            String(button.dataset.tabId) === String(id)
        );
    });

    document.querySelectorAll(".tab-page").forEach(page => {
        page.classList.toggle(
            "active",
            String(page.dataset.tabId) === String(id)
        );
    });

    updateAddressBar();
    updateNavigationButtons();
}

function closeTab(id) {
    const index = tabs.findIndex(
        tab => String(tab.id) === String(id)
    );

    if (index === -1) return;

    const wasActive = String(activeTabId) === String(id);

    document
        .querySelector(`.browser-tab[data-tab-id="${id}"]`)
        ?.remove();

    document
        .querySelector(`#tab-page-${id}`)
        ?.remove();

    tabs.splice(index, 1);

    // Always keep at least one tab
    if (tabs.length === 0) {
        createNewTab();
        return;
    }

    if (wasActive) {
        const nextTab =
            tabs[index] ||
            tabs[index - 1] ||
            tabs[0];

        switchTab(nextTab.id);
    }
}

/* -----------------------------
   TAB UPDATES
----------------------------- */

function updateTabButton(tab) {
    const button = document.querySelector(
        `.browser-tab[data-tab-id="${tab.id}"]`
    );

    if (!button) return;

    const title = button.querySelector(".tab-title");

    if (title) {
        title.textContent = tab.title || "New Tab";
    }
}

function updateAddressBar() {
    const tab = getActiveTab();

    if (!tab) return;

    const addressBar =
        $("#addressBar") ||
        $("#urlBar") ||
        $(".address-bar input");

    if (addressBar) {
        addressBar.value = tab.url || HOME_URL;
    }
}

function updateNavigationButtons() {
    const tab = getActiveTab();

    if (!tab) return;

    const back =
        $("#backButton") ||
        $('[data-action="back"]');

    const forward =
        $("#forwardButton") ||
        $('[data-action="forward"]');

    if (back) {
        back.disabled = tab.historyIndex <= 0;
    }

    if (forward) {
        forward.disabled =
            tab.historyIndex >= tab.history.length - 1;
    }
}

/* -----------------------------
   HOME PAGE
----------------------------- */

function renderHome(tab) {
    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="home-page">

            <div class="home-logo">
                <div class="home-logo-mark">CH</div>

                <div class="home-logo-text">
                    <span>CHOX</span>
                    <small>FAST • SIMPLE • YOURS</small>
                </div>
            </div>

            <div class="home-search">
                <input
                    id="searchInput-${tab.id}"
                    type="text"
                    placeholder="Search the web..."
                    autocomplete="off"
                />

                <button
                    class="search-button"
                    onclick="performSearch('${tab.id}')">
                    🔍
                </button>
            </div>

            <div class="quick-links">

                <button
                    class="quick-link"
                    onclick="openChoxVideoPage('${tab.id}')">
                    <span class="quick-icon">▶</span>
                    <span>Chox Video</span>
                </button>

                <button
                    class="quick-link"
                    onclick="openBookmarks()">
                    <span class="quick-icon">★</span>
                    <span>Bookmarks</span>
                </button>

                <button
                    class="quick-link"
                    onclick="openHistory()">
                    <span class="quick-icon">◷</span>
                    <span>History</span>
                </button>

                <button
                    class="quick-link"
                    onclick="openSettings()">
                    <span class="quick-icon">⚙</span>
                    <span>Settings</span>
                </button>

            </div>

            <div class="home-content">

                <div class="feature-card">
                    <div class="feature-icon">CH</div>

                    <div>
                        <h2>Welcome to Chox</h2>
                        <p>
                            Search the web with a fast,
                            clean browser experience.
                        </p>
                    </div>
                </div>

                <div class="home-cards">

                    <button
                        class="home-card"
                        onclick="openHistory()">
                        <span>◷</span>
                        <strong>Recent</strong>
                        <small>View your browsing history</small>
                    </button>

                    <button
                        class="home-card"
                        onclick="openBookmarks()">
                        <span>★</span>
                        <strong>Favorites</strong>
                        <small>Open saved pages</small>
                    </button>

                    <button
                        class="home-card"
                        onclick="openChoxAI()">
                        <span>✦</span>
                        <strong>Chox AI</strong>
                        <small>Ask Chox AI for help</small>
                    </button>

                </div>

            </div>

            <div class="home-footer">
                Chox Browser
            </div>

        </div>
    `;

    const input = document.querySelector(
        `#searchInput-${tab.id}`
    );

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                performSearch(tab.id);
            }
        });
    }
}

/* -----------------------------
   ADDRESS BAR
----------------------------- */

function openAddress() {
    const tab = getActiveTab();

    if (!tab) return;

    const addressBar =
        $("#addressBar") ||
        $("#urlBar") ||
        $(".address-bar input");

    if (!addressBar) return;

    let value = addressBar.value.trim();

    if (!value) return;

    // Chox internal pages
    if (
        value === "chox://home" ||
        value === "chox://"
    ) {
        navigateTab(tab.id, HOME_URL, "home", "New Tab");
        return;
    }

    if (
        value === "chox://video" ||
        value === "chox://video/"
    ) {
        openChoxVideoPage(tab.id);
        return;
    }

    // Search if it doesn't look like a URL
    if (!looksLikeURL(value)) {
        performSearch(tab.id, value);
        return;
    }

    if (!/^https?:\/\//i.test(value)) {
        value = "https://" + value;
    }

    navigateTab(
        tab.id,
        value,
        "website",
        value.replace(/^https?:\/\//i, "")
    );
}

/* -----------------------------
   NAVIGATION
----------------------------- */

function navigateTab(
    tabId,
    url,
    type = "website",
    title = url
) {
    const tab = getTab(tabId);

    if (!tab) return;

    // Remove forward history
    tab.history = tab.history.slice(
        0,
        tab.historyIndex + 1
    );

    tab.history.push(url);
    tab.historyIndex = tab.history.length - 1;

    tab.url = url;
    tab.type = type;
    tab.title = title || "Chox";

    renderTab(tab);

    switchTab(tab.id);
}

function renderTab(tab) {
    const page = getTabPage(tab.id);

    if (!page) return;

    if (tab.type === "home") {
        renderHome(tab);
    }

    else if (tab.type === "chox-video") {
        renderChoxVideoFallback(tab);
    }

    else if (tab.type === "website") {
        renderWebsite(tab);
    }

    updateTabButton(tab);
    updateAddressBar();
    updateNavigationButtons();
}

/* -----------------------------
   WEBSITE VIEW
----------------------------- */

function renderWebsite(tab) {
    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="website-page">

            <div class="website-loading">
                <div class="loading-spinner"></div>

                <p>Loading</p>

                <small>
                    ${escapeHTML(tab.url)}
                </small>
            </div>

            <iframe
                class="website-frame"
                src="${escapeAttribute(tab.url)}"
                title="Web page"
                loading="eager">
            </iframe>

        </div>
    `;

    const iframe = page.querySelector("iframe");

    if (iframe) {
        iframe.addEventListener("load", () => {
            const loading =
                page.querySelector(".website-loading");

            if (loading) {
                loading.style.display = "none";
            }
        });

        iframe.addEventListener("error", () => {
            showWebsiteError(tab);
        });
    }
}

function showWebsiteError(tab) {
    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="website-error">
            <div class="error-icon">!</div>

            <h2>Unable to load this page</h2>

            <p>
                This website may not allow itself to
                be displayed inside Chox.
            </p>

            <button onclick="openExternal('${escapeAttribute(tab.url)}')">
                Open externally
            </button>
        </div>
    `;
}

/* -----------------------------
   CHOX VIDEO
----------------------------- */

function openChoxVideoPage(tabId) {
    const tab = getTab(tabId);

    if (!tab) return;

    tab.type = "chox-video";
    tab.url = "chox://video";
    tab.title = "Chox Video";

    switchTab(tab.id);

    const page = getTabPage(tab.id);

    if (!page) return;

    if (typeof window.renderChoxVideo === "function") {
        window.renderChoxVideo(tab.id);
        return;
    }

    renderChoxVideoFallback(tab);

    updateTabButton(tab);
    updateAddressBar();
}

function renderChoxVideoFallback(tab) {
    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="chox-video-page">

            <div class="video-sidebar">

                <div class="video-brand">
                    <span>CH</span>
                    <strong>CHOX VIDEO</strong>
                </div>

                <button onclick="openChoxVideoPage('${tab.id}')">
                    🏠 Home
                </button>

                <button onclick="searchChoxVideo('${tab.id}')">
                    🔍 Search
                </button>

                <button onclick="openHistory()">
                    ◷ History
                </button>

                <button onclick="openBookmarks()">
                    ★ Favorites
                </button>

            </div>

            <div class="video-main">

                <div class="video-header">
                    <h1>Chox Video</h1>

                    <div class="video-search">
                        <input
                            id="choxVideoSearch-${tab.id}"
                            placeholder="Search videos..."
                        />

                        <button
                            onclick="searchChoxVideo('${tab.id}')">
                            🔍
                        </button>
                    </div>
                </div>

                <div class="video-empty">
                    <div class="video-big-icon">▶</div>

                    <h2>Chox Video</h2>

                    <p>
                        Search for videos using Chox.
                    </p>
                </div>

            </div>

        </div>
    `;

    const input = document.querySelector(
        `#choxVideoSearch-${tab.id}`
    );

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                searchChoxVideo(tab.id);
            }
        });
    }
}

function searchChoxVideo(tabId) {
    const input = document.querySelector(
        `#choxVideoSearch-${tabId}`
    );

    if (!input) return;

    const query = input.value.trim();

    if (!query) return;

    performSearch(tabId, query + " site:youtube.com/watch");
}

/* -----------------------------
   SEARCH
----------------------------- */

function performSearch(tabId = activeTabId, customQuery = null) {
    const tab = getTab(tabId);

    if (!tab) return;

    let query = customQuery;

    if (!query) {
        const input =
            document.querySelector(`#searchInput-${tabId}`) ||
            $("#searchInput");

        query = input?.value?.trim();
    }

    if (!query) return;

    const url =
        `results.html?q=${encodeURIComponent(query)}`;

    tab.url = url;
    tab.type = "search";
    tab.title = `Search: ${query}`;

    tab.history = tab.history.slice(
        0,
        tab.historyIndex + 1
    );

    tab.history.push(url);
    tab.historyIndex++;

    renderSearchPage(tab, query);

    switchTab(tab.id);

    updateTabButton(tab);
    updateAddressBar();
}

function renderSearchPage(tab, query) {
    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="search-results-page">

            <div class="search-results-header">

                <div class="search-logo">
                    <span>CH</span>
                    <strong>CHOX</strong>
                </div>

                <div class="results-search">
                    <input
                        id="resultsSearch-${tab.id}"
                        value="${escapeAttribute(query)}"
                    />

                    <button
                        onclick="performSearch('${tab.id}')">
                        🔍
                    </button>
                </div>

            </div>

            <div
                id="resultsContainer-${tab.id}"
                class="results-container">

                <div class="results-loading">
                    <div class="loading-spinner"></div>
                    <p>Searching...</p>
                </div>

            </div>

        </div>
    `;

    const input = document.querySelector(
        `#resultsSearch-${tab.id}`
    );

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                performSearch(tab.id, input.value.trim());
            }
        });
    }

    loadSearchResults(tab.id, query);
}

async function loadSearchResults(tabId, query) {
    const container = document.querySelector(
        `#resultsContainer-${tabId}`
    );

    if (!container) return;

    try {
        const response = await fetch(
            `/api/search?q=${encodeURIComponent(query)}`
        );

        if (!response.ok) {
            throw new Error("Search request failed");
        }

        const data = await response.json();

        const results =
            data.results ||
            data.web ||
            data.items ||
            [];

        if (!Array.isArray(results) || results.length === 0) {
            container.innerHTML = `
                <div class="results-empty">
                    <h2>No results found</h2>
                    <p>Try a different search.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results
            .map(result => createSearchResult(result))
            .join("");

    } catch (error) {
        console.error("Chox search error:", error);

        container.innerHTML = `
            <div class="results-error">

                <div class="error-icon">!</div>

                <h2>Search unavailable</h2>

                <p>
                    The Chox search server is not running,
                    or the search request failed.
                </p>

                <button onclick="location.reload()">
                    Try again
                </button>

            </div>
        `;
    }
}

function createSearchResult(result) {
    const title =
        result.title ||
        result.name ||
        "Untitled result";

    const url =
        result.url ||
        result.link ||
        "#";

    const description =
        result.description ||
        result.snippet ||
        "";

    return `
        <article class="search-result">

            <div class="result-url">
                ${escapeHTML(url)}
            </div>

            <a
                href="#"
                class="result-title"
                onclick="navigateFromResult('${escapeAttribute(url)}'); return false;">
                ${escapeHTML(title)}
            </a>

            <p class="result-description">
                ${escapeHTML(description)}
            </p>

        </article>
    `;
}

function navigateFromResult(url) {
    const tab = getActiveTab();

    if (!tab) return;

    if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
    }

    navigateTab(
        tab.id,
        url,
        "website",
        url.replace(/^https?:\/\//i, "")
    );
}

/* -----------------------------
   BACK / FORWARD
----------------------------- */

function goBack() {
    const tab = getActiveTab();

    if (!tab) return;

    if (tab.historyIndex <= 0) return;

    tab.historyIndex--;

    const url = tab.history[tab.historyIndex];

    tab.url = url;

    detectAndRenderURL(tab);
}

function goForward() {
    const tab = getActiveTab();

    if (!tab) return;

    if (
        tab.historyIndex >=
        tab.history.length - 1
    ) {
        return;
    }

    tab.historyIndex++;

    const url = tab.history[tab.historyIndex];

    tab.url = url;

    detectAndRenderURL(tab);
}

function detectAndRenderURL(tab) {
    if (
        tab.url === HOME_URL ||
        tab.url === "chox://home"
    ) {
        tab.type = "home";
        tab.title = "New Tab";
        renderHome(tab);
    }

    else if (
        tab.url === "chox://video"
    ) {
        tab.type = "chox-video";
        tab.title = "Chox Video";
        openChoxVideoPage(tab.id);
    }

    else if (
        tab.url.startsWith("results.html")
    ) {
        tab.type = "search";

        const params = new URLSearchParams(
            tab.url.split("?")[1] || ""
        );

        const query = params.get("q") || "";

        tab.title = `Search: ${query}`;

        renderSearchPage(tab, query);
    }

    else {
        tab.type = "website";

        tab.title =
            tab.url.replace(
                /^https?:\/\//i,
                ""
            );

        renderWebsite(tab);
    }

    updateTabButton(tab);
    updateAddressBar();
    updateNavigationButtons();
}

/* -----------------------------
   HOME / RELOAD
----------------------------- */

function goHome() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.url = HOME_URL;
    tab.type = "home";
    tab.title = "New Tab";

    tab.history = tab.history.slice(
        0,
        tab.historyIndex + 1
    );

    tab.history.push(HOME_URL);
    tab.historyIndex++;

    renderHome(tab);

    updateTabButton(tab);
    updateAddressBar();
    updateNavigationButtons();
}

function reloadPage() {
    const tab = getActiveTab();

    if (!tab) return;

    if (tab.type === "home") {
        renderHome(tab);
    }

    else if (tab.type === "chox-video") {
        openChoxVideoPage(tab.id);
    }

    else if (tab.type === "search") {
        const params = new URLSearchParams(
            tab.url.split("?")[1] || ""
        );

        renderSearchPage(
            tab,
            params.get("q") || ""
        );
    }

    else if (tab.type === "website") {
        renderWebsite(tab);
    }
}

/* -----------------------------
   BOOKMARKS
----------------------------- */

function getBookmarks() {
    try {
        return JSON.parse(
            localStorage.getItem("choxBookmarks") || "[]"
        );
    } catch {
        return [];
    }
}

function saveBookmarks(bookmarks) {
    localStorage.setItem(
        "choxBookmarks",
        JSON.stringify(bookmarks)
    );
}

function toggleBookmark() {
    const tab = getActiveTab();

    if (!tab) return;

    const bookmarks = getBookmarks();

    const existing = bookmarks.findIndex(
        item => item.url === tab.url
    );

    if (existing >= 0) {
        bookmarks.splice(existing, 1);
        tab.bookmarked = false;
    } else {
        bookmarks.push({
            title: tab.title,
            url: tab.url,
            createdAt: Date.now()
        });

        tab.bookmarked = true;
    }

    saveBookmarks(bookmarks);
}

function openBookmarks() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "bookmarks";
    tab.url = "chox://bookmarks";
    tab.title = "Bookmarks";

    const page = getTabPage(tab.id);

    if (!page) return;

    const bookmarks = getBookmarks();

    page.innerHTML = `
        <div class="internal-page">

            <div class="internal-header">
                <span class="internal-icon">★</span>
                <h1>Bookmarks</h1>
            </div>

            ${
                bookmarks.length === 0
                ? `
                    <div class="internal-empty">
                        <h2>No bookmarks yet</h2>
                        <p>Pages you save will appear here.</p>
                    </div>
                `
                : `
                    <div class="bookmark-list">
                        ${bookmarks.map((bookmark, index) => `
                            <div class="bookmark-item">

                                <button
                                    onclick="navigateFromResult('${escapeAttribute(bookmark.url)}')">

                                    <strong>
                                        ${escapeHTML(bookmark.title)}
                                    </strong>

                                    <small>
                                        ${escapeHTML(bookmark.url)}
                                    </small>

                                </button>

                                <button
                                    onclick="deleteBookmark(${index})"
                                    title="Remove bookmark">
                                    ×
                                </button>

                            </div>
                        `).join("")}
                    </div>
                `
            }

        </div>
    `;

    updateTabButton(tab);
    updateAddressBar();
}

function deleteBookmark(index) {
    const bookmarks = getBookmarks();

    bookmarks.splice(index, 1);

    saveBookmarks(bookmarks);

    openBookmarks();
}

/* -----------------------------
   HISTORY
----------------------------- */

function getChoxHistory() {
    try {
        return JSON.parse(
            localStorage.getItem("choxHistory") || "[]"
        );
    } catch {
        return [];
    }
}

function saveChoxHistory(history) {
    localStorage.setItem(
        "choxHistory",
        JSON.stringify(history)
    );
}

function addToHistory(title, url) {
    if (
        !url ||
        url.startsWith("chox://")
    ) {
        return;
    }

    const history = getChoxHistory();

    const filtered = history.filter(
        item => item.url !== url
    );

    filtered.unshift({
        title: title || url,
        url,
        time: Date.now()
    });

    saveChoxHistory(filtered.slice(0, 100));
}

function openHistory() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "history";
    tab.url = "chox://history";
    tab.title = "History";

    const page = getTabPage(tab.id);

    if (!page) return;

    const history = getChoxHistory();

    page.innerHTML = `
        <div class="internal-page">

            <div class="internal-header">
                <span class="internal-icon">◷</span>
                <h1>History</h1>

                <button
                    class="clear-history-button"
                    onclick="clearHistory()">
                    Clear history
                </button>
            </div>

            ${
                history.length === 0
                ? `
                    <div class="internal-empty">
                        <h2>No history</h2>
                        <p>Your visited pages will appear here.</p>
                    </div>
                `
                : `
                    <div class="history-list">
                        ${history.map(item => `
                            <button
                                class="history-item"
                                onclick="navigateFromResult('${escapeAttribute(item.url)}')">

                                <strong>
                                    ${escapeHTML(item.title)}
                                </strong>

                                <small>
                                    ${escapeHTML(item.url)}
                                </small>

                            </button>
                        `).join("")}
                    </div>
                `
            }

        </div>
    `;

    updateTabButton(tab);
    updateAddressBar();
}

function clearHistory() {
    localStorage.removeItem("choxHistory");

    openHistory();
}

/* -----------------------------
   CHOX AI
----------------------------- */

function openChoxAI() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "ai";
    tab.url = "chox://ai";
    tab.title = "Chox AI";

    const page = getTabPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="ai-page">

            <div class="ai-header">
                <div class="ai-logo">✦</div>

                <div>
                    <h1>Chox AI</h1>
                    <p>Your AI assistant</p>
                </div>
            </div>

            <div
                id="aiMessages-${tab.id}"
                class="ai-messages">

                <div class="ai-message">
                    <strong>Chox AI</strong>
                    <p>
                        Hey! What can I help you with?
                    </p>
                </div>

            </div>

            <div class="ai-input">

                <input
                    id="aiInput-${tab.id}"
                    placeholder="Ask Chox AI..."
                />

                <button
                    onclick="sendAIMessage('${tab.id}')">
                    Send
                </button>

            </div>

        </div>
    `;

    const input = document.querySelector(
        `#aiInput-${tab.id}`
    );

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                sendAIMessage(tab.id);
            }
        });
    }

    updateTabButton(tab);
    updateAddressBar();
}

async function sendAIMessage(tabId) {
    const input = document.querySelector(
        `#aiInput-${tabId}`
    );

    const messages = document.querySelector(
        `#aiMessages-${tabId}`
    );

    if (!input || !messages) return;

    const message = input.value.trim();

    if (!message) return;

    messages.innerHTML += `
        <div class="ai-message user">
            <strong>You</strong>
            <p>${escapeHTML(message)}</p>
        </div>
    `;

    input.value = "";

    messages.innerHTML += `
        <div class="ai-message">
            <strong>Chox AI</strong>
            <p>Thinking...</p>
        </div>
    `;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message
            })
        });

        if (!response.ok) {
            throw new Error("AI request failed");
        }

        const data = await response.json();

        const answer =
            data.answer ||
            data.output ||
            data.message ||
            "I couldn't generate a response.";

        const aiMessages =
            messages.querySelectorAll(".ai-message");

        const last =
            aiMessages[aiMessages.length - 1];

        if (last) {
            last.querySelector("p").textContent = answer;
        }

    } catch (error) {
        console.error(error);

        const aiMessages =
            messages.querySelectorAll(".ai-message");

        const last =
            aiMessages[aiMessages.length - 1];

        if (last) {
            last.querySelector("p").textContent =
                "Chox AI is currently unavailable.";
        }
    }

    messages.scrollTop = messages.scrollHeight;
}

/* -----------------------------
   SETTINGS
----------------------------- */

function openSettings() {
    const overlay =
        $("#settingsOverlay") ||
        $(".settings-overlay");

    if (overlay) {
        overlay.classList.add("active");
    }
}

function closeSettings() {
    const overlay =
        $("#settingsOverlay") ||
        $(".settings-overlay");

    if (overlay) {
        overlay.classList.remove("active");
    }
}

function loadSettings() {
    const saved =
        JSON.parse(
            localStorage.getItem("choxSettings") || "{}"
        );

    if (saved.accent) {
        document.documentElement.style
            .setProperty(
                "--accent",
                saved.accent
            );
    }

    if (saved.theme === "light") {
        document.body.classList.add("chox-light");
    }

    if (saved.theme === "dark") {
        document.body.classList.remove("chox-light");
    }
}

function saveSetting(name, value) {
    const settings =
        JSON.parse(
            localStorage.getItem("choxSettings") || "{}"
        );

    settings[name] = value;

    localStorage.setItem(
        "choxSettings",
        JSON.stringify(settings)
    );
}

function changeTheme(theme) {
    saveSetting("theme", theme);

    document.body.classList.toggle(
        "chox-light",
        theme === "light"
    );
}

function changeAccent(accent) {
    saveSetting("accent", accent);

    document.documentElement.style
        .setProperty("--accent", accent);
}

function changeQuickLinks(value) {
    saveSetting("quickLinks", value);
}

/* -----------------------------
   MENU
----------------------------- */

function openMenu() {
    const menu =
        $("#contextMenu") ||
        $("#browserMenu") ||
        $(".browser-menu");

    if (!menu) return;

    menu.classList.toggle("active");
}

document.addEventListener("click", event => {
    const menu =
        $("#contextMenu") ||
        $("#browserMenu") ||
        $(".browser-menu");

    if (
        menu &&
        !menu.contains(event.target) &&
        !event.target.closest(
            '[onclick="openMenu()"]'
        )
    ) {
        menu.classList.remove("active");
    }
});

/* -----------------------------
   EXTERNAL LINKS
----------------------------- */

function openExternal(url) {
    if (!url) return;

    if (
        window.choxDesktop &&
        typeof window.choxDesktop.openExternal === "function"
    ) {
        window.choxDesktop.openExternal(url);
        return;
    }

    window.open(url, "_blank", "noopener,noreferrer");
}

/* -----------------------------
   YOUTUBE
----------------------------- */

function getYouTubeId(url) {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (parsed.hostname.includes("youtu.be")) {
            return parsed.pathname.substring(1);
        }

        if (
            parsed.hostname.includes("youtube.com")
        ) {
            return (
                parsed.searchParams.get("v") ||
                parsed.pathname.match(
                    /\/embed\/([^/]+)/
                )?.[1] ||
                null
            );
        }
    } catch {
        return null;
    }

    return null;
}

function openYouTubeVideo(url) {
    const id = getYouTubeId(url);

    if (!id) {
        openExternal(url);
        return;
    }

    const tab = getActiveTab();

    if (!tab) return;

    const page = getTabPage(tab.id);

    if (!page) return;

    tab.type = "video";
    tab.url = url;
    tab.title = "Video";

    page.innerHTML = `
        <div class="video-player-page">

            <button
                class="video-back"
                onclick="goBack()">
                ← Back
            </button>

            <div class="video-player-wrapper">

                <iframe
                    src="https://www.youtube-nocookie.com/embed/${escapeAttribute(id)}"
                    allowfullscreen
                    referrerpolicy="strict-origin-when-cross-origin">
                </iframe>

            </div>

        </div>
    `;

    updateTabButton(tab);
    updateAddressBar();
}

/* -----------------------------
   KEYBOARD SHORTCUTS
----------------------------- */

document.addEventListener("keydown", event => {

    // Ctrl + L
    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "l"
    ) {
        event.preventDefault();

        const addressBar =
            $("#addressBar") ||
            $("#urlBar");

        if (addressBar) {
            addressBar.focus();
            addressBar.select();
        }
    }

    // Ctrl + T
    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "t"
    ) {
        event.preventDefault();
        createNewTab();
    }

    // Ctrl + W
    if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "w"
    ) {
        event.preventDefault();

        if (activeTabId) {
            closeTab(activeTabId);
        }
    }

    // Alt + Left
    if (
        event.altKey &&
        event.key === "ArrowLeft"
    ) {
        event.preventDefault();
        goBack();
    }

    // Alt + Right
    if (
        event.altKey &&
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
        goForward();
    }

});

/* -----------------------------
   HELPERS
----------------------------- */

function getTabPage(tabId) {
    return document.querySelector(
        `#tab-page-${tabId}`
    );
}

function looksLikeURL(value) {
    return (
        /^https?:\/\//i.test(value) ||
        /^www\./i.test(value) ||
        /^[a-z0-9-]+\.[a-z]{2,}/i.test(value)
    );
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
    return escapeHTML(value)
        .replace(/`/g, "&#096;");
}

/* -----------------------------
   GLOBAL EXPORTS
----------------------------- */

window.createNewTab = createNewTab;
window.switchTab = switchTab;
window.closeTab = closeTab;

window.goBack = goBack;
window.goForward = goForward;
window.goHome = goHome;
window.reloadPage = reloadPage;

window.openAddress = openAddress;
window.performSearch = performSearch;

window.openChoxVideoPage = openChoxVideoPage;
window.searchChoxVideo = searchChoxVideo;
window.openYouTubeVideo = openYouTubeVideo;

window.openBookmarks = openBookmarks;
window.toggleBookmark = toggleBookmark;
window.deleteBookmark = deleteBookmark;

window.openHistory = openHistory;
window.clearHistory = clearHistory;

window.openChoxAI = openChoxAI;
window.sendAIMessage = sendAIMessage;

window.openSettings = openSettings;
window.closeSettings = closeSettings;
window.loadSettings = loadSettings;
window.saveSetting = saveSetting;
window.changeTheme = changeTheme;
window.changeAccent = changeAccent;
window.changeQuickLinks = changeQuickLinks;

window.openMenu = openMenu;
window.openExternal = openExternal;

window.navigateFromResult = navigateFromResult;
