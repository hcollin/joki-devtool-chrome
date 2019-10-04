<script>
	import Services from './Services.svelte';
	import Events from './Events.svelte';
	
	let openView = Events;
	
	function changeView(value) {
		openView = value;
	}
</script>

<style>

nav {
	box-shadow: 0 0 10px 2px rgba(0,0,0,0.1);
	background-color: white;
	width: 100%;
	padding: 0;
	height: 48px;

	display: flex;
	flex-direction: row;
	justify-content: flex-start;
	align-items: center;
}


nav > img.logo {
	height: 32px;
	width: 32px;
	margin: 0 1rem;
	flex: 0 0 auto;
}

nav > button {
	flex: 0 0 auto;
	font-size: 1rem;
	padding: 0.5rem 1rem;
	width: 120px;
	background: transparent;
	border: none;
	margin: 0;
}

nav > button:hover {
	background: rgba(192,192,255, 0.2);
}

nav > button.active {
	font-weight: bold;
}


</style>

<nav>

	<img src="../../icon-32.png" alt="Joki Developer Tool icon" class="logo" />

	<button on:click={() => changeView(Events)}>
		Joki Events
	</button>
	
	<button on:click={() => changeView(Services)}>
		Services
	</button>
</nav>

<svelte:component this={openView} />