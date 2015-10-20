var child_process = require('child_process'),
  http = require('http'),
  shell = require('shelljs'),
  assert = require('assert');

var REPO_BASE = './test-repos';
var REPO_HOME = './test-home';
var REPO_PORT = 5911;
var giton = false;

process.on('exit', function() {
    shell.rm('-rf', REPO_BASE, REPO_HOME);
});

function service_restart(cb, base, port) {
  base = base || REPO_BASE;
  port = port || REPO_PORT;
  if (giton) {
    giton.once('exit', function() {
      setTimeout(service_start, 100, cb, base, port);
    });
    giton.stdin.end();
    shell.rm('-rf', base, REPO_HOME);
    giton = false;
  } else {
    service_start(cb, base, port);
  }
}

function service_start(cb, base, port) {
  shell.mkdir('-p', base, REPO_HOME);
  var args = [];
  if (base) {
    args.push('-b');
    args.push(base);
  }
  if (port) {
    args.push('-p');
    args.push(port);
  }

  giton = child_process.spawn('./bin/giton', args, {
    stdio: 'pipe'
  });
  setTimeout(cb, 500);
}

function service_write(cmd, cb) {
  giton.stdin.write(cmd, function() {
    setTimeout(cb, 500);
  });
}

describe('shell', function() {
  describe('#create repo', function() {
    it('should be accessible at http://127.0.0.1:5911', function(done) {
      service_restart(function() {
        http.get('http://127.0.0.1:5911', function(res) {
          assert(res.statusCode == 200);
          done();
        });
      });
    });
    it('should create a bare git repo and can be cloned at http://127.0.0.1:5911/test.git', function(done) {
      service_restart(function() {
        service_write('create test\n', function() {
          http.get('http://127.0.0.1:5911/test.git', function(res) {
            assert(res.statusCode == 200);
            done();
          });
        });
      });
    });
    it('should clone newly created repo successfully', function(done) {
      service_restart(function() {
        service_write('create test\n', function() {
          http.get('http://127.0.0.1:5911/test.git', function(res) {
            assert(res.statusCode == 200);
            shell.pushd(REPO_HOME);
            var ret = shell.exec('git clone http://127.0.0.1:5911/test.git');
            assert(ret.code == 0);
            shell.popd();
            done();
          });
        });
      });
    });
    it('should be ok that client push commits to newly created repo', function(done) {
      service_restart(function() {
        service_write('create test\n', function() {
          http.get('http://127.0.0.1:5911/test.git', function(res) {
            assert(res.statusCode == 200);
            shell.pushd(REPO_HOME);
            var ret = shell.exec('git clone http://127.0.0.1:5911/test.git');
            assert(ret.code == 0);
            shell.pushd('test');
            ret = shell.exec('echo abc > abc && git add abc && git commit -am "initial import" && git push');
            assert(ret.code == 0);
            shell.popd();
            shell.popd();
            done();
          });
        });
      });
    });
    it('should remove created repo', function(done) {
      this.timeout(5000);
      service_restart(function() {
        service_write('create test\n', function() {
          http.get('http://127.0.0.1:5911/test.git', function(res) {
            assert(res.statusCode == 200);
            service_write('remove test\n', function() {
              http.get('http://127.0.0.1:5911/test.git', function(res) {
                assert(res.statusCode == 404);
                done();
              })
            });
          });
        });
      });
    });
  })
});
