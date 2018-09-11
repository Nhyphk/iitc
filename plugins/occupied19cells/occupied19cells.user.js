// ==UserScript==
// @id             iitc-plugin-occupied19cells@wintervorst
// @name           IITC plugin: L19 Cells for Ingress
// @category       Layer
// @version        0.0.1.20181109.010107
// @namespace      https://github.com/jonatkins/ingress-intel-total-conversion
// @updateURL      https://github.com/Wintervorst/iitc/raw/master/plugins/occupied19cells/occupied19cells.user.js
// @downloadURL    https://github.com/Wintervorst/iitc/
// @description    [iitc-20181109.010107] Highlights level 19 cells where portal limit is reached, in order to see where you would best submit new candidates
// @include        https://*.ingress.com/intel*
// @include        http://*.ingress.com/intel*
// @match          https://*.ingress.com/intel*
// @match          http://*.ingress.com/intel*
// @include        https://*.ingress.com/mission/*
// @include        http://*.ingress.com/mission/*
// @match          https://*.ingress.com/mission/*
// @match          http://*.ingress.com/mission/*
// @grant          none
// ==/UserScript==

var L; // to prevent script errors on load
var $; // to prevent script errors on load
var map; // to prevent script errors on load

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

//PLUGIN AUTHORS: writing a plugin outside of the IITC build environment? if so, delete these lines!!
//(leaving them in place might break the 'About IITC' page or break update checks)
  plugin_info.buildName = 'iitc';
  plugin_info.dateTimeVersion = '20181109.010107';
  plugin_info.pluginId = 'occupied19cells';
  // PLUGIN START ///////////////////////////////////////////////////////

  // use own namespace for plugin
  window.plugin.occupied19cells = function() {};      
  window.plugin.occupied19cells.cellLevel = 19;  
  window.plugin.occupied19cells.layerlist = {};	
  window.plugin.occupied19cells.possibleportallist = []; 
  window.plugin.occupied19cells.cellOptionsOccupied = {fill: true, color: 'purple', fillColor:'purple', opacity: 1, weight: 2, fillOpacity:0.30, clickable: false };
  window.plugin.occupied19cells.cellOptionsEmpty = {fill: false, color: 'orange', opacity: 0.5, weight: 2, clickable: false };
  
  window.plugin.occupied19cells.update = function() {		    
     if (!window.map.hasLayer(window.plugin.occupied19cells.cellsLayer) && !window.map.hasLayer(window.plugin.occupied19cells.occupiedCellsLayer))
     return;
                          
    if (window.map.hasLayer(window.plugin.occupied19cells.cellsLayer)) {
        window.plugin.occupied19cells.cellsLayer.clearLayers();      
     	  window.plugin.s2celldrawer.drawCellList(window.plugin.occupied19cells.cellsLayer, window.plugin.occupied19cells.cellLevel, window.plugin.occupied19cells.cellOptionsEmpty);  
    }              	       
    
    if (window.map.hasLayer(window.plugin.occupied19cells.occupiedCellsLayer)) {
			window.plugin.occupied19cells.occupiedCellsLayer.clearLayers();      
      window.plugin.occupied19cells.initPossiblePortalList();
     	window.plugin.s2celldrawer.drawCellList(window.plugin.occupied19cells.occupiedCellsLayer, window.plugin.occupied19cells.cellLevel, window.plugin.occupied19cells.cellOptionsOccupied, window.plugin.occupied19cells.getPortalsPerCellCount, "plugin-occupied19cells-name");  
    }              	       
  };            
  
  window.plugin.occupied19cells.initPossiblePortalList = function() { 
    window.plugin.occupied19cells.possibleportallist = [];
    window.plugin.occupied19cells.bounds = map.getBounds();    
    $.each(window.portals, function(i, portal) {
      var portalLatLng = portal.getLatLng();
     	if (window.plugin.occupied19cells.bounds.contains(portalLatLng)) {        
        window.plugin.occupied19cells.possibleportallist.push(portal);      
    	}
    });
  }
  
  window.plugin.occupied19cells.getPortalsPerCellCount = function(cell) {     
  	var countPerCell = 0;
  	var cellCorners = cell.getCornerLatLngs();
  	var cellPolygon = new google.maps.Polygon({paths: cellCorners}); 
    
  	$.each(window.plugin.occupied19cells.possibleportallist, function(i, portal) {
    	  if (portal != undefined) {        
  	  	  var portalLatLng = portal.getLatLng(); 
    	  	if (cellPolygon.containsLatLng(portalLatLng)) {
         		countPerCell++;
          	var indexIs = window.plugin.occupied19cells.possibleportallist.indexOf(portal);            
     				window.plugin.occupied19cells.possibleportallist.splice(indexIs, 1);
        	}
   			}
  	}); 
    
    var result = {};
    result.Show = false;    
    if (countPerCell > 0) {
      result.Show = true;
      result.Value = countPerCell;
    }       
  	
    return result;
}
  
  
  window.plugin.occupied19cells.setSelected = function(a) {        
    if (a.display) {
      var selectedLayer = window.plugin.occupied19cells.layerlist[a.name];      
      if (selectedLayer !== undefined) {
      	if (!window.map.hasLayer(selectedLayer)) {
        	  window.map.addLayer(selectedLayer);
      	}      
      	if (window.map.hasLayer(selectedLayer)) {
        	 window.plugin.occupied19cells.update();
      	}
      }      
    }
  }  

 
var setup = function() {   
  	if (window.plugin.s2celldrawer === undefined) {
       alert('S2 Celldrawer plugin is required for: L19 Cells for Ingress');
       return;
    }  	 
  	 
  
     $("<style>")
    .prop("type", "text/css")
    .html(".plugin-occupied19cells-name {\
      font-size: 14px;\
      font-weight: bold;\
      color: gold;\
      opacity: 0.7;\
      text-align: center;\
      text-shadow: -1px -1px #000, 1px -1px #000, -1px 1px #000, 1px 1px #000, 0 0 2px #000; \
      pointer-events: none;\
    }")
    .appendTo("head");         
    
    window.plugin.occupied19cells.cellsLayer = new L.LayerGroup();      	
      
    window.plugin.occupied19cells.occupiedCellsLayer = new L.LayerGroup();      	
    
    window.addLayerGroup('L19 - Ingress cells', window.plugin.occupied19cells.cellsLayer, false);                 	
    window.plugin.occupied19cells.layerlist['L19 - Ingress cells'] =  window.plugin.occupied19cells.cellsLayer;  
    window.addLayerGroup('L19 - Ingress full cells', window.plugin.occupied19cells.occupiedCellsLayer, false);                 	
    window.plugin.occupied19cells.layerlist['L19 - Ingress full cells'] =  window.plugin.occupied19cells.occupiedCellsLayer;
    window.addHook('mapDataRefreshEnd', window.plugin.occupied19cells.update);    
  
    window.pluginCreateHook('displayedLayerUpdated');
    window.addHook('displayedLayerUpdated',  window.plugin.occupied19cells.setSelected);
}
   
// PLUGIN END //////////////////////////////////////////////////////////
setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
}
// wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);