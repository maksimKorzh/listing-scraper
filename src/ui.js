function status() {
    if (scraperExists()) alert(`Scraper is ${(scraperIsRunning() ? "" : "not")} running`)
    else alert("Scraper doesn't exist");
}

function create() {
    if (!scraperExists()) {
        setScraper({
            "running": false,
            "cardUrlSelector": "",
            "nextPageSelector": "",
            "currentPage": "",
            "selectors": {},
            "listingUrls": [],
            "listingUrlIndex": -1,
            "data": []
        });
        alert("Scraper storage has been created");
    } else alert("Scraper storage already exists");
}

function remove() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else {
        localStorage.removeItem("scraper");
        alert("Scraper storage has been removed");
    }
}

function start() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else if (scraperIsRunning()) alert("Scraper is already running");
    else {
        let scraper = getScraper();
        scraper.running = true;
        setScraper(scraper);
        alert("Scraper has been started");
        //location.reload();
    }
}

function stop() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else if (!scraperIsRunning()) alert("Scraper has already been stopped");
    else {
        let scraper = getScraper();
        scraper.running = false;
        setScraper(scraper);
        alert("Scraper has been stopped");
    }
}

function download() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) alert("Scraper storage doesn't exist");
    else {
        let data = JSON.parse(localStorage.getItem("scraper")).data;
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "text/json;charset=utf-8" }
        );
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "listing-" + Date().toString().split(" ").slice(0, 5).join("-") + ".json";
        link.click();
        URL.revokeObjectURL(url);
    }
}