const { spawn } = require('child_process');

function toggle(path, message, response) {
  const command = `${__dirname}/../toggle.sh`;
  const args = [message.outlet, (message.on ? 'on':'off')];
  const proc = spawn(command, args);

  proc.stdout.on('data', chunk => {
    console.log('toggle command output: ', chunk.toString());
  });

  response.writeHead(200, {"Content-Type": "text/plain"});
  response.write(JSON.stringify({outlet: message.outlet, on: message.on}));
  response.end();
}

module.exports = toggle;
