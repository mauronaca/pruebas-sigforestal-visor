const express = require('express');
const http = require('http');
const https = require('https');
const path = require('path');
const request = require('request');
const bodyParser = require("body-parser");
const fs = require('fs'); 
const fetch = require('node-fetch');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const router = express();
const port = 5000;

router.use(express.json({limit : '2gb'}));
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
router.get('/sentinel', (req, res) => {
    //const tif_url = 'https://drive.google.com/u/1/uc?export?format=tif&confirm=SJ73&id=1PDIRNTlOXKxBPyVVOnKIcJSWzprYd4-k';
    const tif_url = 'https://drive.google.com/uc?id=1muX3jdwiWRhr5l17bbW36y8Mc3FShHBN&export?format=tif';
    // https://stackoverflow.com/questions/48257984/how-to-direct-download-large-file-from-google-drive-without-google-drive-cant-s
    //https://stackoverflow.com/questions/20665881/direct-download-from-google-drive-using-google-drive-api
    //https://stackoverflow.com/questions/25010369/wget-curl-large-file-from-google-drive
    // La mas esperanzadora: https://stackoverflow.com/questions/49522483/php-script-to-generate-direct-links-of-google-drive-files-skipping-virus-scan-wa
    //const tif_url = 'https://doc-10-0s-docs.googleusercontent.com/docs/securesc/ha0ro937gcuc7l7deffksulhg5h7mbp1/mpudopblkitlasvbk20ihflb58v675ad/1628816775000/08204658889783348977/*/1muX3jdwiWRhr5l17bbW36y8Mc3FShHBN';

    //fetch(tif_url)
    //.then(response => response[Object.getOwnPropertySymbols(response)[1]])
    //.then(resp => console.log(resp));

/*
    fetch("https://drive.google.com/uc?id=1PDIRNTlOXKxBPyVVOnKIcJSWzprYd4-k") // Extraigo la url que descarga el archivo.
    .then((response) => {
      return response.text();
    })
    .then((response) => {
      let regex = new RegExp('confirm=([0-9A-Za-z]+)&');
      let token = response.match(regex);
      //console.log(token[0]);
      let url = 'https://drive.google.com/uc?export=download'+'&'+token[0]+'id=1PDIRNTlOXKxBPyVVOnKIcJSWzprYd4-k';
      console.log(url);
      fetch(url)
      .then((data) => {
        console.log(data);
      })
    });
*/
    fetch(tif_url)
    .then((response) => {
      console.log(response);
      return response;
    })
    .then(response => response[Object.getOwnPropertySymbols(response)[1]])
    .then(data => data.url)
    .then((url) => {
      console.log(url)
      fetch(url)
      .then((response) => {      
        return response.buffer();
      })
      .then((buffer) => {
        res.send(buffer);
      });
    });
});

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
        var drive_request = https.get(url, (response) => {
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
        // Estaria bueno no descargar nada si ya esta el archivo, y agregar otro request que sea update, para que vuelva a descargar la imagen en caso de que hubiera una actualizacion en el link de drive.

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