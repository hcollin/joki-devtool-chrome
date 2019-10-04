// Connect the svelteApp to a devtool panel

const init = () => {
    chrome.devtools.panels.create("Joki.js", "icon-64.png", "./svelteApp/public/index.html", () => {
        console.log("DONE!");
    });    
};

init();