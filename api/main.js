const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const toggle = require('./toggle');
const timer = require('./timer');

const port = 8080;

// init stuff
timer.init();

http.createServer((request, response) => {
  const uri = url.parse(request.url).pathname
  
  if (uri.includes('..')) {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.write("404 Not Found\n");
    response.end();
    return;
  }
  if (uri.startsWith('/api')) {
    let apiUri = uri.split('/');
    apiUri.shift();
    apiUri.shift();
    handleApiCall(apiUri, request, response);
    return;
  }

  let filename = __dirname + '/../app' + uri;
  console.log('getting file', filename);

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      response.writeHead(200);
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(port);

function collectRequestData(request, callback) {
  let body = '';
  request.on('data', chunk => {
    body += chunk.toString();
  });
  request.on('end', () => {
    callback(JSON.parse(body));
  });
}

function handleApiCall(path, request, response) {
  console.log('handling api call', path);

  collectRequestData(request, body => {

    try {
      switch(path.shift()) {
        case 'toggle':
	        toggle.handleApiCall(path, body, response);
          break;
        default:
          response.writeHead(404, {"Content-Type": "text/plain"});
          response.write('404 Not Found\n');
          response.end();
          break;
      }
    } catch (err) {
      response.writeHead(500, {"Content-Type": "text/plain"});
      reposnse.write('500 Internal server error: ' + err);
      response.end();
    }
  });

}
