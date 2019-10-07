
function jokiListener(event) {
    if (event.source !== window) {
        return;
    }
    if (event.data.type === "JOKI") {
        // if(event.data.state !== "event") console.log("SEND Event to background", event.data.state, event.data.state !== "event", JSON.stringify(event.data));
        chrome.runtime.sendMessage({ jokiPipe: true, data: JSON.stringify(event.data) }, response => {
            if (chrome.runtime.lastError) {
                console.warn("ContentScript:EventListener\n", chrome.runtime.lastError.message);
            }
            if (response) {
                if (typeof response.error === "boolean" && response.error === true) {
                    if (response.code === "NOCONNECTIONYET") {
                        console.log("Waiting for connection to Joki Devtools...");
                    }
                }
            }
        });
    }
}


window.addEventListener("message", jokiListener);

// Send initialization message, so that Joki knows to start updating the dev tool
window.postMessage({ type: "JOKI_DEVELOPER_TOOL", state: "initialize" }, "*");
