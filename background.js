
// Handle messages from the content script.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message", request);
    // Dummy response to test if the worker runs
    sendResponse({ result: true });
    return true;
});
