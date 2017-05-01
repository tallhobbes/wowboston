
var toggleClass = function(el, classname){
    state = d3.select(el).classed(classname);
    d3.select(el).classed(classname, !state);

}
var toggleSlidingPanel = function(){
    pauseParChart(.5);
    toggleClass('#slidingPanel','on');
    toggleClass('#pulltab','on');
    setSlidingPanelHeight();
}

var setSlidingPanelHeight = function(){
    var chartHeight = document.getElementById('slidingPanel').offsetHeight;
    var ypos;
    if(d3.select('#slidingPanel').classed('on')){
        //console.log(chartHeight);
        if(window.innerHeight < chartHeight){
            ypos =0;
        } else {
            ypos = window.innerHeight - chartHeight;
        }
        //console.log(ypos);
        d3.select('#slidingPanel').style('top',ypos);
    } else {
        ypos = window.innerHeight-document.getElementById('pulltab').offsetHeight;
        d3.select('#slidingPanel').style('top',ypos);
    }
}

var setEntityStat = function(stat, val){
    var statDict = {sel:'entValSel', disp:'entValDisp', lim:'entValLim'};
    document.getElementById(statDict[stat]).innerHTML = val;
}
var getEntityStat = function(stat){
    var statDict = {sel:'entValSel', disp:'entValDisp', lim:'entValLim'};
    return(parseInt(document.getElementById(statDict[stat]).innerHTML));
}

////Run the shizzle
window.onload = function(){
    console.log('yup');
    var await = function(){
        if(queuesdone < 2){
            setTimeout(await, 100);
        } else{
            runCesium();
        }
    }
    createLinkDict();
    runCesium();
    runParChart(); 
    toggleSlidingPanel(); 
    viewer.scene.postRender.addEventListener(renderDone.update);
}
window.onresize = function(){
    setSlidingPanelHeight();
}


var labelPart1 = "<div onclick='dimensionSelectClick(this)' class='dimensionItem";
var labelPart2 = " selected";
var labelPart3 = "'  data-label=";
var labelPart4 = "><div class='dimensionIcon'><i class='fa fa-check fa-1x'></i></div><div class='dimensionLabel'>";
var labelPart5 = '</div></div>';
var labelhtml = [labelPart1, labelPart2, labelPart3, labelPart4, labelPart5];
var listslug;
var makeDimensionSelectList = function(){
    var currentkeys = d3.keys(pc.dimensions()).sort();
    var allkeys = d3.keys(alldims).sort();
    listslug = [];
    var htmlslug = '';
    currentkeys.forEach(function(key){
        //htmlslug = htmlslug + makeDimensionListItem(key, true);
        var title = alldims[key].title;
        listslug[title] = makeDimensionListItem(key, true);
    });
    d3.keys(listslug).sort().forEach(function(title){
        htmlslug = htmlslug+listslug[title];
    });
    listslug = [];
    allkeys.forEach(function(key){
        if(currentkeys.indexOf(key)===-1){
            var title = alldims[key].title;
            listslug[title] = makeDimensionListItem(key, false);
        }
    });
    d3.keys(listslug).sort().forEach(function(title){
        htmlslug = htmlslug+listslug[title];
    });

    // d3.keys(alldims).sort().forEach(function(dim){
    //     var title = alldims[dim].title;
    //     console.log(dim);
    //     //listslug[title] = labelhtml[0] +dim+ labelhtml[1] +title+ labelhtml[2];
    //     listslug[title] = makeDimensionListItem(dim, true);
    // });
    // d3.keys(listslug).sort().forEach(function(key){
    //     htmlslug = htmlslug+listslug[key];
    // })
    d3.select('#dimensionList').html(htmlslug);
}

var makeDimensionListItem = function(dimkey, selected){
    var title = alldims[dimkey].title;
    var checkbox = (selected) ? labelPart2 : '' ;
    var slug = labelPart1 + checkbox + labelPart3 + dimkey + labelPart4 + title + labelPart5;
    return(slug);
}
var dimensionSelectClick = function(el){
    //document.getElementById
    console.log(el);
    el.classList.toggle('selected');
}
var getSelectedDimensions = function(){
    var selected = [];
    d3.selectAll('.dimensionItem')[0].forEach(function(item){
        //console.log(item.classList.contains('selected'));
        if(item.classList.contains('selected')){
            selected.push(item.getAttribute('data-label'));
        }
    });
    console.log('selected by panel are: ',selected);
    return(selected);
}
var activateNewDims = function(){
    updateDims(getSelectedDimensions());
    d3.select('#dimensionSelectPanel').classed('hide',true);
    d3.select('#filterbutton').classed('on', false);
}
var dummy1 = 'zip_own_num';
var dummy2 = 'Owners Zip Code';

var showDimensionPanel = function(){
    if(!d3.select('#dimensionSelectPanel').classed('hide')){
        d3.select('#dimensionSelectPanel').classed('hide', true);
        d3.select('#filterbutton').classed('on', false);
    } else{
         d3.select('#filterbutton').classed('on', true);
        var panel = document.getElementById('dimensionSelectPanel');
        var buttonloc = document.getElementById('filterbutton').getBoundingClientRect();
        d3.select('#dimensionSelectPanel').classed('hide', false);
        //panel.style.left = (((buttonloc.left+buttonloc.right)/2)-(document.getElementById('dimensionSelectPanel').offsetWidth)/2 )+'px';
        panel.style.left = (((buttonloc.left+buttonloc.right)/2)-(108))+'px';
        panel.style.top = buttonloc.bottom+'px';
        makeDimensionSelectList();
    }
}
var auto = {};
auto.render = true;
auto.zoom = false;
var toggleAuto = function(action){
    if(action === 'render'){
        auto.render = !(auto.render);
        d3.select('#renderbutton').classed('auto', auto.render);
    }
    if(action === 'zoom'){
        auto.zoom = !(auto.zoom);
        d3.select('#zoombutton').classed('auto', auto.zoom);
    }
}