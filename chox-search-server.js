// chox-search-server.js
// Chox search backend using SearXNG
//
// Set SEARXNG_URL to the SearXNG instance you want to use.
// Example:
//   SEARXNG_URL=https://your-searxng-instance.example
//
// Chox frontend continues using:
//   GET /api/search?q=your+search

const express = require("express");
const path = require("path");

const app = express();

const PORT = process.env.PORT || 3000;

// You can change this to your own SearXNG instance later.
const SEARXNG_URL =
    process.env.SEARXNG_URL || "https://searxng.example.com";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the Chox website
app.use(express.static(__dirname));

app.get("/api/search", async (req, res) => {
    try {
        const query = String(req.query.q || "").trim();

        if (!query) {
            return res.status(400).json({
                error: "Missing search query",
                results: []
            });
        }

        const searchUrl = new URL(
            "/search",
            SEARXNG_URL.endsWith("/")
                ? SEARXNG_URL
                : SEARXNG_URL + "/"
        );

        searchUrl.searchParams.set("q", query);
        searchUrl.searchParams.set("format", "json");
        searchUrl.searchParams.set("language", "en");
        searchUrl.searchParams.set("safesearch", "1");
        searchUrl.searchParams.set("pageno", "1");

        const response = await fetch(searchUrl);

        if (!response.ok) {
            throw new Error(
                `SearXNG returned HTTP ${response.status}`
            );
        }

        const data = await response.json();

        const results = Array.isArray(data.results)
            ? data.results.map((item) => ({
                  title: cleanText(item.title || "Untitled"),
                  url: item.url || "",
                  snippet: cleanText(
                      item.content ||
                      item.description ||
                      ""
                  ),
                  thumbnail:
                      item.thumbnail ||
                      item.img_src ||
                      "",
                  engine:
                      item.engine ||
                      "SearXNG"
              }))
            : [];

        res.json({
            query,
            results,
            number_of_results: results.length,
            source: "SearXNG"
        });

    } catch (error) {
        console.error("Chox search error:", error);

        res.status(500).json({
            error: "Search service unavailable",
            message: error.message,
            results: []
        });
    }
});

function cleanText(value) {
    return String(value)
        .replace(/<[^>]*>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

// Health check
app.get("/api/health", (req, res) => {
    res.json({
        ok: true,
        searchProvider: "SearXNG",
        searxng: SEARXNG_URL
    });
});

app.listen(PORT, () => {
    console.log("");
    console.log("=================================");
    console.log("           CHOX SEARCH");
    console.log("=================================");
    console.log(`Chox:     http://localhost:${PORT}`);
    console.log(`Provider: ${SEARXNG_URL}`);
    console.log("=================================");
    console.log("");
});
