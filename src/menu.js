for (let action of ["status", "create", "remove", "start", "stop", "download", "select", "deselect", "links"]) {
    document.getElementById(action).onclick = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        chrome.tabs.sendMessage(tab.id, { action: action });
    };
}