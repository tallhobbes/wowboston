var pc,fulldata,subdata,brushdata, range;
var dims = {};

var	alldims = {
	"zip_prop_txt":{
		axtype:'test',
		scaletype:'ordinal',
		title:'[P] Zip Code',
		num_tics:10,
	},
	'AV_TOTAL':{
		title:'[P] Value - Overall',
	},
	'AV_LAND':{
		title: '[P] Value - Land',
	},
	'AV_BLDG':{
		title: '[P] Value - Building'
	},
	'zip_own_num':{
		title:'[O] Zip Code',
		ticks: 10,
		tickFormatCode: [20,'05'],
	},
	'MAILING_NEIGHBORHOOD':{
		title: '[P] Neighborhood',
		scaletype: 'ordinal',
		flipscale: true
	},
	'LAND_SF':{
		title: '[P] Parcel Area (ft2)'
	},
	'PropType':{
		title:'[P] Type - General',
		scaletype: 'ordinal',
		flipscale: true,

	},
	'LU_type':{
		title:'[P] Type - Detailed',
		scaletype:'ordinal',
		flipscale: true
	},
	'dist_mi':{
		title: '[P] to [O] Distance (mi)',
	},
	'YR_BUILT':{
		title:'[P] Year Built'
	},
	'view':{
		title:'[P] View Rating',
		scaletype: 'ordinal'
	},
	'own_num_owned':{
		title:'[O] Total # Properties'
	},
	'own_av_land':{
		title:'[O] Total Value - Land'
	},
	'own_av_bldg':{
		title:'[O] Total Value - Buildings'
	},
	'own_av_total':{
		title:'[O] Total Value - Overall'
	},
	'own_name':{
		title: '[O] Name',
		scaletype: 'ordinal',
		num_tics: 10,
		flipscale: true,
		char_lim: 21
	}
}

var defaultFilters = ['MAILING_NEIGHBORHOOD','PropType','AV_TOTAL','own_num_owned','own_av_total'];
//var defaultFilters = d3.keys(alldims).slice(0,5);

defaultFilters.forEach(function(key){
	dims[key] = alldims[key];
})
//dims = alldims; 

var selectDims = function(newDims, cb){
	var currentDims = d3.keys(dims);
	var oldDims = currentDims;
	//treat selected list as to-add list
	//eliminate selected variables that are already in dims
	async.eachSeries(currentDims, function(dim, callback){
		var index = newDims.indexOf(dim);
		if(index > -1){
			//if selected dim is already present in graphed dims, eliminate from to-add list
			newDims = newDims.slice(0,index).concat(newDims.slice(index+1, newDims.length));
			//as well as from to-delete list
			var oldIndex = oldDims.indexOf(dim);
			oldDims = oldDims.slice(0,oldIndex).concat(oldDims.slice(oldIndex+1, oldDims.length));
		}
	callback(null);
	},
	function(){
		//console.log(newDims, oldDims);
		oldDims.forEach(function(dim){
			delete dims[dim];
		});

		newDims.forEach(function(dim){
			dims[dim] = alldims[dim];
		});
	});

	//console.log(dims);
	cb(dims);
}

var redrawDims = function(dimset){
	//console.log(dimset);
	dims = dimset;
	pc.data(subdata)
		.dimensions(dimset);
	modifyScales(subdata);
	pc.render()
		.brushMode('1D-axes')
		.updateAxes(50);
}

var updateDims = function(selected){
	//console.log('list in update dims from panel is: ', selected);
	selectDims(selected, redrawDims);
}

//random sampling to see if column is numbers stored as strings
var numberCheck = function(data, key, n, threshold){
	var n2 = n;
	//console.log(n2);
	var score = 0;
	for(var i=0; i<n2; ++i){
		console.log(i);
		var i2 =  Math.floor(Math.random() * data.length);
		console.log(i2);
		var thingy = data[i2][key];
		console.log(thingy);
		if(!isNaN(data[i2][key])){
			score++;
		}
	}
	console.log('score is '+score);
	return((score/n)>threshold); 
}

