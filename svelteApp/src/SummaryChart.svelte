<script>
    export let data = [];
    export let title = "";

    $: total = data.reduce((sum, val) => {
        return sum + val.value;
    }, 0);

    $: moreData = data.map(d => {
        d.perc = Math.round(d.value/total*100);
        return d;
    });

</script>

<style>
div.chart {
    display: flex;
    flex-direction: column;
    font-size: 0.9rem;
}

div.row{
    display: flex;
    flex-direction: row;
    margin-bottom: 0.1rem;

}
span.name {
    width: 15rem;
}
span.value {
    width: 5rem;
    text-align: center;
}
span.percent {
    width: 5rem;
    text-align: center;
}
span.bar-container {
    width: 300px;
    background-color: rgba(0,0,0,0.1);
    display: flex;
    justify-content: flex-start;
    align-items: center;
    height: 1.2rem;
}
span.bar {
    background-color: green;
    height: 1rem;
    display: block;

}
</style>

<h3>{title} {total}</h3>

{#if data.length === 0}

<p>Do data</p>

{:else}

<div class="chart">
{#each moreData as item}
    <div class="row">
        <span class="name">{item.name}</span>
        <span class="value">{item.value}</span>
        <span class="percent">{Math.round(item.perc)}%</span>
        <span class="bar-container">
                <span class="bar" style="width: {item.perc * 3}px; background-color: { item.perc > 50 ? 'red' : 'green'};"></span>
        </span>
        
    </div>
{/each}
</div>

{/if}


