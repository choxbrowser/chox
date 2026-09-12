const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get("/api/search", async (req, res) => {
  const query = String(req.query.q || "").trim();

  if (!query) {
    return res.json({
      results: []
    });
  }

  if (!process.env.BRAVE_API_KEY) {
    return res.status(500).json({
      error: "BRAVE_API_KEY is not configured."
    });
  }

  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "Accept": "application/json",
          "X-Subscription-Token": process.env.BRAVE_API_KEY
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Brave Search returned ${response.status}`);
    }

    const data = await response.json();

    const results = (data.web?.results || []).map(result => ({
      title: result.title || "",
      url: result.url || "",
      description: result.description || ""
    }));

    res.json({ results });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Search failed."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Chox search server running on http://localhost:${PORT}`);
});
