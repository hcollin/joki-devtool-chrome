// var listener = function listener(evt, _ref) {
//     var tab = _ref.tab;

//     if (evt.eventName === 'open-mobx-devtools-window') {
//       window.contentTabId = tab.id;
//       openWindow(tab.id);
//     }
//   };
//   chrome.runtime.onMessage.addListener(listener);

// chrome.runtime.onInstalled.addListener(() => {

// });

const active = {};

chrome.runtime.onConnect.addListener((port) => {
    
    const tabId = port.sender.tab.id;
    console.log("CONNECTION!", tabId);
   

});

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    
    let tabId = null;

    if(sender.tab === undefined) {    
        tabId = sender.id;
    } else {
        tabId = sender.tab.id;
    }
    
    
    switch (req.type) {
        case "initializeJoki":
            // chrome.pageAction.show(sender.tab.id);
            console.log("Joki Initialized!");
            chrome.browserAction.setIcon({
                tabId: tabId,
                path: "./icon-32.png"
            });
            sendResponse(JSON.stringify({ response: "InitDone", sender: sender }));
            break;
        case "updateBadge":
            console.log("Update badge", req);
            chrome.browserAction.setBadgeText({text: req.value, tabId: tabId});
            break;
        case "JOKIDT_EVENT":
            console.log("EVENT FROM JOKIDT!", req, sender);
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                chrome.tabs.sendMessage(tabs[0].id, req.realEvent, (response) => {
                  console.log("RESPONSE FROM CONTENT", response);
                  sendResponse({
                      reqId: req.reqId,
                      data: response
                  });
                });
              });
            return true;
            break;
        default:
            break;
    }
    // chrome.pageAction.show(sender.tab.id);
});

chrome.browserAction.onClicked.addListener((tab) => {
    console.log("Clickety click", tab);    
});