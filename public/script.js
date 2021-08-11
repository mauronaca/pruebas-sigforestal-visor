
var popup_layer = new L.layerGroup();

var MySource = L.WMS.Source.extend({
    'showFeatureInfo' : function(latlng, info){
      $('.leaflet-container').css('cursor', 'progress');
      if(!this._map){
        console.log('sin mapa');
        $('.leaflet-container').css('cursor', 'grab');
        return; 
      }

      console.log('Chequeo de info...');
      console.log(info[0]);
      if(info[0] != '<'){
        if(info != 'no features were found\n\r' && info != 'no features were found\n' && info != "no features were found\r\n"){
          var popup = new L.popup();
          popup.setLatLng(latlng);
          popup.setContent(info);
          popup.openOn(map);
          //popup_layer.addLayer(popup);
          //this._map.openPopup(info, latlng);  
        }
        $('.leaflet-container').css('cursor', 'grab');
      } else {
        console.log('Info en formato iframe');
        console.log(info);
        var json_url = {url : info.slice(info.indexOf("'")+1,info.indexOf("' style='border:none'"))}; 

        console.log('Fetch:');
        function getBodyContent(){
          return fetch('./get', {
            method : 'POST',
            headers : {
              'Content-Type' : 'application/json'
            },
            body : JSON.stringify(json_url)
          })
          .then((response) => {
            console.log('Primera rta.');
            return response.json();
          })
          .then((response) => {
            console.log('Segunda rta.');
            return response.answer;
          });
        }

        getBodyContent()
        .then((res) => {
          console.log('3era rta');
          console.log(res);
          if(res != 'no features were found\n\r' && res != 'no features were found\n' && info != "no features were found\r\n"){
            var popup = new L.popup();
            var text = "<p>"+res+"</p>"
            console.log('Abropopup');
            popup.setLatLng(latlng).setContent(text).openOn(map);
            //popup_layer.addLayer(popup);
            //debugger;
            //this._map.openPopup(info, latlng);
          }
        })
        .then(()=> {
          $('.leaflet-container').css('cursor', 'grab');
        });
      }
      
      return;
    }
});

var provinciaSource = L.WMS.source('https://wms.ign.gob.ar/geoserver/ows', {
  'transparent' : true,
  'identify' : false, // Deshabilito la consulta de datos 
  'format': 'image/png',
  'tiled': true
}).getLayer('ign:provincia');
  
var departamentoSource = new MySource('https://wms.ign.gob.ar/geoserver/ows', {
  'transparent' : true,
  'identify' : true,
  'format' : 'image/png',
  'tiled' : true
}).getLayer('ign:departamento');

var magypSource = new MySource('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
  'transparent' : true,
  'identify' : true,
  'format' : 'image/png',
  'tiled' : true
});

var macizos = new MySource('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
  'transparent' : true,
  'identify' : true,
  'format' : 'image/png',
  'tiled' : true
}).getLayer('dpf:macizos_forestales_publicacion');
var puntos = new MySource('https://geoforestal.magyp.gob.ar/geoserver/dpf/wms', {
  'transparent' : true,
  'identify' : true,
  'format' : 'image/png',
  'tiled' : true
}).getLayer('dpf:puntos_registfor');

var argenMapSource = L.WMS.source('https://wms.ign.gob.ar/geoserver/ows', {
  'transparent' : true,
  'identify' : false,
  'format' : 'image/png',
  'tiled' : true
});

var topoSource = L.WMS.source('http://ows.mundialis.de/services/service', {
  'transparent' : true,
  'identify' : false, // Deshabilito la consulta de datos 
  'format': 'image/png'
});

const baseMaps = {
  'OSM' : L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }),
  'SRTM30-Colored' : topoSource.getLayer('SRTM30-Colored'),
  'ArgenMap' : argenMapSource.getLayer('capabaseargenmap')
};

const baseLayers = {
  'Provinciales' : provinciaSource,
  'Departamentos' : departamentoSource,
  'Puntos' : puntos,
  'Macizos' : macizos,
  'Focos de Calor' : new MySource('https://geoservicios.conae.gov.ar/geoserver/GeoServiciosCONAE/wms', {
    'transparent' : true,
    'identify' : true,
    'format' : 'image/png',
    'tiled' : true
  }).getLayer('informacion_satelital')
};

var map = new L.map('map',{layers : baseMaps['OSM']}).setView([-34.645306, -58.357787], 4);
map.createPane('geotif-pane');
map.getPane('geotif-pane').style.zIndex = 650;
L.control.layers(baseMaps, baseLayers).addTo(map);
//popup_layer.addTo(map);

// Get al server para obtener el archivo .tif
fetch('./geotif')
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    parseGeoraster(arrayBuffer).then(georaster => {
      console.log("georaster:", georaster);

      var layer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 0.5,
          resolution: 256,
          pane : 'geotif-pane'
      });
      layer.addTo(map);
      //map.fitBounds(layer.getBounds()); // Para que el mapa vaya a la ubicacion en donde se creo la capa.
  });
});

/*
Framework viejo
const plottyRenderer = L.LeafletGeotiff.plotty({
  displayMin: 0,
  displayMax: 15,
  clampLow: true,
  clampHigh: true,
});

const rast_file = "./images/file.tif";
const renderer = L.LeafletGeotiff.rgb();


const options = {
  // Optional, band index to use as R-band
  rBand: 0,
  // Optional, band index to use as G-band
  gBand: 1,
  // Optional, band index to use as B-band
  bBand: 2,
  // band index to use as alpha-band
  // NOTE: this can also be used in combination with transpValue, then referring to a
  // color band specifying a fixed value to be interpreted as transparent
  alphaBand: 0,
  // for all values equal to transpValue in the band alphaBand, the newly created alpha
  // channel will be set to 0 (transparent), all other pixel values will result in alpha 255 (opaque)
  transpValue: 0,
  renderer: renderer
};

// create layer
var layer = L.leafletGeotiff(rast_file, options).addTo(map);


// Cosas de prueba
//var test_marker = new L.marker([-34, -58]).addTo(map);
//var test_popup = new L.popup();

//test_popup.setContent('<p>Hola</p>');
//test_marker.bindPopup(test_popup).openPopup();

// https://github.com/GeoTIFF/georaster-layer-for-leaflet/issues/24
*/