var highlighted = null;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == "status") scraperStatus();
    else if (message.action == "create") createScraper();
    else if (message.action == "remove") removeScraper();
    else if (message.action == "start") startScraper();
    else if (message.action == "stop") stopScraper();
    else if (message.action == "download") downloadData();
    else if (message.action == "clear") clearData();
    else if (message.action == "links") setListings();
    else if (message.action == "pagination") setPagination();
    else if (message.action == "select") selectElements();
    else if (message.action == "deselect") removeElements();
    else if (message.action == "done") stopSelecting();
    else if (message.action == "preview") previewData();
    else if (message.action == "save") saveScraper();
    else loadScraper(message.action);
});

function scraperStatus() {
    if (scraperExists()) alert(`Scraper is ${(scraperIsRunning() ? "" : "not")} running`)
    else alert("Scraper doesn't exist");
}

function createScraper() {
    if (scraperIsRunning()) {
        alert("Cannot create scraper while scraper is running");
        return;
    } else if (!scraperExists()) {
        setScraper({
            "running": false,
            "cardUrlSelector": "",
            "nextPageSelector": "",
            "currentPage": "",
            "selectors": {},
            "listingUrls": [],
            "listingUrlIndex": -1,
            "data": []
        }); alert("Scraper has been created");
    } else alert("Scraper already exists");
}

function removeScraper() {
    if (scraperIsRunning()) {
        alert("Cannot remove scraper while scraper is running");
        return;
    } else if (scraperExists()) {
        localStorage.removeItem("scraper");
        alert("Scraper has been removed");
    } else alert("Scraper doesn't exist");
}

function startScraper() {
    if (!scraperExists()) alert("Scraper doesn't exist");
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
    if (!scraperExists()) alert("Scraper doesn't exist");
    else if (!scraperIsRunning()) alert("Scraper has already been stopped");
    else {
        let scraper = getScraper();
        scraper.running = false;
        setScraper(scraper);
        alert("Scraper has been stopped");
    }
}

function downloadData() {
    if (scraperIsRunning()) {
        alert("Cannot download data while scraper is running");
        return;
    } else if (scraperExists()) {
        let data = getScraper().data;
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "text/json;charset=utf-8" }
        ); const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "listing-" + Date().toString().split(" ").slice(0, 5).join("-") + ".json";
        link.click();
        URL.revokeObjectURL(url);
    }
}

function clearData() {
     if (scraperIsRunning()) {
        alert("Cannot clear data while scraper is running");
        return;
    } else if (scraperExists()) {
        let scraper = getScraper();
        scraper.data = [];
        setScraper(scraper);
        alert("Scraper data has been cleared");
    }
}

function setListings() {
    if (scraperIsRunning()) {
        alert("Cannot set listings while scraper is running");
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

function setPagination() {
    if (scraperIsRunning()) {
        alert("Cannot set pagination while scraper is running");
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
        alert("Cannot remove elements while scraper is running");
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
        alert("Cannot preview data while scraper is running");
        return;
    } else if (scraperExists()) {
        try {
            let scraper = getScraper();
            let message = "";
            let listingUrls = extractListingUrls(scraper.cardUrlSelector);
            let nextPage = extractNextPage(scraper.nextPageSelector);
            let data = JSON.stringify(extractData(), null, 4);
            if (listingUrls != "") message += "Listing URLs:\n\n" + listingUrls + "\n\n";
            if (nextPage != "" && nextPage != null) message += "Next Page:\n\n" + nextPage + "\n\n";
            if (data != "{}") message += "Extracted data:\n\n" + data;
            alert(message);
        } catch(e) { alert("Nothing has been selected"); }
    } else alert("Scraper doesn't exist");
}

function loadScraper(scraper) {
    if (scraperIsRunning()) {
        alert("Cannot load scraper while scraper is running");
        return;
    } else {
        try {
            let newScraper = JSON.parse(scraper);
            setScraper(newScraper);
            alert("Scraper has been loaded");
        } catch(e) { alert("Failed loading scraper"); }
    }
}

function saveScraper() {
    if (scraperIsRunning()) {
        alert("Cannot download data while scraper is running");
        return;
    } else if (scraperExists()) {
        let data = getScraper();
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "text/json;charset=utf-8" }
        ); const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "scraper.json";
        link.click();
        URL.revokeObjectURL(url);
    }
}

function stopSelecting() {
    if (scraperIsRunning()) {
        alert("Cannot stop selecting while scraper is running");
        return;
    } else if (scraperExists()) {
        document.removeEventListener("mouseover", mouseover, true);
        document.removeEventListener("click", clickAddSelector, true);
        document.removeEventListener("click", clickRemoveSelector, true);
    } else alert("Scraper doesn't exist");
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