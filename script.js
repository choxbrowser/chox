"use strict";

/* =========================================================
   CHOX - MAIN JAVASCRIPT
   ========================================================= */

let tabs = [];
let activeTabId = null;
let nextTabId = 1;

const CHOX_HOME = "chox://home";

/* =========================================================
   STARTUP
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setupChox();
});

function setupChox() {
    loadSettings();

    // If the HTML already created a tab, use it.
    const existingTab = document.querySelector(".browser-tab");

    if (existingTab) {
        const id =
            existingTab.dataset.tabId ||
            existingTab.id?.replace("tab-", "") ||
            String(nextTabId++);

        activeTabId = String(id);

        tabs.push({
            id: String(id),
            title: "New Tab",
            url: CHOX_HOME,
            type: "home",
            history: [CHOX_HOME],
            historyIndex: 0
        });

        const page = document.querySelector(".tab-page");

        if (page) {
            page.dataset.tabId = String(id);
            page.id = `tab-page-${id}`;
        }

        existingTab.classList.add("active");

        if (page) {
            page.classList.add("active");
        }
    } else {
        createNewTab();
    }

    setupSearchInputs();
    setupKeyboardShortcuts();
}

/* =========================================================
   SEARCH
   ========================================================= */

function setupSearchInputs() {
    document.querySelectorAll("input").forEach(input => {
        if (
            input.id?.toLowerCase().includes("search") ||
            input.classList.contains("search-input") ||
            input.classList.contains("search-box")
        ) {
            input.addEventListener("keydown", event => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    performSearch();
                }
            });
        }
    });
}

function performSearch(tabId = activeTabId, suppliedQuery = null) {
    let query = suppliedQuery;

    if (!query) {
        const tabInput =
            document.querySelector(`#searchInput-${tabId}`);

        const normalInput =
            document.querySelector("#searchInput");

        const formInput =
            document.querySelector("#searchForm input");

        query =
            tabInput?.value?.trim() ||
            normalInput?.value?.trim() ||
            formInput?.value?.trim();
    }

    if (!query) {
        const address = document.querySelector("#addressBar");

        if (address && address.value.trim()) {
            query = address.value.trim();
        }
    }

    if (!query) return;

    const tab = getTab(tabId);

    const searchURL =
        "results.html?q=" +
        encodeURIComponent(query);

    if (tab) {
        tab.url = searchURL;
        tab.title = `Search: ${query}`;
        tab.type = "search";

        addHistory(tab, searchURL);

        renderSearchPage(tab, query);
        updateEverything();
    } else {
        window.location.href = searchURL;
    }
}

/* =========================================================
   SEARCH FORM
   ========================================================= */

document.addEventListener("submit", event => {
    const form = event.target;

    if (
        form.id === "searchForm" ||
        form.querySelector('input[type="search"]') ||
        form.querySelector("#searchInput")
    ) {
        event.preventDefault();

        const input =
            form.querySelector("#searchInput") ||
            form.querySelector('input[type="search"]') ||
            form.querySelector("input");

        if (input?.value.trim()) {
            performSearch(activeTabId, input.value.trim());
        }
    }
});

/* =========================================================
   TABS
   ========================================================= */

function createNewTab() {
    const id = String(nextTabId++);

    const tab = {
        id,
        title: "New Tab",
        url: CHOX_HOME,
        type: "home",
        history: [CHOX_HOME],
        historyIndex: 0
    };

    tabs.push(tab);

    const tabBar =
        document.querySelector("#tabBar") ||
        document.querySelector(".tab-bar");

    const pages =
        document.querySelector("#tabPages") ||
        document.querySelector(".tab-pages");

    if (tabBar) {
        const button = document.createElement("div");

        button.className = "browser-tab";
        button.dataset.tabId = id;

        button.innerHTML = `
            <span class="tab-title">New Tab</span>
            <button class="tab-close">×</button>
        `;

        button.addEventListener("click", event => {
            if (
                !event.target.classList.contains("tab-close")
            ) {
                switchTab(id);
            }
        });

        button
            .querySelector(".tab-close")
            .addEventListener("click", event => {
                event.stopPropagation();
                closeTab(id);
            });

        const newButton =
            tabBar.querySelector(".new-tab");

        if (newButton) {
            tabBar.insertBefore(button, newButton);
        } else {
            tabBar.appendChild(button);
        }
    }

    if (pages) {
        const page = document.createElement("div");

        page.className = "tab-page";
        page.id = `tab-page-${id}`;
        page.dataset.tabId = id;

        pages.appendChild(page);
    }

    switchTab(id);
    renderHome(tab);

    return id;
}