var modifyScales = function(data){
	d3.keys(dims).forEach(function(dim){
		var newdomain;
		//shortcut to this dimension (whoah..)
		var thisdim = dims[dim]; 
		//if scaletype isn't set, default to linear
		var scaletype = (typeof(thisdim.scaletype)==='undefined' ? 'linear' : thisdim.scaletype);
		//set domains for type: if linear: min and max; if ordinal: all levels;
		if(scaletype==='linear'){
			newdomain = d3.extent(data, function(d){return +d[dim]});
			//console.log(dim+newdomain);
		} else {
			newdomain = d3.map(data, function(d){return d[dim];}).keys().sort();
			if(thisdim.flipscale) newdomain = newdomain.reverse();
			//console.log(newdomain);
		}
		//console.log(dim+newdomain);
		////Setting variables
		//if no yscale present, create one
		if(typeof(thisdim.yscale)==='undefined'){
			//console.log('creating new yscale '+dim+' '+scaletype);	
			thisdim.yscale = d3.scale[scaletype]().domain(newdomain);
			if(scaletype=='linear'){
				thisdim.yscale.range([349,4]);
				//console.log(dim, newdomain);
			} else {
				thisdim.yscale.rangePoints([349,4]);
			}
		} else {
			if(scaletype==='linear'){
				if(newdomain[0]===newdomain[1]){
					thisdim.tickValues = [newdomain[0]];
					newdomain[0] = newdomain[0]-10;
					newdomain[1] = newdomain[1]+10;
				}else{
					thisdim.tickValues = null;
				}
			}
			thisdim.yscale.domain(newdomain)

		};
		//if tickFormatCode exists, set it
		if(typeof(dims[dim].tickFormatCode)!=='undefined'){
			var code = dims[dim].tickFormatCode;
			//console.log(code);
			dims[dim].tickFormat = dims[dim].yscale.tickFormat(code[0],code[1]);
			//dims[dim].tickFormat = dims[dim].yscale.tickFormat(d3.format('05f0'));
		} else {
			//console.log('updating existing scale')
			dims[dim].yscale.domain(newdomain)
			if(scaletype==='ordinal'){
				thisdim.tickValues = (newdomain.filter(function(d,i){
					return(!(i%Math.floor(newdomain.length/10)))
				}));
			}

			//console.log('tickvalues are',thisdim.yscale.tickValues);
		}
	});

};


var enhance = function(d){
	if(typeof(d)==='undefined'){
		console.log('undefined d');
	}
	subdata = d;
	pc.data(d);
	modifyScales(d);
	pc.render();
	pc.updateAxes(100);
}
//var pc = d3.parcoords({nullValueSeparator:'bottom'})('#parchart');

var renderPar = function(data){
	fulldata = subdata = data;
	//console.log(data[0]);
	modifyScales(data);

	// pc = d3.parcoords({nullValueSeparator:'bottom'})('#parchart')
	pc.data(data)
		.alpha(.3)
		.mode('queue')
		.dimensions(dims)
		.render()
		.brushMode('1D-axes')
		.reorderable()
		.on('brush', function(d){
			setEntityStat('sel',d.length);
		})
		.on('brushend', function(d){
			//console.log('NumSelected = '+d.length.toString());
			brushdata = d;
			var links = d.map(function(d2){return(d2.linkID)});
			//console.log('d and full lengths are:', d.length, fulldata.length);
			if(!(d.length == fulldata.length)){
				if(auto.render){
					showLinks(links);
				}
			}else{
				setEntityStat('sel',0);
			}
			
	})
}


var runParChart = function(){
	pc = d3.parcoords({nullValueSeparator:'bottom'})('#parchart')
		.rate(300);
  range = pc.height() - pc.margin().top - pc.margin().bottom;
  //console.log(range);
	
	// d3.csv('../data/lilparallel.csv', function(data){
	d3.csv('//bostondata2.azureedge.net/bostondata/data/rental_filters.csv', function(data){
		renderPar(data);
	});
}

var pauseParChart = function(seconds){
    var prevrate = pc.rate()
    if(typeof(prevrate)==='number'){
        //console.log('prevrate is', prevrate);
        pc.rate(1);
        setTimeout(function(){pc.rate(prevrate)},seconds*1000);

    } else {
        //console.log('got else');
        if(seconds > 0){
            setTimeout(function(seconds){pausePC(seconds-.01)}, 10);
        }
    }
}

