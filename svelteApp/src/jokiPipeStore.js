import { writable } from "svelte/store";

export function createJokiPipeStore() {
    let initialized = false;
    let connection = null;
    const tabId = chrome.devtools.inspectedWindow.tabId;

    let updating = false;

    const { subscribe, set, update } = writable({
        events: [],
        services: {},
    });

    function init() {
        if (initialized) return;
        initialized = true;

        connection = chrome.runtime.connect({
            name: `jokiDevToolPiper`,
        });
        connection.postMessage({
            jokiPipe: true,
            key: "initialize",
            connectionName: `jokiDevToolPiper`,
            tabId: tabId,
        });

        connection.onMessage.addListener(incomingMessageHandler);

        requestFullUpdate();

        connection.onDisconnect.addListener(disconnectPort => {
            connection.onMessage.removeListener(incomingMessageHandler);
            initialized = false;
            reset();
            setTimeout(reconnect, 1000);
        });
    }

    function reconnect() {
        connection = null;
        init();
    }

    function incomingMessageHandler(msg, sender, sendResponse) {
        switch (msg.key) {
            case "fullDataResponse":
                return handleFullData(msg.data);
            // case "updateEvents":
            //     return handleEventsUpdate(msg.data);
            case "newJokiEventQueue":
                return handleNewJokiEventQueue(msg.eventsInQueue, msg.eventTotal);
            default:
                sendLogLine(`Unknown message received ${msg.key} ${msg}`);
                break;
        }
        return true;
    }

    function handleFullData(response) {
        const data = JSON.parse(response);
        set(data);
        updating = false;
        return true;
    }

    function handleNewJokiEventQueue(jokiEventQueueString, totalNo) {
        const jokiEvents = JSON.parse(jokiEventQueueString);
        const requestFullData = false;
        update(oldData => {
            const newData = { ...oldData };
            newData.events = oldData.events.concat(jokiEvents);
            if (newData.events.length !== totalNo) requestFullData = true;
            return newData;
        });
        

        if (requestFullData && !updating) {
            requestFullUpdate();
        }
    }

    function sendLogLine(text) {
        connection.postMessage({
            jokiPipe: true,
            key: "logLine",
            tabId: tabId,
            message: text,
        });
    }

    function requestFullUpdate() {
        updating = true;
        connection.postMessage({
            jokiPipe: true,
            key: "getFullUpdate",
            tabId: tabId,
        });
    }

    function reset() {
        set({
            events: [],
            services: {},
        });
    }

    return {
        init,
        subscribe,
        set,
        update,
        requestUpdate: requestFullUpdate,
        reset,
    };
}

// export const jokiPipeStore = writable("INIT");

// let started = false;
// let connection = null;

// let tabId = chrome.devtools.inspectedWindow.tabId;

// let fullUpdateGoingOn = false;

// function start() {
//     if (started) return;
//     started = true;
//     connection = chrome.runtime.connect({
//         name: `jokiDevToolPiper-${tabId}`,
//     });
//     connection.postMessage({
//         jokiPipe: true,
//         key: "initialize",
//         connectionName: `jokiDevToolPiper-${tabId}`,
//         tabId: tabId,
//     });

//     connection.onMessage.addListener(incomingMessageHandler);

//     requestFullUpdate();
//     // chrome.runtime.sendMessage({jokiPipe: true, key: "initialize"});
//     // chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
//     //     jokiPipeStore.set("SOMETHING!");
//     //     // jokiPipeStore.set({
//     //     //     req: req,
//     //     //     sender: sender
//     //     // });
//     //     // if(req.jokiPipe) {
//     //     //     jokiPipeStore.set({
//     //     //         req: req,
//     //     //         sender: sender
//     //     //     });
//     //     // }
//     // });

//     connection.onDisconnect.addListener(disconnectPort => {
//         connection.onMessage.removeListener(incomingMessageHandler);
//         started = false;
//         jokiPipeStore.set("INIT");
//     });
// }

// function incomingMessageHandler(msg, sender, sendResponse) {
//     switch (msg.key) {
//         case "fullDataResponse":
//             return handleFullData(msg.data);
//         case "updateEvents":
//             return handleEventsUpdate(msg.data);
//         case "newJokiEventQueue":
//             return handleNewJokiEventQueue(msg.eventsInQueue, msg.eventTotal);
//         default:
//             sendLogLine(`Unknown message received ${msg.key} ${msg}`);
//             break;
//     }
//     return true;
// }

// function requestFullUpdate() {
//     fullUpdateGoingOn = true;
//     connection.postMessage({
//         jokiPipe: true,
//         key: "getFullUpdate",
//         tabId: tabId,
//     });
// }

// function handleFullData(response) {
//     const data = JSON.parse(response);
//     jokiPipeStore.set(data);
//     fullUpdateGoingOn = false;
//     return true;
// }

// function handleEventsUpdate(response) {
//     const data = JSON.parse(response);
//     jokiPipeStore.update(oldData => {
//         return { ...oldData, events: data };
//     });
//     return true;
// }

// function handleNewJokiEventQueue(jokiEventQueueString, totalNo) {
//     const jokiEvents = JSON.parse(jokiEventQueueString);
//     let requestFullData = false;
//     jokiPipeStore.update(oldData => {
//         const newData = { ...oldData };
//         newData.events = oldData.events.concat(jokiEvents);
//         if (newData.events.length !== totalNo) requestFullData = true;
//         return newData;
//     });

//     if (requestFullData && !fullUpdateGoingOn) {
//         requestFullUpdate();
//     }
// }

// function update() {
//     chrome.runtime.sendMessage({ jokiPipe: true, key: "update" });
// }

// function sendLogLine(text) {
//     connection.postMessage({
//         jokiPipe: true,
//         key: "logLine",
//         tabId: tabId,
//         message: text,
//     });
// }

