////Cesium setup stuff
var noselect = false;
var viewer, dataSource, arcs, linematerial, steps, pauseTime;
var link_dict = [];
var renderDone = {};
var basemapProvider = new Cesium.UrlTemplateImageryProvider({
    url: 'http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    credit: 'Basemap courtesy of CartoDB'
});
Cesium.InfoBoxViewModel.defaultSanitizer = function(rawHtml) {
    return rawHtml;
};


var runCesium = function(){
    viewer = new Cesium.Viewer("cesiumContainer", {
    timeline: false,
    animation: false,
    baseLayerPicker: false, // Only showing one layer in this demo
    //useDefaultRenderLoop : false,
    //homeButton:false,
    fullscreenButton: false,
    geocoder: false,
    selectionIndicator: false,
    infoBox: false,
    sceneModePicker: false,
    navigationHelpButton: true,
    imageryProvider: basemapProvider,
    navigationInstructionsInitiallyVisible: false,
    skyAtmosphere: false,
    scene3DOnly: true
  	});
    viewer.scene.globe.enableLighting = false;


    var terrainProvider = new Cesium.CesiumTerrainProvider({
        url: '//assets.agi.com/stk-terrain/world',
        credit: '',
        requestWaterMask: true
    });
    //viewer.terrainProvider = terrainProvider;

    viewer.scene.globe.depthTestAgainstTerrain = false;

    viewer.scene.frameState.creditDisplay._imageContainer.style.display = 'none';
    viewer.scene.frameState.creditDisplay._textContainer.style.display = 'none';

    linematerial = new Cesium.PolylineArrowMaterialProperty(Cesium.Color.WHITE.withAlpha(.3))

}
var test;
////need to chain resetting entities, showing what's there, and creating what's not
//total function
////async version
var showLinks = function(linkIDs){
	async.waterfall([
		async.constant(linkIDs),
		sortEntities,
		findEntitiesToCull,
		cullEntities,
    showEntities,
		createEntities
		]);
  setTimeout(function(){viewer.flyTo(viewer.entities)}, 1000);
}
//take requested list of links and sort into present and missing links
var sortEntities = function(linkIDs,cb){
	//enforce entity limit 
	var entlim = getEntityStat('lim');
	if (linkIDs.length>entlim){
		linkIDs = linkIDs.slice(0,entlim);
		//console.log(linkIDs);
	} 
  setEntityStat('disp', linkIDs.length);
	var missingLinks = [];
	var currentLinks = [];
	//determine which are already in entity list
	//console.log(linkIDs);
  linkIDs.forEach(function(link){
  		var ent = viewer.entities.getById(link);
      if(typeof(ent)!='undefined'){
      	//ent.show=true;
      	currentLinks.push(link);
      } else {
      	missingLinks.push(link);
      }
  });
  cb(null, linkIDs, currentLinks, missingLinks);    
}
//look through currently stored entities to find which can be eliminated
var findEntitiesToCull = function(linkIDs, currentLinks, missingLinks, cb){
  var cullLinks = [];   
	var cullNum = missingLinks.length + viewer.entities.values.length - getEntityStat('lim');
  if(cullNum>0){
    var entIndex = viewer.entities.values.length;
    for(i = 0; i < entIndex; i++){
      //if after loop there are still more culls needed
      if(cullNum>0){
        //if the current created entity does not appear in the list of the ones we want
        if(currentLinks.indexOf(viewer.entities.values[i].id)==-1){
          //push it to the cull ids list and reduce the number we need to cull
          cullLinks.push(viewer.entities.values[i].id);
          cullNum -= 1;
        }
      } 
    }
  }
	cb(null, cullLinks, currentLinks, missingLinks);
}

var cullEntities = function(cullLinks, currentLinks, missingLinks, cb){
  cullLinks.forEach(function(link){
    viewer.entities.removeById(link);
  });

  //console.log('missing links length is: ',missingLinks.length);
	cb(null, currentLinks, missingLinks);
}
var checkLength = function(linkIDs){
	console.log('checking length');
	var status = (linkIDs.length + viewer.entities.values.length)>getEntityStat('lim');
	console.log('culling necessary? ', status);
	return(status);
}