function switchTab(id) {
    const tab = getTab(id);

    if (!tab) return;

    activeTabId = String(id);

    document.querySelectorAll(".browser-tab").forEach(tabButton => {
        tabButton.classList.toggle(
            "active",
            String(tabButton.dataset.tabId) === String(id)
        );
    });

    document.querySelectorAll(".tab-page").forEach(page => {
        page.classList.toggle(
            "active",
            String(page.dataset.tabId) === String(id)
        );
    });

    updateEverything();
}

function closeTab(id) {
    const index = tabs.findIndex(
        tab => String(tab.id) === String(id)
    );

    if (index === -1) return;

    document
        .querySelector(
            `.browser-tab[data-tab-id="${id}"]`
        )
        ?.remove();

    document
        .querySelector(`#tab-page-${id}`)
        ?.remove();

    tabs.splice(index, 1);

    if (tabs.length === 0) {
        createNewTab();
        return;
    }

    if (String(activeTabId) === String(id)) {
        const next =
            tabs[index] ||
            tabs[index - 1] ||
            tabs[0];

        switchTab(next.id);
    }
}

/* =========================================================
   HOME
   ========================================================= */

function goHome() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.url = CHOX_HOME;
    tab.type = "home";
    tab.title = "New Tab";

    addHistory(tab, CHOX_HOME);

    renderHome(tab);
    updateEverything();
}

function renderHome(tab) {
    const page = getPage(tab.id);

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
                >

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

/* =========================================================
   ADDRESS BAR
   ========================================================= */

function openAddress() {
    const address =
        document.querySelector("#addressBar") ||
        document.querySelector("#urlBar");

    if (!address) return;

    let value = address.value.trim();

    if (!value) return;

    if (
        value === "chox://" ||
        value === "chox://home"
    ) {
        goHome();
        return;
    }

    if (value === "chox://video") {
        openChoxVideoPage(activeTabId);
        return;
    }

    if (
        !value.includes(".") &&
        !value.startsWith("http://") &&
        !value.startsWith("https://")
    ) {
        performSearch(activeTabId, value);
        return;
    }

    if (!/^https?:\/\//i.test(value)) {
        value = "https://" + value;
    }

    navigateTo(value);
}

/* =========================================================
   WEBSITE NAVIGATION
   ========================================================= */

function navigateTo(url) {
    const tab = getActiveTab();

    if (!tab) return;

    tab.url = url;
    tab.type = "website";

    try {
        tab.title = new URL(url).hostname;
    } catch {
        tab.title = url;
    }

    addHistory(tab, url);

    renderWebsite(tab);
    updateEverything();
}

function renderWebsite(tab) {
    const page = getPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="website-page">

            <div class="website-loading">
                Loading ${escapeHTML(tab.url)}...
            </div>

            <iframe
                class="website-frame"
                src="${escapeAttribute(tab.url)}"
                allow="fullscreen"
                referrerpolicy="strict-origin-when-cross-origin">
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
    }
}

/* =========================================================
   BACK / FORWARD / RELOAD
   ========================================================= */

function addHistory(tab, url) {
    if (!tab) return;

    tab.history =
        tab.history.slice(
            0,
            tab.historyIndex + 1
        );

    if (
        tab.history[tab.history.length - 1] !== url
    ) {
        tab.history.push(url);
    }

    tab.historyIndex =
        tab.history.length - 1;

    if (
        !url.startsWith("chox://")
    ) {
        saveBrowsingHistory(
            tab.title,
            url
        );
    }
}

