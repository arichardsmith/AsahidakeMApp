function loadURL(state){
    console.dir('loadURL');
    const index_pages=['aboutSugatami',
                        'aboutDaisetsuzan',
                        'about6hLoop',
                        'aboutTrailToPeak',
                        'info',
                        'aboutDaisetsuzanGrade',
                        "jremey'sMap"];
    var isLoaded = false;

    if(state == null ){
        $("#column").load("aboutSugatami.html");
        console.dir('state:  ' + state + '   URL該当なし1');
    }else{
        for(var k in index_pages){
            if(state == index_pages[k]){
                $("#column").load(index_pages[k] + ".html");
                console.dir(index_pages[k] + ' を開きました');
                isLoaded = true;
                break;
            }
        }
        if(!isLoaded){
            $("#column").load("aboutSugatami.html");
            console.dir('state:  ' + state + '   URL該当なし2');
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
};

