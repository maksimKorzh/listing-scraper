const DELAY = 5000;

chrome.runtime.onMessage.addListener((message) => {
    if (message.action == "status") status();
    else if (message.action == "create") create();
    else if (message.action == "remove") remove();
    else if (message.action == "start") start();
    else if (message.action == "stop") stop();
    else if (message.action == "download") download();
    else if (message.action == "links") selectLinks();
    else if (message.action == "pagination") selectPagination();
    else if (message.action == "select") selectElements();
    else if (message.action == "deselect") removeElements();
    else if (message.action == "preview") previewData();
    else if (message.action == "done") stopSelecting();
});

// Wait before going to the next page
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawl() {
    let scraper = JSON.parse(localStorage.getItem("scraper"));
    
    // Do nothing if no scrape storage available
    if (scraper == null) return;
    
    else if (scraper.running) {
        // We are done crawling all listings on this page
        if (scraper.currentPage == location.href) {
            // Go to the next page
            scraper.currentPage = "";
            location.href = document.getElementsByClassName("icon-arrow-right-after")[0].href
            return;
        }
        
        // We just landed on a page
        if (scraper.listingUrls.length == 0) {
            // Get the list of listing URLs
            parseLinks(scraper);
            
            // Store current page to back to it later
            scraper.currentPage = location.href;
            
            // Update scraper storage state in local browser storage
            localStorage.setItem("scraper", JSON.stringify(scraper));
        }
        
        // We are crawling through listing URLs within the current page
        else parseListing(scraper);
        
        // Update URL index
        scraper.listingUrlIndex++;
        
        // Update scraper storage state in local browser storage
        localStorage.setItem("scraper", JSON.stringify(scraper));
        
        // If no more URLs to crawl
        if (scraper.listingUrlIndex == scraper.listingUrls.length) {
            // Reset listing URL list
            scraper.listingUrls = [];
            scraper.listingUrlIndex = -1;

            // Update scraper storage state in local browser storage
            localStorage.setItem("scraper", JSON.stringify(scraper));
            
            // Wait for a while
            await sleep(DELAY);
            
            // Go to the next page
            location.href = scraper.currentPage;
        }
        
        // Otherwise we crawl through listings on current page
        else {
            // Wait for a while
            await sleep(DELAY);
            
            // Navigate to listing URL
            location.href = scraper.listingUrls[scraper.listingUrlIndex]
        }
    }
};