function goBack() {
    const tab = getActiveTab();

    if (!tab || tab.historyIndex <= 0) {
        return;
    }

    tab.historyIndex--;

    tab.url =
        tab.history[tab.historyIndex];

    loadCurrentTab(tab);
}

function goForward() {
    const tab = getActiveTab();

    if (
        !tab ||
        tab.historyIndex >=
            tab.history.length - 1
    ) {
        return;
    }

    tab.historyIndex++;

    tab.url =
        tab.history[tab.historyIndex];

    loadCurrentTab(tab);
}

function reloadPage() {
    const tab = getActiveTab();

    if (!tab) return;

    loadCurrentTab(tab);
}

function loadCurrentTab(tab) {
    if (tab.url === CHOX_HOME) {
        tab.type = "home";
        renderHome(tab);
    }

    else if (tab.url === "chox://video") {
        openChoxVideoPage(tab.id);
    }

    else if (tab.url === "chox://bookmarks") {
        openBookmarks();
    }

    else if (tab.url === "chox://history") {
        openHistory();
    }

    else if (tab.url === "chox://ai") {
        openChoxAI();
    }

    else if (
        tab.url.startsWith("results.html")
    ) {
        const params =
            new URLSearchParams(
                tab.url.split("?")[1] || ""
            );

        renderSearchPage(
            tab,
            params.get("q") || ""
        );
    }

    else {
        tab.type = "website";
        renderWebsite(tab);
    }

    updateEverything();
}

/* =========================================================
   SEARCH RESULTS
   ========================================================= */

function renderSearchPage(tab, query) {
    const page = getPage(tab.id);

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
                    >

                    <button
                        onclick="
                            performSearch(
                                '${tab.id}',
                                document.getElementById(
                                    'resultsSearch-${tab.id}'
                                ).value
                            )
                        ">
                        🔍
                    </button>

                </div>

            </div>

            <div
                class="results-container"
                id="resultsContainer-${tab.id}">

                <div class="results-loading">
                    Searching...
                </div>

            </div>

        </div>
    `;

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
            throw new Error("Search failed");
        }

        const data = await response.json();

        const results =
            data.results ||
            data.web ||
            data.items ||
            [];

        if (!results.length) {
            container.innerHTML = `
                <div class="results-empty">
                    <h2>No results found</h2>
                    <p>Try another search.</p>
                </div>
            `;

            return;
        }

        container.innerHTML = results
            .map(result => {
                const title =
                    result.title ||
                    result.name ||
                    "Untitled";

                const url =
                    result.url ||
                    result.link ||
                    "#";

                const description =
                    result.description ||
                    result.snippet ||
                    "";

                return `
                    <div class="search-result">

                        <div class="result-url">
                            ${escapeHTML(url)}
                        </div>

                        <a
                            href="#"
                            class="result-title"
                            data-url="${escapeAttribute(url)}">
                            ${escapeHTML(title)}
                        </a>

                        <p class="result-description">
                            ${escapeHTML(description)}
                        </p>

                    </div>
                `;
            })
            .join("");

        container
            .querySelectorAll("[data-url]")
            .forEach(link => {
                link.addEventListener("click", event => {
                    event.preventDefault();

                    navigateTo(
                        link.dataset.url
                    );
                });
            });

    } catch (error) {
        console.error(
            "Chox search error:",
            error
        );

        container.innerHTML = `
            <div class="results-error">

                <h2>Search isn't available</h2>

                <p>
                    Make sure the Chox search server
                    is running.
                </p>

                <button onclick="reloadPage()">
                    Try Again
                </button>

            </div>
        `;
    }
}

/* =========================================================
   CHOX VIDEO
   ========================================================= */

function openChoxVideoPage(tabId = activeTabId) {
    const tab = getTab(tabId);

    if (!tab) return;

    tab.type = "chox-video";
    tab.url = "chox://video";
    tab.title = "Chox Video";

    switchTab(tab.id);

    const page = getPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="chox-video-page">

            <div class="video-sidebar">

                <div class="video-brand">
                    <span>CH</span>
                    <strong>CHOX VIDEO</strong>
                </div>

                <button
                    onclick="openChoxVideoPage('${tab.id}')">
                    🏠 Home
                </button>

                <button
                    onclick="searchChoxVideo('${tab.id}')">
                    🔍 Search
                </button>

                <button
                    onclick="openHistory()">
                    ◷ History
                </button>

                <button
                    onclick="openBookmarks()">
                    ★ Favorites
                </button>

            </div>

            <div class="video-main">

                <div class="video-header">

                    <h1>Chox Video</h1>

                    <div class="video-search">

                        <input
                            id="videoSearch-${tab.id}"
                            placeholder="Search videos..."
                        >

                        <button
                            onclick="
                                searchChoxVideo('${tab.id}')
                            ">
                            🔍
                        </button>

                    </div>

                </div>

                <div class="video-empty">

                    <div class="video-big-icon">
                        ▶
                    </div>

                    <h2>Chox Video</h2>

                    <p>
                        Search for videos using Chox.
                    </p>

                </div>

            </div>

        </div>
    `;

    const input = document.querySelector(
        `#videoSearch-${tab.id}`
    );

    if (input) {
        input.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                searchChoxVideo(tab.id);
            }
        });
    }

    updateEverything();
}

