
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
        d3.select('#dimensionSelectPanel').classed('hide',true);
        d3.select('#filterbutton').classed('on',false);
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

var resizeParchart = function(){
    pc.width(d3.select('#parchart')[0][0].clientWidth);
    pc.render();
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
    resizeParchart();

}


var labelPart1 = "<div onclick='dimensionSelectClick(this)' class='dimensionItem";
var labelPart2 = " selected";
var labelPart3 = "'  data-label=";
var labelPart4 = "><div class='dimensionIcon'><i class='fa fa-check fa-1x'></i></div><div class='dimensionLabel'>";
var labelPart5 = '</div></div>';
var labelhtml = [labelPart1, labelPart2, labelPart3, labelPart4, labelPart5];
var listslug;
var makeDimensionSelectList = function(){
    var currentkeys = d3.keys(pc.dimensions());
    // d3.keys(pc.dimensions()).forEach(function(key){
    //     currentkeys[pc.dimensions()[key].index] = key;
    // });
    var allkeys = d3.keys(alldims).sort();
    listslug = [];
    var htmlslug = '';
    currentkeys.forEach(function(key){
        htmlslug = htmlslug + makeDimensionListItem(key, true);
        // var title = alldims[key].title;
        // listslug[title] = makeDimensionListItem(key, true);
    });
    // d3.keys(listslug).sort().forEach(function(title){
    //     htmlslug = htmlslug+listslug[title];
    // });
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
    //console.log(el);
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
    // console.log('selected by panel are: ',selected);
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

var togglePopup = function(){
    var status = d3.select('#popupbg').classed('show');
    d3.select('#popupbg').classed('show', !status);
}


//twittsh!tt 


var fd = new FormData(); 
    // Append the file
//var xmlhttp;
var uploadPic = function(outpic, title, desc) {
    if(typeof(desc)==='undefined'){
        desc='';
    }
    desc = desc+" [via WOWboston.space]";
    var xmlhttp = new XMLHttpRequest();
    var url = "https://api.imgur.com/3/image";
    xmlhttp.open("POST", url, true);
    xmlhttp.setRequestHeader("Content-type", "application/json");
    xmlhttp.setRequestHeader("Authorization", "Client-ID e19170f0267a43b");
    xmlhttp.onreadystatechange = function () { //Call a function when the state changes.
        //console.log(xmlhttp);
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var data = JSON.parse(xmlhttp.responseText).data;
            data.link = data.link.replace(/.png/,'');
            //console.log(data);
            //add to prev links array, but don't yet save to cookie
            prevlinks.unshift(data.link);
            imgurdata.push(data);
        }
    }

    var parameters = {
        'image': outpic.slice(22, outpic.length),
        'type':'base64',
        'title':title,
        'description':desc
    };
    // fd.append("image", outpic.slice(23, outpic.length));
    // fd.append('type','base64'); 
    //xmlhttp.send(fd);
    xmlhttp.send(JSON.stringify(parameters));
}

var pic_globe, pic_filter;

var makeGlobePic = function(){
    pic_globe = viewer.canvas.toDataURL('image/jpg',.5);
}
var makeFilterPic = function(){
    pc.mergeParcoords(function(img){
        //console.log('inside filterpic callback');
        pic_filter = img.toDataURL('image/jpg',.5);
    });
}
var pics = [];
var makePic = function(option){
    if(option==='Map'){
        pics.push(viewer.canvas.toDataURL('image/jpg',.5));
    }else if(option==='Filters'){
        pc.mergeParcoords(function(img){
        //console.log('inside filterpic callback');
        pics.push(img.toDataURL('image/jpg',.5));
    });
    }
}

var up_step1 = function(){
    var selected = [];
    pics = [];
    d3.selectAll('.sharechoice')[0].forEach(function(choice){
        if(choice.classList.contains('selected')){
            selected.push(choice.innerHTML);
        }
    });
    if(selected.length==0){
        alert('Please choose at least one element to upload.');
        return;
    } else {
        selected.forEach(function(selection){
            makePic(selection);
        });
        d3.select('#prevShares').classed('hide',true);
        d3.select('#share1').classed('hide', true);
        d3.select('#share2').classed('hide', false);
    }
}
var imgurdata = [];
var up_step2 = function(){
    var title = d3.select('#input_title')[0][0].value;
    var desc = d3.select('#input_desc')[0][0].value;
    var numpics = pics.length;
    imgurdata = [];
    pics.forEach(function(pic){
        uploadPic(pic, title, desc);
    });
    uploadStatusWatch(numpics);
    d3.select('#share2').classed('hide',true);
    d3.select('#share_waiting').classed('hide', false);
}
var up_cancel = function(){
    pics = [];
    d3.select('#share2').classed('hide',true);
    d3.select('#share1').classed('hide',false);
    d3.select('#sharepanel').classed('hide','true');
       
}

var uploadStatusWatch = function(numpics){
    if(imgurdata.length != numpics){
        setTimeout(function(){
            // console.log('waiting for pics');
            uploadStatusWatch(numpics);
        }, 500)
    } else if(imgurdata.length==numpics){
        console.log('all imgur data appears to be here', imgurdata);
        up_step3();
    }
}
imgurdata = [{link:'fake1.png'},{link:'fake2.png'}];
var up_step3 = function(){
    //new link ids were added to prevlinks list in uploader
    setCookie('prevlinks',prevlinks.join(' '), 365);
    d3.select('#share_waiting').classed('hide',true);
    d3.select('#share3').classed('hide',false);
    var newlinks = imgurdata.map(function(data){return(data.link)});
    document.getElementById('newuploads').innerHTML = makeLinksFromList(newlinks);
    d3.select('#prevShares').classed('hide',false);
}

var makeLinksFromList = function(links){
    if(links.length===1 & links[0].length<3){
        return('no links found');
    }
    var htmlslug = [];
    links.forEach(function(link){
        var imgurlink = link;
        var markup = "<a target='_blank' href='"+imgurlink+"'>"+imgurlink+"</a>";
        htmlslug.push(markup);
    });
    return(htmlslug.join('  '));
}

//mmm, cookies
function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var prevlinks;

var populatePrevious = function(){
    prevlinks = getCookie('prevlinks').split(' ');
    //console.log('prevlinks are',prevlinks);
    document.getElementById('prevLinkList').innerHTML = makeLinksFromList(prevlinks);
}

var togglePrevPanel = function(status){
    if(typeof(status)!=='undefined'){
        //if passed explicitly, set status
        if(status==='show'){
            d3.select('#prevShares').classed('hide',false);
        } else if(status==='hide'){
            d3.select('#prevShares').classed('hide',true);
        }
    } else {
        //just toggle status if none is passed explicitly
        document.getElementById('prevShares').classList.toggle('hide');
    }
    //change text depending on status
    if(d3.select('#prevShares').classed('hide')){
        document.getElementById('showPrevLinks').innerHTML = 'Show Prior Uploads'
    } else {
        document.getElementById('showPrevLinks').innerHTML = 'Hide Prior Uploads'
    }
}

var toggleSharePanel = function(){
    document.getElementById('sharepanel').classList.toggle('hide');
    if(d3.select('#sharepanel').classed('hide')) {
        if(!d3.select('#share3').classed('hide')){
            d3.select('#share3').classed('hide',true);
            d3.select('#share1').classed('hide',false); 
               
        }
        togglePrevPanel('hide');
    } else {
        //console.log('got else');
        populatePrevious();
    }
}