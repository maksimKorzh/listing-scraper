var highlighted = null;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == "status") scraperStatus();
    else if (message.action == "create") createScraper();
    else if (message.action == "remove") removeScraper();
    else if (message.action == "start") startScraper();
    else if (message.action == "stop") stopScraper();
    else if (message.action == "download") downloadData();
    else if (message.action == "links") selectLinks();
    else if (message.action == "pagination") selectPagination();
    else if (message.action == "select") selectElements();
    else if (message.action == "deselect") removeElements();
    else if (message.action == "done") stopSelecting();
    else if (message.action == "preview") previewData();
});

function scraperStatus() {
    if (scraperExists()) alert(`Scraper is ${(scraperIsRunning() ? "" : "not")} running`)
    else alert("Scraper doesn't exist");
}

function createScraper() {
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

function removeScraper() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else {
        localStorage.removeItem("scraper");
        alert("Scraper storage has been removed");
    }
}

function startScraper() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else if (scraperIsRunning()) alert("Scraper is already running");
    else {
        let scraper = getScraper();
        scraper.running = true;
        setScraper(scraper);
        alert("Scraper has been started");
        location.reload();
    }
}

function stopScraper() {
    if (!scraperExists()) alert("Scraper storage doesn't exist");
    else if (!scraperIsRunning()) alert("Scraper has already been stopped");
    else {
        let scraper = getScraper();
        scraper.running = false;
        setScraper(scraper);
        alert("Scraper has been stopped");
    }
}

function downloadData() {
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

function selectLinks() {
    if (scraperIsRunning()) {
        alert("Cannot select links while scraper is running");
        return;
    } else if (scraperExists()) {
        stopSelecting();
        let scraper = getScraper();
        let cardUrlSelector = "";
        while (cardUrlSelector == "")
            try {
                cardUrlSelector = prompt(
                    "Paste card URL selector:\n\n" +
                    "1. Open DevTools\n" + 
                    "2. Rightclick listing card\n" +
                    "3. Find <a href=\"path/to/listing.html\">\n" +
                    "4. Rightclick element, select Copy -> Copy selector\n" +
                    "5. Paste selector below\n\n" +
                    "e.g. body > div > div:nth-child(1) > span:nth-child(2) > a"
                ).replace(/:nth-child\(\d+\)/g, "");
            } catch(e) { return; }
        let listingUrls = extractListingUrls(cardUrlSelector);
        if (confirm("Do you confirm extracted links?\n\n" + listingUrls)) {
            scraper.cardUrlSelector = cardUrlSelector;
            setScraper(scraper);
        }
    } else alert("Scraper doesn't exist");
}

function selectPagination() {
    if (scraperIsRunning()) {
        alert("Cannot select pagination while scraper is running");
        return;
    } else if (scraperExists()) {
        stopSelecting();
        let scraper = getScraper();
        let nextPageSelector = "";
        while (nextPageSelector == "") nextPageSelector = prompt(
            "Paste next page selector:\n\n" +
            "1. Open DevTools\n" + 
            "2. Rightclick next page button" +
            "3. Find <a href=\"path/to/next_page.html\"> or <button>Next</button>\n" +
            "4. Rightclick element, select Copy -> Copy selector\n" +
            "5. Paste selector below\n\n" +
            "e.g. body > div > div:nth-child(2) > div.col-md-8 > nav > ul > li > a"
        );
        let nextPage = extractNextPage(nextPageSelector);
        if (confirm("Do you confirm next page?\n\n" + nextPage)) {
            scraper.nextPageSelector = nextPageSelector;
            setScraper(scraper);
        }
    } else alert("Scraper doesn't exist");
}

function selectElements() {
    if (scraperIsRunning()) {
        alert("Cannot select elements while scraper is running");
        return;
    } else if (scraperExists()) {
        stopSelecting();
        document.addEventListener("mouseover", mouseover, true);
        document.addEventListener("click", clickAddSelector, true);
        alert("Select elements you want to extract text from");
    } else alert("Scraper doesn't exist");
}

function removeElements() {
    if (scraperIsRunning()) {
        alert("Cannot select elements while scraper is running");
        return;
    } else if (scraperExists()) {
        alert("Remove elements you don't need");
        stopSelecting();
        document.addEventListener("mouseover", mouseover, true);
        document.addEventListener("click", clickRemoveSelector, true);
    } else alert("Scraper doesn't exist");
}

function previewData() {
    if (scraperIsRunning()) {
        alert("Cannot select elements while scraper is running");
        return;
    } else if (scraperExists()) {
        let scraper = getScraper();
        let message = "";
        let listingUrls = extractListingUrls(scraper.cardUrlSelector);
        let nextPage = extractNextPage(scraper.nextPageSelector);
        let data = JSON.stringify(extractData(), null, 4);
        if (listingUrls != "") message += "Listing URLs:\n\n" + listingUrls + "\n\n";
        if (nextPage != "" && nextPage != null) message += "Next Page:\n\n" + nextPage + "\n\n";
        if (data != "{}") message += "Extracted data:\n\n" + data;
        alert(message);
    } else alert("Scraper doesn't exist");
}

function stopSelecting() {
    document.removeEventListener("mouseover", mouseover, true);
    document.removeEventListener("click", clickAddSelector, true);
    document.removeEventListener("click", clickRemoveSelector, true);
}

function mouseover(e) {
    if (highlighted) {
        if (highlighted.style.outline == "green solid 2px") {
            highlighted = null;
            return;
        } highlighted.style.outline = "";
    }
    if (e.target.style.outline != "green solid 2px") {
        highlighted = e.target;
        highlighted.style.outline = "2px solid red";
    }
}

function clickAddSelector(e) {
    e.preventDefault();
    e.stopPropagation();
    let scraper = getScraper();
    let selector = getCssSelector(e.target);
    if (e.target.style.outline == "green solid 2px") {
        alert("You have already selected this element");
        return;
    }
    e.target.style.outline = "2px solid green";
    let name = prompt("How would you call this selector?");
    try {
        while (name == "" || scraper.selectors[name] != undefined) {
            alert(`Invalid name "${name}"`);
            name = prompt("How would you call this selector?");
        }
    } catch(e) {}
    scraper.selectors[name] = selector;
    setScraper(scraper);
}

function clickRemoveSelector(e) {
    if (e.target.style.outline == "green solid 2px") {
        let scraper = getScraper();
        let selector = getCssSelector(e.target);
        for (let key of Object.keys(scraper.selectors)) {
            if (scraper.selectors[key] == selector) {
                delete scraper.selectors[key];
                alert(`Selector "${key}" has been removed`);
            }
        } e.target.style.outline = "";
        setScraper(scraper);
    } else { alert("There is no such selector"); }
}