function searchChoxVideo(tabId) {
    const input = document.querySelector(
        `#videoSearch-${tabId}`
    );

    if (!input) return;

    const query = input.value.trim();

    if (!query) return;

    performSearch(
        tabId,
        query + " site:youtube.com/watch"
    );
}

/* =========================================================
   BOOKMARKS
   ========================================================= */

function getBookmarks() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "choxBookmarks"
            ) || "[]"
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

    const index = bookmarks.findIndex(
        item => item.url === tab.url
    );

    if (index >= 0) {
        bookmarks.splice(index, 1);
    } else {
        bookmarks.unshift({
            title: tab.title,
            url: tab.url,
            time: Date.now()
        });
    }

    saveBookmarks(bookmarks);
}

function openBookmarks() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "bookmarks";
    tab.url = "chox://bookmarks";
    tab.title = "Bookmarks";

    const page = getPage(tab.id);

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
                        <p>
                            Saved pages will appear here.
                        </p>
                    </div>
                `
                : bookmarks.map(
                    (bookmark, index) => `
                        <div class="bookmark-item">

                            <button
                                onclick="
                                    navigateTo(
                                        '${escapeAttribute(
                                            bookmark.url
                                        )}'
                                    )
                                ">

                                <strong>
                                    ${escapeHTML(
                                        bookmark.title
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        bookmark.url
                                    )}
                                </small>

                            </button>

                            <button
                                onclick="
                                    deleteBookmark(${index})
                                ">
                                ×
                            </button>

                        </div>
                    `
                ).join("")
            }

        </div>
    `;

    updateEverything();
}

function deleteBookmark(index) {
    const bookmarks = getBookmarks();

    bookmarks.splice(index, 1);

    saveBookmarks(bookmarks);

    openBookmarks();
}

/* =========================================================
   HISTORY
   ========================================================= */

function getBrowsingHistory() {
    try {
        return JSON.parse(
            localStorage.getItem(
                "choxHistory"
            ) || "[]"
        );
    } catch {
        return [];
    }
}

function saveBrowsingHistory(title, url) {
    if (
        !url ||
        url.startsWith("chox://")
    ) {
        return;
    }

    let history =
        getBrowsingHistory();

    history = history.filter(
        item => item.url !== url
    );

    history.unshift({
        title: title || url,
        url,
        time: Date.now()
    });

    history =
        history.slice(0, 100);

    localStorage.setItem(
        "choxHistory",
        JSON.stringify(history)
    );
}

