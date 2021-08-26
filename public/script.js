
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
  'Macizos': macizos,
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
var layerControl = L.control.layers(baseMaps, baseLayers).addTo(map);
//popup_layer.addTo(map);

var url_areas_quemadas = 'https://www.googleapis.com/drive/v3/files/1muX3jdwiWRhr5l17bbW36y8Mc3FShHBN?alt=media&key=AIzaSyBhSGIwj5fl4ycbAIdpKAu619mKrONbBSg';
var sentinel = 'https://www.googleapis.com/drive/v3/files/1PDIRNTlOXKxBPyVVOnKIcJSWzprYd4-k?alt=media&key=AIzaSyBhSGIwj5fl4ycbAIdpKAu619mKrONbBSg';
var url_euca = 'https://www.googleapis.com/drive/v3/files/1T_7bQmLxmDqDt4uAKXuEhkUlYc4SMs6A?alt=media&key=AIzaSyBhSGIwj5fl4ycbAIdpKAu619mKrONbBSg';
var url_aws_prueba = 
'https://s3-us-west-2.amazonaws.com/planet-disaster-data/hurricane-harvey/SkySat_Freeport_s03_20170831T162740Z3.tif';
var url_prueba_landsat = 
'https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF';
var open_aerial_sample = 
'https://oin-hotosm.s3.amazonaws.com/59c66c5223c8440011d7b1e4/0/7ad397c0-bba2-4f98-a08a-931ec3a6e943.tif';
var url_huracanes_prueba = 'https://storage.googleapis.com/pdd-stac/disasters/hurricane-harvey/0831/20170831_172754_101c_3B_AnalyticMS.tif';

var sentinel_concordia_B3 = 'https://www.googleapis.com/drive/v3/files/1juDcZnXFJIifGW45mydcMLTEGRNgCgl0?alt=media&key=AIzaSyCNxw7IdcBM7jmgCqIPPftaOlBP633k0GM'
var sentinel_concordia_B11 = 'https://www.googleapis.com/drive/v3/files/1PPsbGLwGYQksBFalx4bRiE_a_kHgwvOv?alt=media&key=AIzaSyCNxw7IdcBM7jmgCqIPPftaOlBP633k0GM'
var sentinel_concordia_B8 = 'https://www.googleapis.com/drive/v3/files/1gCENjOAfDkoCmAJOilK3j5wzTRyU0Nu8?alt=media&key=AIzaSyCNxw7IdcBM7jmgCqIPPftaOlBP633k0GM'

// -- Metodo para levantar imagen TIF liviana, anda perfecto, hay que retocarle los colores creo ---
fetch(url_areas_quemadas)
  .then(response => response.arrayBuffer())
  .then(arrayBuffer => {
    parseGeoraster(arrayBuffer).then(georaster => {
      console.log("georaster:", georaster);

      const min = georaster.mins[0];
      const max = georaster.maxs[0];
      const range = georaster.ranges[0];

      var layer = new GeoRasterLayer({
          georaster: georaster,
          opacity: 1,
          pixelValuesToColorFn: function(value){
            var scale = chroma.scale([chroma('white').alpha(0), 'yellow', 'red']);
            var scaledPixel = (value - min) / range;
            return scale(scaledPixel).hex();
          },
          resolution: 256,
          pane : 'geotif-pane'
      });
      //layer.addTo(map);

      var svg = "<i class='bi bi-tree-fill'></i>";
      layerControl.addOverlay(layer, '<b>Areas Quemadas</b>'+svg);
      //map.fitBounds(layer.getBounds()); // Para que el mapa vaya a la ubicacion en donde se creo la capa.
    });
  });

