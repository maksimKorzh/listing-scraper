const DELAY = 3000;

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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawl() {
    let scraper = getScraper();
    if (scraper == null) return;
    else if (scraper.running) {
        if (scraper.currentPage == location.href) {
            scraper.currentPage = "";
            location.href = document.querySelector(scraper.nextPageSelector).href
            return;
        } else if (scraper.listingUrls.length == 0) {
            parseLinks(scraper);
            scraper.currentPage = location.href;
            setScraper(scraper);
        } else parseListing(scraper);
        scraper.listingUrlIndex++;
        setScraper(scraper);
        if (scraper.listingUrlIndex == scraper.listingUrls.length) {
            scraper.listingUrls = [];
            scraper.listingUrlIndex = -1;
            localStorage.setItem("scraper", JSON.stringify(scraper));
            await sleep(DELAY);
            location.href = scraper.currentPage;
        } else {
            await sleep(DELAY);
            location.href = scraper.listingUrls[scraper.listingUrlIndex]
        }
    }
}; crawl();