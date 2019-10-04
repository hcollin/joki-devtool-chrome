
let port = null;
let jokiIsPresentOnPage = false;
// Contains all Joki events
const jokiEventHistory = [];

const jokiServices = {};

try {
    port = chrome.runtime.connect();
} catch (err) {
    console.error("Port connection failed!", err);
    // This will always fail at the moment as the background script is missing.
}

// console.log("  Port:", port);

// port.onMessage.addListener(event => {
//     console.log("Port Message Listener:", event);
// })

// port.postMessage("test");
window.addEventListener(
    "message",
    event => {
        if (event.source !== window) {
            return;
        }
        event.data.type === "JOKI" && handleJokiEvents(event.data);
        event.data.type === "JOKIDT_BACKGROUND" && handleJokiEvents(event.data);
        // event.data.type === "JOKIDT_DEVTOOL" && handleSvelteEvents(event.data);  
    },
    false
);

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if(req.type === "JOKIDT_DEVTOOL") {
        const respData = handleSvelteEvents(req);
        sendResponse(respData);
    }
});

function handleJokiEvents(data) {
    switch (data.state) {
        case "initialize":
            console.log("JokiDT: Initialize Joki Developer Tool");
            jokiIsPresentOnPage = true;
            chrome.runtime.sendMessage({type: "initializeJoki"}, (resp) => {
                console.log("RESPONSE!", JSON.parse(resp));
            });
            break;
        case "event":
            const jokiEv = JSON.parse(data.eventData);
            jokiEventHistory.push({
                timeStamp: Date.now(),
                event: jokiEv,
                eventType: getEventType(jokiEv)
            });
            const eventCount = jokiEventHistory.length; // > 9999 ? Math.floor(jokiEventHistory.length/100)/10 + "k" : jokiEventHistory.length;
            chrome.runtime.sendMessage({type: "updateBadge", value: `${eventCount}`}, (resp) => {
                // console.log("RESPONSE!", JSON.parse(resp));
            });
            // console.log("Joki Event:", JSON.parse(event.data.eventData));
            break;
        case "services":
            jokiServices = data.data;
            break;
        case "serviceUpdate":
            console.log("JOKI.SERVICEUPDATE", data);
            jokiServices[data.serviceId] = {
                id: data.serviceId,
                data: data.serviceData,
                updated: Date.now()
            }
            break;
        case "ping":
            console.log("JokiDT: Ping -> Pong");
            window.postMessage({type:"JOKI_DEVELOPER_TOOL", msg: "pong"});
            break;
        default:
            break;
    }
}

function handleBackgroundEvents(event) {

}

function handleSvelteEvents(event) {
    switch(event.key) {
        case "getEvents":
            return [...jokiEventHistory];
        case "getServices":
            return {...jokiServices};
        case "requestServices":
            window.postMessage({type:"JOKI_DEVELOPER_TOOL", msg: "getServices"});
            break;
        default:
            return null;

    }
}

function getEventType(event) {
    if(event._jokiServiceUpdate) return "serviceUpdate";
    if(event._broadcast) return "broadcast";
    if(event._ask) return "ask";
    return "trigger";
}

// Send initialization message, so that Joki knows to start updating the dev tool
window.postMessage({ type: "JOKI_DEVELOPER_TOOL", state: "initialize" }, "*");
