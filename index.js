'use strict';

require('shelljs/global');
var readline = require('readline');

var PORT = 5911;
var REPOS = './repos';

function serve(repos, port)
{
  var jsDAV = require('jsdav');
  jsDAV.debugMode = false;
  var jsDAV_Locks_Backend_FS = require('jsdav/lib/DAV/plugins/locks/fs');
  jsDAV.createServer({
    node: repos,
    locksBackend: jsDAV_Locks_Backend_FS.new(repos)
  }, port, '0.0.0.0');
}


function create(repos, name) {
  name += '.git';
  pushd(repos);
  exec('git init --bare ' + name);
  pushd(name);
  exec('git update-server-info');
  popd();
  popd();
  exec('ln -s ' + __dirname + '/scripts/update ' + repos + '/' + name + '/hooks/update');
}

function remove(repos, name) {
  name += '.git';
  pushd(repos);
  rm('-rf', name);
  popd();
}

function list(repos) {
  pushd(repos);
  ls();
  popd();
}

function ask(rl) {
  rl.question("giton> ", function(cmd) {
    var argv = cmd.split(' ');
    switch (argv[0]) {
      case 'create':
        create(REPOS, argv[1]);
      break;
      case 'remove':
        remove(REPOS, argv[1]);
      break;
      case 'list':
      case 'ls':
        list(REPOS);
      break;
    }
    setTimeout(ask, 0, rl);
  });
}

function shell() {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.on('close', function() {
    process.exit(0);
  })
  ask(rl);
}

function main() {
  var repos = REPOS;
  var port = PORT;
  serve(repos, port);
  setTimeout(shell, 500);
}

if (require.main === module) {
    main();
}
