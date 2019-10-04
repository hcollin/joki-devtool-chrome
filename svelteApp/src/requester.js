export default function requester(event) {
    return new Promise((resolve, reject) => {
        const reqId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        if (chrome) {
            chrome.runtime.sendMessage({ type: "JOKIDT_EVENT", realEvent: event, reqId: reqId }, (response) => {
                if(chrome.runtime.lastError) {
                    reject("An error occured");
                    throw new Error(chrome.runtime.lastError.message);
                } else {
                    resolve(response.data);
                }
                
            });
        }
    });
}
