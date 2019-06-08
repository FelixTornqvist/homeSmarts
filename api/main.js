const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const toggle = require('./toggle');

const port = 8080;

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

function handleApiCall(path, request, response) {
  console.log('handling api call', path);

  switch(path.shift()) {
    case 'toggle':
      toggle(path, request, response);
      break;
    default:
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write('404 Not Found\n');
      break;
  }

  response.end();
}
