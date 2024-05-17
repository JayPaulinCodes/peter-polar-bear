const http = require("http");

async function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function run() {
    try {
        console.log("[STARTUP]: Starting pterodactyl restart script for new release");
        const apiKey = process.argv[2] ?? null;
        const panelId = "bc61b0c5";

        if (apiKey == null) { return console.log("[FAILED]: Failed restart panel, no api key provided"); }

        await sleep(10000);
        const result = await fetch(`https://panel.devjacob.com/api/client/servers/${panelId}/power`, {
            method: "POST",
            headers: {
                accept: "application/json",
                "content-type": "application/json",
                authorization: `Bearer ${apiKey}`
            },
            body: JSON.stringify({ signal: "restart" })
        });

        console.log("[SUCCESS]: Successfully restarted panel");
    } catch (err) {
        console.log(`[FAILED]: Failed to restart panel, encountered the following error, ${err.stack}`);
    }
}

run();