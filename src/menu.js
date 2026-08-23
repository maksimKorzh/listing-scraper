const fileInput = document.getElementById("file");

document.getElementById("load").onclick = () => {
    fileInput.click();
};

fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;
    const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
    }); chrome.tabs.sendMessage(tab.id, { action: await file.text() });
};

for (let btn of document.getElementsByTagName("button")) {
    if (btn.id == "load") continue;
    let action = btn.id;
    document.getElementById(action).onclick = async () => {
        const [tab] = await chrome.tabs.query({
            active: true,
            currentWindow: true
        }); chrome.tabs.sendMessage(tab.id, { action: action });
    };
}