function openHistory() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "history";
    tab.url = "chox://history";
    tab.title = "History";

    const page = getPage(tab.id);

    if (!page) return;

    const history =
        getBrowsingHistory();

    page.innerHTML = `
        <div class="internal-page">

            <div class="internal-header">

                <span class="internal-icon">
                    ◷
                </span>

                <h1>History</h1>

                <button
                    onclick="clearHistory()">
                    Clear
                </button>

            </div>

            ${
                history.length === 0
                ? `
                    <div class="internal-empty">
                        <h2>No history yet</h2>
                    </div>
                `
                : history.map(
                    item => `
                        <button
                            class="history-item"
                            onclick="
                                navigateTo(
                                    '${escapeAttribute(
                                        item.url
                                    )}'
                                )
                            ">

                            <strong>
                                ${escapeHTML(
                                    item.title
                                )}
                            </strong>

                            <small>
                                ${escapeHTML(
                                    item.url
                                )}
                            </small>

                        </button>
                    `
                ).join("")
            }

        </div>
    `;

    updateEverything();
}

function clearHistory() {
    localStorage.removeItem(
        "choxHistory"
    );

    openHistory();
}

/* =========================================================
   CHOX AI
   ========================================================= */

function openChoxAI() {
    const tab = getActiveTab();

    if (!tab) return;

    tab.type = "ai";
    tab.url = "chox://ai";
    tab.title = "Chox AI";

    const page = getPage(tab.id);

    if (!page) return;

    page.innerHTML = `
        <div class="ai-page">

            <div class="ai-header">

                <div class="ai-logo">
                    ✦
                </div>

                <div>
                    <h1>Chox AI</h1>
                    <p>Your AI assistant</p>
                </div>

            </div>

            <div
                class="ai-messages"
                id="aiMessages-${tab.id}">

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
                >

                <button
                    onclick="
                        sendAIMessage('${tab.id}')
                    ">
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

    updateEverything();
}

async function sendAIMessage(tabId) {
    const input = document.querySelector(
        `#aiInput-${tabId}`
    );

    const messages = document.querySelector(
        `#aiMessages-${tabId}`
    );

    if (!input || !messages) return;

    const message =
        input.value.trim();

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
        const response =
            await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json"
                },
                body: JSON.stringify({
                    message
                })
            });

        if (!response.ok) {
            throw new Error(
                "AI request failed"
            );
        }

        const data =
            await response.json();

        const answer =
            data.answer ||
            data.output ||
            data.message ||
            "No response.";

        const aiMessages =
            messages.querySelectorAll(
                ".ai-message"
            );

        const last =
            aiMessages[
                aiMessages.length - 1
            ];

        if (last) {
            last.querySelector(
                "p"
            ).textContent = answer;
        }

    } catch (error) {
        console.error(error);

        const aiMessages =
            messages.querySelectorAll(
                ".ai-message"
            );

        const last =
            aiMessages[
                aiMessages.length - 1
            ];

        if (last) {
            last.querySelector(
                "p"
            ).textContent =
                "Chox AI is unavailable right now.";
        }
    }

    messages.scrollTop =
        messages.scrollHeight;
}

/* =========================================================
   SETTINGS
   ========================================================= */

function openSettings() {
    const overlay =
        document.querySelector(
            "#settingsOverlay"
        ) ||
        document.querySelector(
            ".settings-overlay"
        );

    if (overlay) {
        overlay.classList.add("active");
        overlay.style.display = "flex";
    }
}

function closeSettings() {
    const overlay =
        document.querySelector(
            "#settingsOverlay"
        ) ||
        document.querySelector(
            ".settings-overlay"
        );

    if (overlay) {
        overlay.classList.remove("active");
        overlay.style.display = "none";
    }
}

function loadSettings() {
    try {
        const settings =
            JSON.parse(
                localStorage.getItem(
                    "choxSettings"
                ) || "{}"
            );

        if (settings.theme === "light") {
            document.body.classList.add(
                "chox-light"
            );
        }

        if (settings.theme === "dark") {
            document.body.classList.remove(
                "chox-light"
            );
        }

        if (settings.accent) {
            document.documentElement.style
                .setProperty(
                    "--accent",
                    settings.accent
                );
        }

    } catch (error) {
        console.error(
            "Settings error:",
            error
        );
    }
}

function saveSetting(name, value) {
    let settings = {};

    try {
        settings =
            JSON.parse(
                localStorage.getItem(
                    "choxSettings"
                ) || "{}"
            );
    } catch {}

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
        .setProperty(
            "--accent",
            accent
        );
}

