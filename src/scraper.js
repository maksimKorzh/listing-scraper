let highlighted = null;

function getScraper() {
    return JSON.parse(localStorage.getItem("scraper"));
}

function setScraper(scraper) {
    localStorage.setItem("scraper", JSON.stringify(scraper));
}

function scraperExists() {
    if (getScraper() == null) return false;
    else return true;
}

function scraperIsRunning() {
    if (scraperExists()) {
        let scraper = getScraper();
        return scraper.running;
    }
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

function stopSelecting() {
    document.removeEventListener("mouseover", mouseover, true);
    document.removeEventListener("click", clickAddSelector, true);
    document.removeEventListener("click", clickRemoveSelector, true);
}

function getCssSelector(element, all) {
    if (element.id && !all) return `#${CSS.escape(element.id)}`;
    let path = [];
    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.tagName.toLowerCase();
        if (element.classList.length > 0) {
            selector += [...element.classList]
                .map(cls => `.${CSS.escape(cls)}`)
                .join("");
        } if (!all && document.querySelectorAll(selector).length === 1) {
            path.unshift(selector);
            break;
        } if (!all) {
            let sibling = element;
            let index = 1;
            while (sibling = sibling.previousElementSibling) {
                if (sibling.tagName === element.tagName) {
                    index++;
                }
            } selector += `:nth-of-type(${index})`;
        } path.unshift(selector);
        element = element.parentElement;
    } return path.join(" > ");
}

function extractListingUrls(cardUrlSelector) {
    let listingUrls = "";
    for (let card of document.querySelectorAll(cardUrlSelector))
      listingUrls += card.href + "\n";
    return listingUrls;
}

function extractNextPage(nextPageSelector) {
    try { return document.querySelector(nextPageSelector); }
    catch(e) { return ""; }
}

function extractData() {
    let scraper = getScraper();
    let data = {};
    try {
        for (let key of Object.keys(scraper.selectors))
            data[key] = document.querySelector(scraper.selectors[key]).textContent.trim();
        return data;
    } catch(e) { return {}; }
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

function parseLinks(scraper) {
    let linkSelectors = document.querySelectorAll(scraper.cardUrlSelector);
    for (let url of linkSelectors) scraper.listingUrls.push(url.href);
}

function parseListing(scraper) {
    try {
        let data = extractData();
        console.log(JSON.stringify(data, null, 4))
        console.log("\nCurrent page:", scraper.currentPage);
        scraper.data.push(data)
    } catch(e) {}
}