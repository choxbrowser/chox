/*
=========================================================
 CHOX SEARCH SERVER
=========================================================

This server:

Chox Browser
      ↓
/api/search
      ↓
SearXNG
      ↓
JSON results
      ↓
Chox Browser

=========================================================
*/

const express = require("express");

const cors = require("cors");

const app =
    express();

/*
=========================================================
 CONFIGURATION
=========================================================

Change SEARXNG_URL if you want to use another
SearXNG instance.

Do NOT add /search to the end.

Example:

https://searx.tiekoetter.com

=========================================================
*/

const SEARXNG_URL =
    process.env.SEARXNG_URL ||
    "https://searx.tiekoetter.com";

/*
=========================================================
 SERVER PORT
=========================================================
*/

const PORT =
    process.env.PORT || 3000;

/*
=========================================================
 MIDDLEWARE
=========================================================
*/

app.use(
    cors({
        origin: "*"
    })
);

app.use(
    express.json()
);

/*
=========================================================
 HEALTH CHECK
=========================================================
*/

app.get(
    "/",
    (req, res) => {

        res.json({

            ok: true,

            name: "Chox Search Server",

            searchEndpoint:
                "/api/search?q=example",

            searxng:
                SEARXNG_URL

        });

    }
);

/*
=========================================================
 SEARCH API
=========================================================
*/

app.get(
    "/api/search",
    async (req, res) => {

        try {

            const query =
                String(
                    req.query.q || ""
                ).trim();

            if (!query) {

                return res.status(400).json({

                    error:
                        "Missing search query.",

                    results: []

                });

            }

            /*
                Build SearXNG request.
            */

            const searchUrl =
                new URL(
                    "/search",
                    SEARXNG_URL
                );

            searchUrl.searchParams.set(
                "q",
                query
            );

            searchUrl.searchParams.set(
                "format",
                "json"
            );

            searchUrl.searchParams.set(
                "language",
                "all"
            );

            searchUrl.searchParams.set(
                "safesearch",
                "1"
            );

            console.log(
                "Searching:",
                query
            );

            /*
                Ask SearXNG for JSON.
            */

            const response =
                await fetch(
                    searchUrl,
                    {
                        method: "GET",

                        headers: {

                            "Accept":
                                "application/json",

                            "User-Agent":
                                "ChoxBrowser/1.0"

                        }

                    }
                );

            if (!response.ok) {

                const text =
                    await response.text();

                console.error(
                    "SearXNG error:",
                    response.status,
                    text.substring(0, 500)
                );

                return res.status(502).json({

                    error:
                        "SearXNG returned HTTP " +
                        response.status,

                    results: []

                });

            }

            const data =
                await response.json();

            /*
                Convert SearXNG results into
                a clean Chox format.
            */

            const results =
                Array.isArray(
                    data.results
                )
                    ? data.results
                    : [];

            const cleanResults =
                results
                    .filter(
                        item =>
                            item &&
                            item.url
                    )
                    .map(
                        item => ({

                            title:
                                item.title ||
                                "Untitled",

                            url:
                                item.url,

                            content:
                                item.content ||
                                "",

                            engine:
                                item.engine ||
                                "",

                            category:
                                item.category ||
                                ""

                        })
                    );

            res.json({

                query,

                number_of_results:
                    cleanResults.length,

                results:
                    cleanResults

            });

        } catch (error) {

            console.error(
                "Search server error:",
                error
            );

            res.status(500).json({

                error:
                    "Search server failed.",

                message:
                    error.message,

                results: []

            });

        }

    }
);

/*
=========================================================
 START SERVER
=========================================================
*/

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "===================================="
        );
        console.log(
            "        CHOX SEARCH SERVER"
        );
        console.log(
            "===================================="
        );
        console.log(
            "Server:"
        );
        console.log(
            `http://localhost:${PORT}`
        );
        console.log("");
        console.log(
            "SearXNG:"
        );
        console.log(
            SEARXNG_URL
        );
        console.log("");
        console.log(
            "Search endpoint:"
        );
        console.log(
            `http://localhost:${PORT}/api/search?q=test`
        );
        console.log(
            "===================================="
        );
        console.log("");

    }
);
