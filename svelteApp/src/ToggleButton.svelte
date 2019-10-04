<script>
    import { createEventDispatcher } from 'svelte';

    export let id;
    export let text = "Toggler";
    export let initState = true;
    
    let active = typeof initState === "boolean" ? initState : true;

    const dispatch = createEventDispatcher();

    function toggle() {
        active = !active;
        dispatch('buttonToggle', {from: 'ToggleButton.svelte', typeId: id, value: active});
    }

</script>
<style>

button {
	font-size: 0.8rem;
    padding: 0.25rem 0.5rem 0.25rem 2.5rem;
    cursor: pointer;

    background-color: rgba(0,0,0,0.1);
	border: solid 2px rgba(0,0,0,0.5);
	border-radius: 0.25rem;
	position: relative;
	height: 2rem;
}


button.active {
	background-color: rgba(192, 255,192, 0.4);
	border: solid 2px rgba(0,0,0,0.5);	
}

button:after {
	content: "OFF";
	position: absolute;
	font-size: 1rem;
	font-weight: bold;
	top:0.25rem;
	left: 0.25rem;
	
}

button.active:after {
	content: "ON";
}

</style>
<button class:active={active} on:click={toggle}>
    {text}
</button>