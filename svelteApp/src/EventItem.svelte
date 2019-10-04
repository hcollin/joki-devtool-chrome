<script>
import { slide, fade } from 'svelte/transition';
import { beforeUpdate } from 'svelte';

export let jokiEvent;

let bodyIsOpen = false;
let eventClasses = ["joki-event"];
let eventClassString = "";
 
let eventType = jokiEvent.eventType;
let bodyData = "";

let counter = 0;

function timeFormatter(ts) {
    const d = new Date(ts);
    const hours  = `${d.getHours()}`.padStart(2,"0");
    const mins  = `${d.getMinutes()}`.padStart(2,"0");
    const secs  = `${d.getSeconds()}`.padStart(2,"0");
    return `${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()} ${hours}:${mins}:${secs}.${d.getMilliseconds()}`;
}

const eventTypeIcons = {
    "serviceUpdate": "../../serviceUpdateEvent.png",
    "broadcast": "../../broadcastEvent.png",
    "ask": "../../askEvent.png",
    "trigger": "../../triggerEvent.png",
}


function update() {
    if(jokiEvent === undefined) {
        console.error("jokiEvent is undefined");
        return;
    }

    if(jokiEvent.data === undefined) {
        console.error("jokiEvent.data is undefined", JSON.stringify(jokiEvent));
        
        return;
    }
    eventClasses = ["joki-event"];
    eventType = jokiEvent.eventType;

    eventClasses.push(`${eventType}Event`);
    
    if(bodyIsOpen) {
        eventClasses.push("bodyIsOpen");
    }

    eventClassString = eventClasses.join(" ");
    bodyData = jokiEvent.data.body !== undefined ? JSON.stringify(jokiEvent.data.body) : "No body in event";
    counter++;
}


function toggleBody() {    
    bodyIsOpen = ! bodyIsOpen;
}


// const eventClass = `joki-event ${jokiEvent.event.broadcast ? "broadcast" : ""} ${ bodyIsOpen ? "bodyOpen": ""}`;

beforeUpdate( () => {
    update();
});


</script>


<style>
    div.joki-event {
        margin-bottom: 0.5rem;
        border-bottom: solid 1px rgba(0,0,0,0.4);
        position: relative;
    }

    div.askEvent {
        background-color: rgba(192,255,192,0.5);
    }

    div.broadcastEvent {
        background-color: rgba(192,192,255,0.5);
    }

    div.serviceUpdateEvent {
        background-color: rgba(192,255,192,0.5);
    }

    
    
    .bodyIsOpen > header {
        /* border-bottom: solid 4px rgba(255,0,0.5);
        border-top: solid 4px rgba(255,0,0.5); */
        font-weight: bold;
    }
    

    div.joki-event > header {
        display: flex;
        height: 1.5rem;
        width: 100%;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        padding-left: 2rem;
    }

    img.eventIcon {
        height: 1rem;
        
        position: absolute;
        left: 0.25rem;
        top: 0.25rem;
    }

    div.joki-event > header > span.timestamp {
        flex: 1 1 auto;
        width: 140px;
        font-size: 0.7rem;
        margin-right: 1rem;
    }

    div.joki-event > header > span.from {
        flex: 2 2 auto;
        width: 200px;
        margin-right: 1rem;
    }
    div.joki-event > header > span.to {
        flex: 2 2 auto;
        width: 200px;
        margin-right: 1rem;
    }
    div.joki-event > header > span.key {
        flex: 2 2 auto;
        width: 200px;
        margin-right: 1rem;
    }
    div.joki-event > header > span.open {
        flex: 1 1 auto;
        width: 50px;
        margin-right: 1rem;
    }

    div.joki-event > div.bodyData {
        width: 100%;
        display: block;
        background-color: rgba(128,128,128,0.1);
        border-top: solid 1px rgba(0,0,0,0.2);
        border-bottom: solid 1px rgba(0,0,0,0.2);
        padding: 1rem;
    }

</style>

<div class={eventClassString}>
    <img src={eventTypeIcons[eventType]} alt="Ask Event" class="eventIcon" />
    <header on:click={toggleBody}>    
        <span class="timestamp">{timeFormatter(jokiEvent.timeStamp)}</span>
        <span class="from">{jokiEvent.data.from || "-"}</span>
        <span class="to">{jokiEvent.data.to || "-"}</span>
        <span class="key">{jokiEvent.data.key || "-"}</span>
        <span class="key">{eventType}</span>
    </header>
    {#if bodyIsOpen}
    <div class="bodyData" transition:fade="{{delay: 50, duration: 100}}">
        {eventClassString} <br />
        {bodyData} 
    </div>
    {/if}
</div>