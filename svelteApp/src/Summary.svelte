<script>
    import { onDestroy } from "svelte";
    import { getContext } from "svelte";

	import SummaryChart from './SummaryChart.svelte';

    let pipeStoreData = {};

    let calculations = {
        from: [],
		to: [],
		keys: []
    };

    const store = getContext("store");

    const unsub = store.subscribe(data => {
        if (data) {
			pipeStoreData = data;
			calculate();
		}
		
    });

    function ObjectToArray(obj) {
        return Object.keys(obj).reduce((acc, k) => {
            acc.push({
                name: k,
                value: obj[k],
            });
            return acc;
        }, []);
    }

    function calculate() {
        const eventsTo = {};
		const eventsFrom = {};
		const eventKeys = {};
        pipeStoreData.events.forEach(event => {
			
			const jokiEvent = event.data;



            if (jokiEvent.to !== undefined) {
				const key = jokiEvent.to;
				
                if (eventsTo[key] === undefined) {
                    eventsTo[key] = 0;
                }
                eventsTo[key]++;
			}
			
            if (jokiEvent.from !== undefined) {
				const key = jokiEvent.from;
				
                if (eventsFrom[key] === undefined) {
                    eventsFrom[key] = 0;
                }
                eventsFrom[key]++;
			}
			if (jokiEvent.key !== undefined) {
				const key = jokiEvent.key;
				
                if (eventKeys[key] === undefined) {
                    eventKeys[key] = 0;
                }
                eventKeys[key]++;
            }
        });

        calculations = {
            from: ObjectToArray(eventsFrom),
			to: ObjectToArray(eventsTo),
			key: ObjectToArray(eventKeys)
		};
		
    }

    onDestroy(() => {
        unsub();
    });
</script>
<style>
div.summary {
	padding: 0 1rem;
}
</style>

<div class="summary">
		<h1>
				Summary
			</h1>
			
			<h2>Events</h2>
			
			<p>Event sent in Joki: {pipeStoreData.events.length}</p>
			
			
			<SummaryChart data={calculations.from} title="From" />
			
			<SummaryChart data={calculations.to} title="To" />
			
			<SummaryChart data={calculations.key} title="Keys" />

</div>

