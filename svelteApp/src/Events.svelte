<script>
	import { onDestroy } from 'svelte';
	import { getContext } from 'svelte';


	import EventItem from './EventItem.svelte';
	import ToggleButton from './ToggleButton.svelte';

	let jokiEvents = [];
	let filteredEvents = [...jokiEvents];

	let newestFirst = true;
	let types = {
		"ask": true,
		"broadcast"	: true,
		"trigger": true,
		"serviceUpdate": true,
	};


	const store = getContext('store');

	const unsub = store.subscribe(data => {
		if(data && Array.isArray(data.events) && data.events.length !== jokiEvents.lenght) {
			jokiEvents = data.events;
			sortEvents();
		}
	});

	


	function sortEvents() {
		if(!Array.isArray(jokiEvents)) return;
		if(newestFirst) {
			jokiEvents = jokiEvents.sort((a, b) => b.timeStamp - a.timeStamp);
		} else {
			jokiEvents = jokiEvents.sort((a, b) => a.timeStamp - b.timeStamp);
		}
		filteredEvents = jokiEvents.filter((ev) => {
			return types[ev.eventType];
		});

	}

	function toggleTimeSort() {
		newestFirst = !newestFirst;
		sortEvents();	
	}

	function toggleFiltering(event) {
		const tid = event.detail;
		const newTypes = {...types};

		newTypes[tid] = !newTypes[tid];
		types = newTypes;
		sortEvents();
	}

	sortEvents();
	
	onDestroy( ()=> {
		unsub();
	});
</script>

<style>

h1 {
	padding: 0.5rem 1rem;
	font-size: 1.4rem;
}

div.filter-row {
	padding: 0.5rem 1rem;

}

div.filter-row > button {
	font-size: 0.8rem;
	padding: 0.25rem 0.5rem;
	cursor: pointer;
}

div.filter-row > button.toggler {
	background-color: transparent;
	border: solid 2px rgba(0,0,0,0.5);
	border-radius: 0.25rem;
	padding-left: 2.5rem;
	position: relative;
	height: 2rem;
}

div.filter-row > button.toggler.active {
	background-color: rgba(192, 255,192, 0.4);
	border: solid 2px rgba(0,0,0,0.5);	
}

div.filter-row > button.toggler:after {
	content: "OFF";
	position: absolute;
	font-size: 1rem;
	font-weight: bold;
	top:0.25rem;
	left: 0.25rem;
	
}

div.filter-row > button.toggler.active:after {
	content: "ON";
}

</style>

<h1>
	Events ({filteredEvents.length} / {jokiEvents.length})
</h1>

{#if jokiEvents.length === 0}
<p>
	No Joki events found
</p>
{:else}

<div class="filter-row">
	<button on:click={toggleTimeSort}>{newestFirst ? "New first" : "Old first"}</button>
	<ToggleButton text="Trigger" id="trigger" on:toggle={toggleFiltering}/>
	<ToggleButton text="Ask" id="ask" on:toggle={toggleFiltering}/>
	<ToggleButton text="Broadcost" id="broadcast" on:toggle={toggleFiltering}/>
	<!-- <button class="toggler" on:click={() => { typeToggler('trigger');}}>Trigger</button>
	<button class="toggler" on:click={() => { typeToggler('trigger');}}>Ask</button>
	<button class="toggler" on:click={() => { typeToggler('trigger');}}>Broadcast</button>
	<button class="toggler" on:click={() => { typeToggler('trigger');}}>Ask</button> -->
</div>


{/if}



{#each filteredEvents as jokiEvent}
<EventItem {jokiEvent} />
{/each}
