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
        let nextPageSelector = ""
        while (cardUrlSelector == "") cardUrlSelector = prompt("Paste card URL selector");
        while (nextPageSelector == "") nextPageSelector = prompt("Paste next page selector");
        scraper.cardUrlSelector = cardUrlSelector;
        scraper.nextPageSelector = nextPageSelector;
        setScraper(scraper);
    }
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
    }
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
    }
}

function highlightElements() {
    if (scraperIsRunning()) {
        alert("Cannot select elements while scraper is running");
        return;
    } else if (scraperExists()) {
        alert("These are elements you have selected (green: text; blue: links)");
        let scraper = getScraper();
        for (let key of Object.keys(scraper.selectors)) {
            let element = document.querySelector(scraper.selectors[key]);
            element.style.outline = "2px solid " + (element.tagName == "A" ? "blue" : "green");
        }
    }
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