function changeQuickLinks(value) {
    saveSetting(
        "quickLinks",
        value
    );
}

/* =========================================================
   MENU
   ========================================================= */

function openMenu() {
    const menu =
        document.querySelector(
            "#contextMenu"
        ) ||
        document.querySelector(
            ".browser-menu"
        );

    if (!menu) return;

    menu.classList.toggle(
        "active"
    );
}

/* =========================================================
   UPDATE UI
   ========================================================= */

function updateEverything() {
    const tab = getActiveTab();

    if (!tab) return;

    updateAddressBar();
    updateTabTitle();
    updateNavigationButtons();
}

function updateAddressBar() {
    const tab = getActiveTab();

    if (!tab) return;

    const address =
        document.querySelector(
            "#addressBar"
        ) ||
        document.querySelector(
            "#urlBar"
        );

    if (address) {
        address.value = tab.url;
    }
}

function updateTabTitle() {
    const tab = getActiveTab();

    if (!tab) return;

    const button =
        document.querySelector(
            `.browser-tab[data-tab-id="${tab.id}"]`
        );

    if (!button) return;

    const title =
        button.querySelector(
            ".tab-title"
        );

    if (title) {
        title.textContent =
            tab.title;
    }
}

function updateNavigationButtons() {
    const tab = getActiveTab();

    if (!tab) return;

    const back =
        document.querySelector(
            "#backButton"
        );

    const forward =
        document.querySelector(
            "#forwardButton"
        );

    if (back) {
        back.disabled =
            tab.historyIndex <= 0;
    }

    if (forward) {
        forward.disabled =
            tab.historyIndex >=
            tab.history.length - 1;
    }
}

/* =========================================================
   HELPERS
   ========================================================= */

function getTab(id) {
    return tabs.find(
        tab =>
            String(tab.id) ===
            String(id)
    );
}

function getActiveTab() {
    return getTab(activeTabId);
}

function getPage(id) {
    return document.querySelector(
        `#tab-page-${id}`
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

/* =========================================================
   KEYBOARD SHORTCUTS
   ========================================================= */

function setupKeyboardShortcuts() {
    document.addEventListener(
        "keydown",
        event => {

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "l"
            ) {
                event.preventDefault();

                const address =
                    document.querySelector(
                        "#addressBar"
                    );

                if (address) {
                    address.focus();
                    address.select();
                }
            }

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "t"
            ) {
                event.preventDefault();
                createNewTab();
            }

            if (
                (event.ctrlKey ||
                    event.metaKey) &&
                event.key.toLowerCase() === "w"
            ) {
                event.preventDefault();

                if (activeTabId) {
                    closeTab(activeTabId);
                }
            }

            if (
                event.altKey &&
                event.key === "ArrowLeft"
            ) {
                event.preventDefault();
                goBack();
            }

            if (
                event.altKey &&
                event.key === "ArrowRight"
            ) {
                event.preventDefault();
                goForward();
            }
        }
    );
}

/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML
   ========================================================= */

window.createNewTab = createNewTab;
window.switchTab = switchTab;
window.closeTab = closeTab;

window.goBack = goBack;
window.goForward = goForward;
window.goHome = goHome;
window.reloadPage = reloadPage;

window.openAddress = openAddress;
window.performSearch = performSearch;

window.openChoxVideoPage =
    openChoxVideoPage;

window.searchChoxVideo =
    searchChoxVideo;

window.openBookmarks =
    openBookmarks;

window.toggleBookmark =
    toggleBookmark;

window.deleteBookmark =
    deleteBookmark;

window.openHistory =
    openHistory;

window.clearHistory =
    clearHistory;

window.openChoxAI =
    openChoxAI;

window.sendAIMessage =
    sendAIMessage;

window.openSettings =
    openSettings;

window.closeSettings =
    closeSettings;

window.loadSettings =
    loadSettings;

window.saveSetting =
    saveSetting;

window.changeTheme =
    changeTheme;

window.changeAccent =
    changeAccent;

window.changeQuickLinks =
    changeQuickLinks;

window.openMenu =
    openMenu;

window.navigateTo =
    navigateTo;
