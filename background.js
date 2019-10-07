const devToolConnections = new Map();

const jokiInstanceData = new Map();

// Initialize connection to DevTool jokiPiper and start listening to events coming from there
chrome.runtime.onConnect.addListener(port => {
    const devToolEventHandling = (msg, sender, sendResponse) => {
        if (chrome.runtime.lastError) {
            console.warn("Runtime error:", chrome.runtime.lastError.message);
        }
        if (!msg.jokiPipe) return;

        switch (msg.key) {
            case "initialize":
                devToolInitialization(msg, port);
                break;
            case "getFullUpdate":
                devToolGetFullUpdate(msg.tabId);
                break;
            case "logLine":
                console.log("DEVTOOL LOG: ", msg.message);
                break;
            default:
                break;
        }
        return true;
    };

    function devToolDisconnect(port) {
        console.log("Disconnecting Joki Dev Tool to Background", port);
        port.onMessage.removeListener(devToolEventHandling);
        const key = port.sender.tab === undefined ? port.sender.id : port.sender.tab.id;
        // const connObj = Array.from(devToolConnections.values()).find(devcon => devcon.name === port.name);
        // const key = connObj !== undefined ? connObj.key : undefined;
        if (key !== undefined && devToolConnections.has(key)) {
            devToolConnections.delete(key);
        }
        if (key !== undefined && jokiInstanceData.has(key)) {
            jokiInstanceData.delete(key);
        }
        return true;
    }

    // Add listener
    port.onMessage.addListener(devToolEventHandling);

    // Disconnect!
    port.onDisconnect.addListener(devToolDisconnect);
});

chrome.runtime.onSuspend.addListener(p => {
    console.log("ON SUSPEND", p);
});

/**
 * Create a new port connection to the specific dev tool
 * @param {*} event
 * @param {*} port
 */
function devToolInitialization(event, port) {
    console.log("Connecting Joki Dev Tool to Background", event.tabId, event);

    devToolConnections.set(event.tabId, {
        port: port,
        name: event.connectionName,
        tabId: event.tabId,
    });
    return true;
}

/**
 * Send full jokiData update to dev tool
 * @param {*} event
 * @param {*} port
 */
function devToolGetFullUpdate(tabId) {
    const data = jokiInstanceData.get(tabId);
    const port = getDevToolPortForTab(tabId);
    if (data && port) {
        console.log("DevTools request a full update!", tabId, data.events.length, Object.keys(data.services));
        port.postMessage({
            jokiPipe: true,
            key: "fullDataResponse",
            data: JSON.stringify(data),
        });
        return true;
    }

    return false;
}

function devToolUpdateEvents(tabId) {
    const data = jokiInstanceData.get(tabId);
    const port = getDevToolPortForTab(tabId);
    if (data && port) {
        console.log("Send updated Events to Dev Tools!", tabId, data.events.length);
        port.postMessage({
            jokiPipe: true,
            key: "updateEvents",
            data: JSON.stringify(data.events),
        });
        return true;
    }

    return false;
}

const sendEventQueue = {};

function devToolSendOneEvent(tabId, eventObject) {
    if (sendEventQueue[tabId] === undefined) {
        console.log("Initialize queue object for tabId ", tabId);
        sendEventQueue[tabId] = {
            events: [],
            sending: false,
        };
    }

    if (!devToolConnections.has(tabId)) {
        // console.log("No connection to dev tool yet. No need for queue");
        return;
    }

    sendEventQueue[tabId].events.push(eventObject);

    function sendQueue(tabId, tries = 0) {
        const data = jokiInstanceData.get(tabId);
        const port = getDevToolPortForTab(tabId);
        if (data && port && eventObject) {
            console.log("Send queue to Dev Tools", sendEventQueue[tabId]);
            const queueString = JSON.stringify(sendEventQueue[tabId].events);
            port.postMessage({
                jokiPipe: true,
                key: "newJokiEventQueue",
                eventsInQueue: queueString,
                eventTotal: data.events.length,
            });
            sendEventQueue[tabId].events = [];
            sendEventQueue[tabId].sending = false;
            return true;
        }
        // Try again in 1s
        if (!port && tries < 5) {
            setTimeout(() => {
                sendQueue(tabId, tries + 1);
            }, 1000);
            return false;
        }
        sendEventQueue[tabId].sending = false;
        return false;
    }

    if (!sendEventQueue[tabId].sending) {
        sendEventQueue[tabId].sending = true;
        setTimeout(() => {
            sendQueue(tabId);
        }, 1000);
    }

    // const data = jokiInstanceData.get(tabId);
    // const port = getDevToolPortForTab(tabId);
    // if (data && port && eventObject) {
    //     // console.log("Send new event to Dev Tools!", tabId, eventObject);
    //     port.postMessage({
    //         jokiPipe: true,
    //         key: "newEJokivent",
    //         eventObjectString: JSON.stringify(eventObject),
    //         eventTotal: data.events.length,
    //     });
    //     return true;
    // }

    // return false;
}

/**
 * Get the devtool port where to send messages
 * @param {*} tabId
 */
function getDevToolPortForTab(tabId) {
    if (devToolConnections.has(tabId)) {
        return devToolConnections.get(tabId).port;
    }
    return false;
}

/**********************************************************************************************
 * *********************************************************************************************
 * *********************************************************************************************
 */

