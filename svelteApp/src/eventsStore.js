import { writable } from "svelte/store";
import requester from "./requester";

let init = false;
let updatingOn = true;

export const eventsStore = writable([]);

function getEvents() {
    try {
        requester({ type: "JOKIDT_DEVTOOL", key: "getEvents" }).then(resp => {
            if(Array.isArray(resp)) {
                eventsStore.set(resp);
            }
        });
        if (updatingOn) {
            setTimeout(() => {
                getEvents();
            }, 2000);
        }
    } catch (err) {
        updatingOn = false;
        console.log("ERR", err);
    }
}

function initializeStore() {
    init = true;
    updatingOn = true;
    getEvents();
}

!init && initializeStore();
