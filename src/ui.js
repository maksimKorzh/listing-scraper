function status() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) alert("Scraper storage doesn't exist");
    else alert("Scraper " + (scraperStorage.running ? "is" : "is not") + " running");
}

function create() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) {
        localStorage.setItem("scraper", JSON.stringify({
            "running": false,
            "currentPage": "",
            "selectors": {},
            "listingUrls": [],
            "listingUrlIndex": -1,
            "data": []
        }));
        alert("Scraper storage has been created");
    } else alert("Scraper storage already exists");
}

function remove() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) alert("Scraper storage doesn't exist");
    else {
        localStorage.removeItem("scraper");
        alert("Scraper storage has been removed");
    }
}

function start() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) alert("Scraper storage doesn't exist");
    else if (scraperStorage.running == true) alert("Scraper is running");
    else {
        scraperStorage.running = true;
        localStorage.setItem("scraper", JSON.stringify(scraperStorage));
        alert("Scraper has been started");
        location.reload();
    }
}

function stop() {
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) alert("Scraper storage doesn't exist");
    else if (scraperStorage.running == false) alert("Scraper is not running");
    else {
        scraperStorage.running = false;
        localStorage.setItem("scraper", JSON.stringify(scraperStorage));
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
        link.download = "data_" + Date().toString().split(" ").slice(0, 5) + ".json";
        link.click();
        URL.revokeObjectURL(url);
    }
}

function select(add, links) {
    let highlighted = null;
    let scraperStorage = JSON.parse(localStorage.getItem("scraper"));
    if (scraperStorage == null) {
        alert("Scraper storage doesn't exist");
        return;
    } 
    
    if (add) {
        alert("Select element you want to extract");
        document.addEventListener("mouseover", mouseover, true);
        document.addEventListener("mouseout", mouseout, true);
        
    } else alert("Remove selector you no longer need");    
    document.addEventListener("click", click, true);
    
    function mouseover(e) {
        const el = e.target;
        if (e.target.style.outline == "green solid 2px") return;
        if (highlighted) highlighted.style.outline = "";
        highlighted = el;
        highlighted.style.outline = "2px solid red";
    }
    
    function mouseout(e) {
        if (highlighted === e.target) {
            if (e.target.style.outline == "2px solid red") {
                highlighted.style.outline = "";
                highlighted = null;
            }
        }
    }
    
    function click(e) {
        e.preventDefault();
        e.stopPropagation();
        const selector = getCssSelector(e.target, links);
        if (add) {
            e.target.style.outline = "2px solid green";
            //console.log("Element:", e.target);
            //console.log("Selector:", selector);
            let name = prompt("How would you call this selector?");
            try {
                while (scraperStorage.selectors[name] != undefined) {
                    alert(`Selector "${name}" already exists`);
                    name = prompt("How would you call this selector?");
                }
            } catch(e) {}
            
            scraperStorage.selectors[name] = selector;
            localStorage.setItem("scraper", JSON.stringify(scraperStorage));
            if (links) {
                alert(`Selector "${name}" would be used to crawl through selected URLs`);
                for (let link of document.querySelectorAll(name))
                    link.style.outline = "2px solid green";
            }
            //navigator.clipboard.writeText(selector);
            //alert(`Selector copied:\n${selector}`);
        }  else {
            if (e.target.style.outline == "green solid 2px") {
                for (let key of Object.keys(scraperStorage.selectors)) {
                    console.log(key, selector);
                    if (scraperStorage.selectors[key] == selector) {
                        delete scraperStorage.selectors[key];
                        alert(`Selector "${key}" has been removed`);
                    }
                } e.target.style.outline = "";
                localStorage.setItem("scraper", JSON.stringify(scraperStorage));
                
            } else { alert("There is no such selector"); }
        }
        
        document.removeEventListener("mouseover", mouseover, true);
        document.removeEventListener("mouseout", mouseout, true);
        document.removeEventListener("click", click, true);
    }
}

function getCssSelector(element, all) {
    if (element.id && !all) {
        return `#${CSS.escape(element.id)}`;
    }

    const path = [];

    while (element && element.nodeType === Node.ELEMENT_NODE) {
        let selector = element.tagName.toLowerCase();

        if (element.classList.length > 0) {
            selector += [...element.classList]
                .map(cls => `.${CSS.escape(cls)}`)
                .join("");
        }

        // For unique selector, stop as soon as we find one
        if (!all && document.querySelectorAll(selector).length === 1) {
            path.unshift(selector);
            break;
        }

        if (!all) {
            let sibling = element;
            let index = 1;

            while (sibling = sibling.previousElementSibling) {
                if (sibling.tagName === element.tagName) {
                    index++;
                }
            }

            selector += `:nth-of-type(${index})`;
        }

        path.unshift(selector);
        element = element.parentElement;
    }

    return path.join(" > ");
}