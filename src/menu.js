for (let btn of document.getElementsByTagName("button")) {
    let action = btn.id;
    document.getElementById(action).onclick = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        chrome.tabs.sendMessage(tab.id, { action: action });
    };
}