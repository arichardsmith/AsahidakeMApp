function loadURL(state){
    console.dir('loadURL');
    const index_pages=['aboutSugatami',
                        'aboutDaisetsuzan',
                        'about6hLoop',
                        'aboutTrailToPeak',
                        'info',
                        'aboutDaisetsuzanGrade',
                        "jremey'sMap",
                        "blog"];
    var isLoaded = false;

    if(state == null ){
        pushStateAndLoad('aboutSugatami');
    }else{
        for(var k in index_pages){
            if(state == index_pages[k]){
                pushStateAndLoad(index_pages[k]);
                isLoaded = true;
                break;
            }
        }
        if(!isLoaded){
            pushStateAndLoad('aboutSugatami');
        }
    }
}

window.onpopstate = function(event) {
    console.dir('onpopstate  state:'+ history.state.page);
    loadURL(history.state.page);
};

function pushStateAndLoad(pageName) {
    console.dir('pushStateAndLoad');
	window.history.pushState({page : pageName}, null, '#/'+ pageName);
	$("#column").load(pageName + '.html');

    //hightlight trail which is muched the pages
    $(function() {
        switch (pageName){
            case 'about6hLoop':
                fitView('loop');
                AsahidakeMap.highlight.loop();
                break;
            case 'aboutTrailToPeak':
                fitView('summit');
                AsahidakeMap.highlight.summit();
                break;
            case 'aboutSugatami':
                fitView('sugatami');
                AsahidakeMap.highlight.sugatami();
                break;
            default :
                AsahidakeMap.highlight.clear();
        }
    });
};

