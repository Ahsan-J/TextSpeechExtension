/// <reference types="chrome"/>

chrome.contextMenus.create({
    id: "speak",
    title: "Speak with Text Speech",
    contexts: ["selection"]
});

chrome.contextMenus.onClicked.addListener(async function (info, tab) {
    let result = {};

    try {
        result = await chrome.storage.sync.get(["pitch", "rate", "name", "lang"]);
    } catch(e) {
        console.error(e);
    }

    chrome.tts.speak(info.selectionText, {
        lang: result.lang,
        voiceName: result.name,
        pitch: parseFloat(result.pitch || "1", 10),
        rate: parseFloat(result.rate || "1", 10),
    });
})