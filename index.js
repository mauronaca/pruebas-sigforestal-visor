const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const request = require('request');
const bodyParser = require("body-parser");
const fs = require('fs'); 
const fetch = require('node-fetch');

const router = express();
const port = 5000;

router.use(express.json({limit : '100mb'}));
router.use(express.static(path.join(__dirname, '/public')))

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

/*
router.get('/download-tif', (req, res) => {
  // Creo la imagen vacia
  const tif_file =  fs.createWriteStream('./public/images/file.tif');
  const url = "";
  // Request a google drive
  const drive_req = https.get(url, (response) =>{
    console.log('Response');
    console.log((response));

    response.pipe(tif_file);
    tif_file.on('finish', () => {
      tif_file.close()
    }).on('error', (error) => {
      console.log(error);
      fs.unlink(tif_file);
    });
  });
  
  res.send('Hola');

});
*/

router.get('/geotif', (req, res) => {
    const tif_url = 'https://drive.google.com/uc?id=1muX3jdwiWRhr5l17bbW36y8Mc3FShHBN&export?format=tif';
    fetch(tif_url) // Extraigo la url que descarga el archivo.
    .then(response => response[Object.getOwnPropertySymbols(response)[1]])
    .then(data => data.url)
    .then((url) => {
        var tif_file = fs.createWriteStream('./public/images/tif_file.tif');
        tif_file.on('error', () => {
            console.log('Se produjo un error');
            console.log(error);
        });
        // Estaria bueno no descargar nada si ya esta el archivo, y agregar otro request que sea update, para que vuelva a descargar la imagen en caso de que hubiera una actualizacion en el link de drive.
        var  drive_request = https.get(url, (response) => {
            response.pipe(tif_file);
            tif_file.on('finish', ()=>{
                console.log('Done downloading tif file from '+ url);
                res.sendFile(path.join(__dirname, '/public/images/tif_file.tif'));
            });
            tif_file.on('error', () => {
                console.log(error);
            })
        });
    });
});

router.post('/get', (req, res) => {
    router.use(bodyParser.json());
    var data = "";
    var url = req.body.url;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            data = body;
            res.json({ 
                status : 'success',
                answer : data 
            });
        }
    });
});

router.listen(port, function(){
    console.log("app running on port 5000");
});

// https://drive.google.com/uc?id=1muX3jdwiWRhr5l17bbW36y8Mc3FShHBN&export?format=tif
// Link