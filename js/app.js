
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

