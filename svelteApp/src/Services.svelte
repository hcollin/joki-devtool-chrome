<script>
	import { onDestroy } from 'svelte';
	import { getContext } from 'svelte';
	let services = [];

	let service = null;

	const store = getContext('store');

	const unsub = store.subscribe(data => {
		if(data && data.services !== null && typeof data.services === "object") {
			services = Object.keys(data.services).map(srvId => {
				return data.services[srvId];
			});
		}
	});



	onDestroy( ()=> {
		unsub();
	});

</script>

<style>
div.services-page {
	height: 100%;
	display: flex;
	flex-direction: row;

	
}

div.service-menu {
	flex: 0 0 auto;
	width: 20rem;
	display: flex;
	flex-direction: column;

	background-color: rgba(0,0,0,0.1);

}

div.service-link {
	flex: 1 1 auto;
	max-height: 3rem;
}

div.service-link > button {
	background: transparent;
	border: none;
}


div.service-data {
	flex: 1 1 auto;
}
</style>

<div class="services-page">
	<div class="service-menu">
		{#each services as srv}
			<div class="service-link">
					<button>{srv.id}</button>
			</div>
			
		{/each}
	</div>

	<div class="service-data">

	</div>

</div>

{#each services as srv}
	<p>{srv.id}</p>
{/each}