var showEntities = function(currentLinks, missingLinks, cb){
  var needToShow = currentLinks.length;
  var entIndex = viewer.entities.values.length;
  for(var i =0; i< entIndex; i++){
    if(needToShow>0){
      if(currentLinks.indexOf(viewer.entities.values[i].id)>-1){
        //entity needs to be shown
        viewer.entities.values[i].show = true;
        needToShow -= 1;
      } else {
        //current entity needs to be hidden
        viewer.entities.values[i].show = false;
      }
    } else {
      //no more links need to be shown, auto hide link
      viewer.entities.values[i].show = false;
    }
  }
  cb(null, missingLinks);
}



//batch creation
var createEntities = function(linkIDs){
  console.log('entities.length is ',viewer.entities.values.length);
  //console.log('current entities are:', viewer.entities.values);
	console.log('new entities length is:',linkIDs.length);
	linkIDs.forEach(function(linkID){
		createEntity(linkID);
	});
}  
var stopCreation = false;
//one-off creation
var createEntity = function(linkID){
  if(stopCreation){
    return(null);
  }
	//console.log('creating entity??')
	var d = link_dict[linkID];
	['x_own','y_own','x_mid','y_mid','x_prop','y_prop','dist'].forEach(function(val){
		d[val] = parseFloat(d[val]);
	});
  //var mid_x = (parseFloat(d.x_prop)+parseFloat(d.x_own))/2;
  //var mid_y = (parseFloat(d.y_prop)+parseFloat(d.y_own))/2;
  var mid_z = parseFloat(d.dist)*10000 + 20;

  //var showit = i<showlimit;
  //console.log(i+showit);
  //var d = link_dict[linkID];
  if(typeof(d.linkID)==='undefined'){
    console.log('got null id')
    return(null);
  }
  viewer.entities.add({
      id: d.linkID,
      position : Cesium.Cartesian3.fromDegrees(d.x_prop, d.y_prop, 0),
      polyline : {
          positions: [
          Cesium.Cartesian3.fromDegrees(d.x_prop, d.y_prop, 0),
          Cesium.Cartesian3.fromDegrees(d.x_mid, d.y_mid, mid_z),
          Cesium.Cartesian3.fromDegrees(d.x_own, d.y_own, 0)
          ],
          width: 5,
          material: linematerial,
          followSurface : new Cesium.ConstantProperty(true),
          //show: true
      },
      show: true,

  });
}

var createLinkDict = function(){
	//console.log('creating link dict');
  var report = function(){
    console.log('linkDict done');
  }
	d3.csv('//bostondata2.azureedge.net/bostondata/data/rental_links.csv', function(data){
		//console.log(data[0]);
		data.forEach(function(d,i){
			if(i<30){
				//console.log(d.linkID);
			}
			link_dict[d.linkID] = d;
		});
	});
}


renderDone.reset = function(){
	renderDone.state = false;
	renderDone.completes = 0;
}
renderDone.update = function(){
  //console.log('rendered');
	renderDone.state = true;
}
renderDone.cb = function(renders, cb){

	async.whilst(
    function(){return renderDone.completes > 10 },
    function(callback){    
      if(renderDone.state === true){
        console.log('renders done: ',renderDone.completes);
        renderDone.completes +=1;
        renderDone.state = false;
        callback(null, renderDone)
      } else{
        console.log('no render info');
        setTimeout(function(){callback(null, renderDone)},10);
      }
      
    },
    function(err){
      console.log('whilst function is firing!',renderDone.completes);
      cb();
    }
  );
}

var delTest = function(){
  async.waterfall([
  function(cb){
    var ids = viewer.entities.values.map(function(v){return v.id});
    console.log('ids length is ', ids.length);
    ids.forEach(function(id){
      viewer.entities.removeById(id);
    })
    cb(null, ids)
  },
  function(){
    console.log('afterwards entity length is:', viewer.entities.values.length);
  }]);
}