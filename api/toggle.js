const { spawn } = require('child_process');

function handleApiCall(path, message, response) {
  toggle(message.outlet, message.on);

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write(JSON.stringify({outlet: message.outlet, on: message.on}));
  response.end();
}

function toggle(outlet, on) {
  const command = `${__dirname}/../toggle.sh`;
  const args = [outlet, (on ? 'on':'off')];
  const proc = spawn(command, args);

  proc.stdout.on('data', chunk => {
    console.log('toggle command output: ', chunk.toString());
  });
}

module.exports = {
  handleApiCall,
  toggle,
};
