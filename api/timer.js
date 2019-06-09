const fs = require('fs');
const toggle = require('./toggle');

let timeout = 0;

function init() {
  timeout = setTimeout(minutePassed, timeTillNextMinute());
}

function timeTillNextMinute() {
  return (60 - new Date().getSeconds()) * 1000;
}

function nowInMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

function readOutletsFile() {
  return JSON.parse(
    fs.readFileSync(__dirname + '/../app/outlet_settings.json')
  ); 
}

function writeOutletsFile(toWrite) {
  fs.writeFileSync(
    __dirname + '/../app/outlet_settings.json',
    toWrite
  );
}

function minutePassed() {
  let outlets = readOutletsFile();

  const now = nowInMinutes();

  for (let outletIndex in outlets) {
    let outlet = outlets[outletIndex];

    for (let eve of outlet.events) {
      if (eve.time == now) {
        console.log('event:', outletIndex, eve, new Date());
        toggle.toggle(outletIndex, eve.on);
      }
    }
  }

  timeout = setTimeout(minutePassed, timeTillNextMinute());
}


function handleApiCall(path, body, response) {
  const outlets = readOutletsFile();

  if (body.events.length != outlets.length) {
    throw Error('outlet arrays do not match in length');
  }

  const toWrite = JSON.stringify(body.events);
  writeOutletsFile(toWrite);

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write('success');
  response.end();

}
  
module.exports = {
  init,
  handleApiCall,
};
