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

function minutePassed() {
  let outlets = JSON.parse(
    fs.readFileSync(__dirname + '/../app/outlet_settings.json')
  );

  const now = nowInMinutes();

  for (let outletIndex in outlets) {
    let outlet = outlets[outletIndex];

    for (let eve of outlet.events) {
      if (eve.time == now) {
        console.log('event:', eve, new Date());
        toggle.toggle(outletIndex, eve.on);
      }
    }
  }

  timeout = setTimeout(minutePassed, timeTillNextMinute());
}

module.exports = {init};
