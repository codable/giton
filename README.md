Git On
======

A simple git server based on jsDAV to host multiple git repositories.


USAGE
-----

### Create instance

    mkdir git-server
    cd git-server
    mkdir repos
    git clone https://github.com/codable/giton.git
    node giton

now you can create repo inside the shell and access all your repos at http://127.0.0.1:5911/

### Create repo

    giton> create test

the new repo can be accessed at http://127.0.0.1/test.git

### Remove repo

    giton> remove test