// Main data piper to DevTools
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    if (!req.jokiPipe) return;

    const fromTab = sender.tab !== undefined;
    const senderId = fromTab ? sender.tab.id : sender.id;

    // From content Script
    if (fromTab) {
        if (req.command) {
            handleContentCommands(senderId, req.command);
            return true;
        }

        const resp = handleContentScriptEvent(senderId, req.data);
        if (resp) {
            sendResponse(resp);
        }
        return true;
    }

    // Send to content-script
    if (!fromTab) {
        console.log("FROM DEVTOOLS", req, senderId);

        // chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        //     chrome.tabs.sendMessage(tabs[0].id, req, (response) => {
        //       sendResponse({
        //           reqId: req.reqId,
        //           data: response
        //       });
        //     });
        //   });
        return true;
    }
});

/**
 * Handle events coming from joki passed by content script
 * @param {string} eventString - Stringified JSON event
 */
function handleContentScriptEvent(senderId, eventString) {
    const event = JSON.parse(eventString);
    switch (event.state) {
        case "initialize":
            return initializeJokiInstance(senderId, event);
        case "event":
            return handleJokiEvent(senderId, JSON.parse(event.eventData));
        case "serviceNew":
            console.log("New service", event.data);
            break;
        case "serviceRemove":
            console.log("Remove service", event.data);
            break;
        case "serviceUpdate":
            console.log("Update service", event.data);
            break;
        case "serviceInitialize":
            console.log("Init service", event.data);
            break;
        default:
            console.log("Unknown event", eventString);
            break;
    }
}

function handleContentCommands(senderId, command) {
    if (command === "reset") {
        console.log("CONTENT SCRIPT REQUESTS A RESET!");
    }
}

/**
 * Handler for initialization event from joki
 * @param {number} senderId - The tabId of the content script
 */
function initializeJokiInstance(senderId, event) {
    console.log("INITIALIZE JOKI INSTANCE FOR ", senderId, event.data);

    if (jokiInstanceData.has(senderId)) {
        return "This joki instance has already been initialized!";
    }

    
    const initData = {
        events: [],
        services: event.data.services.reduce((obj, srv) => {
            obj[srv.id] = srv;
            return obj;
        }, {}),
    };

    jokiInstanceData.set(senderId, initData);

    // Why this does not work?
    chrome.browserAction.setIcon({
        tabId: senderId,
        path: "./icon-32.png",
    });

    return { done: true, error: false };
}

/**
 * Add Joki event to instance data (for each event joki sends in the site)
 * @param {number} senderId
 * @param {Object} jokiEventObject
 */
function handleJokiEvent(senderId, jokiEventObject) {
    const jokiEvent = {
        timeStamp: Date.now(),
        data: jokiEventObject,
        eventType: getEventType(jokiEventObject),
    };

    if (!jokiInstanceData.has(senderId)) {
        return `${senderId} has no initialized data instance. WTF?!`;
    }
    const jokiData = jokiInstanceData.get(senderId);
    jokiData.events.push(jokiEvent);
    // Update badge

    updateEventCounterBadge(senderId, jokiData.events.length);
    // devToolUpdateEvents(senderId);
    devToolSendOneEvent(senderId, jokiEvent);
    // return `JokiDeveloperTool:EventAdded`;
    return { done: true, error: false };
}

function sendMessageToDevTool(senderId, message) {
    if (devToolConnections.has(senderId)) {
    }
}

/**
 * Get the type of the joki event object
 * @param {Object} jokiEventObject
 */
function getEventType(jokiEventObject) {
    if (jokiEventObject._jokiServiceUpdate) return "serviceUpdate";
    if (jokiEventObject._broadcast) return "broadcast";
    if (jokiEventObject._ask) return "ask";
    return "trigger";
}

/**
 * Update the event counter on the icon badge to provided count
 * @param {number} senderId
 * @param {number} count
 */
function updateEventCounterBadge(senderId, count) {
    if (count < 9999) {
        chrome.browserAction.setBadgeText({ text: `${count}`, tabId: senderId });
        return;
    }

    if (count < 999999) {
        const rounded = Math.floor(count / 100) / 10;
        chrome.browserAction.setBadgeText({ text: `${rounded}k`, tabId: senderId });
        return;
    }

    chrome.browserAction.setBadgeText({ text: `MANY`, tabId: senderId });
    return;
}

// chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//     let tabId = null;

//     if (sender.tab === undefined) {
//         tabId = sender.id;
//     } else {
//         tabId = sender.tab.id;
//     }

//     switch (req.type) {
//         case "initializeJoki":
//             // chrome.pageAction.show(sender.tab.id);
//             console.log("Joki Initialized!");
//             chrome.browserAction.setIcon({
//                 tabId: tabId,
//                 path: "./icon-32.png",
//             });
//             sendResponse(JSON.stringify({ response: "InitDone", sender: sender }));
//             break;
//         case "updateBadge":
//             // console.log("Update badge", req);
//             chrome.browserAction.setBadgeText({ text: req.value, tabId: tabId });
//             break;
//         // case "JOKIDT_EVENT":
//         //     console.log("EVENT FROM JOKIDT!", req, sender);
//         //     chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
//         //         chrome.tabs.sendMessage(tabs[0].id, req.realEvent, (response) => {
//         //           console.log("RESPONSE FROM CONTENT", response);
//         //           sendResponse({
//         //               reqId: req.reqId,
//         //               data: response
//         //           });
//         //         });
//         //       });
//         //     return true;
//         //     break;
//         default:
//             break;
//     }
//     // chrome.pageAction.show(sender.tab.id);
// });

chrome.browserAction.onClicked.addListener(tab => {
    console.log("Clickety click", tab);
});
