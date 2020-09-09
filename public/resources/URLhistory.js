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
        $("#column").load("aboutSugatami.html");
    }else{
        for(var k in index_pages){
            if(state == index_pages[k]){
                $("#column").load(index_pages[k] + ".html");
                isLoaded = true;
                break;
            }
        }
        if(!isLoaded){
            $("#column").load("aboutSugatami.html");
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
    switch (pageName){
        case 'about6hLoop':
            AsahidakeMap.highlight.loop();
            break;
        case 'aboutTrailToPeak':
            AsahidakeMap.highlight.summit();
            break;
        case 'aboutSugatami':
            AsahidakeMap.highlight.sugatami();
            break;
        default :
            AsahidakeMap.highlight.clear();
    }
};

