for (let action of ["status", "create", "remove", "start", "stop", "download", "links", "select", "deselect", "highlight", "done"]) {
    document.getElementById(action).onclick = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        });
        chrome.tabs.sendMessage(tab.id, { action: action });
    };
}