const DELAY = 5000;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == "status") status();
    else if (message.action == "create") create();
    else if (message.action == "remove") remove();
    else if (message.action == "start") start();
    else if (message.action == "stop") stop();
    else if (message.action == "download") download();
    //else if (message.action == "links") selectElements();
    else if (message.action == "select") selectElements();
    else if (message.action == "deselect") removeElements();
    else if (message.action == "highlight") highlightElements();
    else if (message.action == "done") stopSelecting();
});

// Extract useful data from target HTML page
function parseLinks(scraperStorage) {
    let linkSelectors = document.getElementsByClassName("item-link");
    for (let link of linkSelectors) scraperStorage.listingUrls.push(link.href);
}

// Navigate to the next listing URL
function parseListing(scraperStorage) {
    try {
        // Extract features
        let features = [];
        let featureSelector = document.getElementsByClassName("details-property_features");

        // Loop over features
        for (let div of featureSelector) {
            for (let ul of div.children) {
                for (let li of ul.children) {
                    // Collect features
                    features.push(li.textContent.trim().replace("\n", ""));
                }
            }
        }

        // Extract listing data
        let data = {
            "url": location.href,
            "title": document.getElementsByClassName("main-info__title-main")[0].innerHTML,
            "price": document.getElementsByClassName("info-data-price")[0].children[0].innerHTML,
            "features": features,
            "description": document.getElementsByClassName("comment")[0].textContent.trim().replaceAll("\n", ""),
        }

        // Log extracted data to console
        console.log(JSON.stringify(data, null, 2))
        console.log("\nCurrent page:", scraperStorage.currentPage);

        // Save listing to the browser local storage
        scraperStorage.data.push(data)
    } catch(e) {}
}

// Wait before going to the next page
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawl() {
    // Load scraper storage if available
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    
    // Do nothing if no scrape storage available
    if (scraperStorage == null) return;
    
    else if (scraperStorage.running) {
        // We are done crawling all listings on this page
        if (scraperStorage.currentPage == location.href) {
            // Go to the next page
            scraperStorage.currentPage = "";
            location.href = document.getElementsByClassName("icon-arrow-right-after")[0].href
            return;
        }
        
        // We just landed on a page
        if (scraperStorage.listingUrls.length == 0) {
            // Get the list of listing URLs
            parseLinks(scraperStorage);
            
            // Store current page to back to it later
            scraperStorage.currentPage = location.href;
            
            // Update scraper storage state in local browser storage
            localStorage.setItem("scraper", JSON.stringify(scraperStorage));
        }
        
        // We are crawling through listing URLs within the current page
        else parseListing(scraperStorage);
        
        // Update URL index
        scraperStorage.listingUrlIndex++;
        
        // Update scraper storage state in local browser storage
        localStorage.setItem("scraper", JSON.stringify(scraperStorage));
        
        // If no more URLs to crawl
        if (scraperStorage.listingUrlIndex == scraperStorage.listingUrls.length) {
            // Reset listing URL list
            scraperStorage.listingUrls = [];
            scraperStorage.listingUrlIndex = -1;

            // Update scraper storage state in local browser storage
            localStorage.setItem("scraper", JSON.stringify(scraperStorage));
            
            // Wait for a while
            await sleep(DELAY);
            
            // Go to the next page
            location.href = scraperStorage.currentPage;
        }
        
        // Otherwise we crawl through listings on current page
        else {
            // Wait for a while
            await sleep(DELAY);
            
            // Navigate to listing URL
            location.href = scraperStorage.listingUrls[scraperStorage.listingUrlIndex]
        }
    }
};