// --- Metodo para levantar las imagenes pesadas > 100Mb. No anda bien, hay que cambiar las opciones
parseGeoraster(url_aws_prueba).then(georaster => {
  
    const resolution = 512;
    var layer = new GeoRasterLayer({
      georaster: georaster,
      attribution: "Planet",
      //pixelValuesToColorFn: pixelValuesToColorFn,
      resolution: resolution,
      pane : 'geotif-pane'
    });
    //layerControl.addOverlay(layer, '<b>TIF pesado</b>');
    layer.addTo(map);
    layerControl.addOverlay(layer, '<b>SkySat</b>');
    //map.fitBounds(layer.getBounds());
});

      const baseURL = "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B.TIF";
      const band4URL = baseURL.replace('B.TIF', 'B4.TIF');
      const band3URL = baseURL.replace('B.TIF', 'B3.TIF');
      const band2URL = baseURL.replace('B.TIF', 'B2.TIF');
      const scale = chroma.scale([
        '#C7BB95',
        '#FEFEE1',
        '#6E9F62',
        '#032816',
        'black'
      ]).domain([
        0,
        .2,
        .4,
        .6,
        .8
      ]);
      Promise.all([
        parseGeoraster(band4URL),
        parseGeoraster(band3URL),
        parseGeoraster(band2URL)
      ]).then(georasters => {
        var pixelValuesToColorFn = values => {
          const [ RED, GREEN, BLUE ] = values;
          //console.log(values);
          if(RED !== 0 && GREEN !== 0 && RED !== 0){
            const r = Math.round(RED / 65536 * 255 * 2.55);
            const g = Math.round(GREEN / 65536 * 255 * 2.55);
            const b = Math.round(BLUE / 65536 * 255 * 2.55);
            const rgba =  `rgba(${r},${g},${b}, 0.75)`;
            return rgba;
          } else {
            return 0;
          }
        };
        var layer = new GeoRasterLayer({
          georasters,
          pixelValuesToColorFn,
          resolution: 128,
          pane : 'geotif-pane'
        });
        layer.addTo(map);
        layerControl.addOverlay(layer, '<b>Landsat Sample 2</b>');
        //map.fitBounds(layer.getBounds());
      });

      
      Promise.all([
        parseGeoraster(sentinel_concordia_B8),
        parseGeoraster(sentinel_concordia_B11),
        parseGeoraster(sentinel_concordia_B3),
      ]).then(georasters => {
        var pixelValuesToColorFn = values => {
          const [ VNIR, GREEN, SWIR ] = values;
          //console.log(values);
          const r = Math.round(VNIR / 65536 * 255 * 2.55);
          const g = Math.round(GREEN / 65536 * 255 * 2.55);
          const b = Math.round(SWIR / 65536 * 255 * 2.55);
          const rgba =  `rgba(${r},${g},${b}, 0.75)`;
          return rgba
        };
        var layer = new GeoRasterLayer({
          georasters,
          pixelValuesToColorFn,
          resolution: 128,
          pane : 'geotif-pane'
        });
        //layer.addTo(map);
        layerControl.addOverlay(layer, '<b>Sentinel</b>');
        //map.fitBounds(layer.getBounds());
      });

/*
parseGeoraster(sentinel_concordia_B3).then(georaster => {
    console.log("georaster:", georaster);
      
    const { noDataValue } = georaster;
    var pixelValuesToColorFn = function (values) {
    if (
      values.some(function (value) {
        return value === noDataValue;
      })
      ) {
        return "rgba(0,0,0,0.0)";
      } else {
        const [r, g, b] = values;
        return `rgba(${r},${g},${b},.85 )`;
      }
    };
    const resolution = 64;
    var layer = new GeoRasterLayer({
      georaster: georaster,
      attribution: "Planet",
      pixelValuesToColorFn: pixelValuesToColorFn,
      resolution: resolution,
      pane : 'geotif-pane'
    });
    //layer.addTo(map);
    layerControl.addOverlay(layer, '<b>Sentinel</b>');
    map.fitBounds(layer.getBounds());
});
*/
//var test_marker = new L.marker([-34, -58]).addTo(map);
//var test_popup = new L.popup();

//test_popup.setContent('<p>Hola</p>');
//test_marker.bindPopup(test_popup).openPopup();

// Agregar capas de google: https://gitlab.com/IvanSanchez/Leaflet.GridLayer.GoogleMutant

