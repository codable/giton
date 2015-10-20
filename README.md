Git On
======

A simple git server based on jsDAV to host multiple git repositories.


USAGE
-----

### Create instance

    npm install -g giton
    mkdir repos
    cd repos
    giton

now you can create repo inside the shell and access all your repos at http://127.0.0.1:5911/

### Create repo

    giton> create test

the new repo can be accessed at http://127.0.0.1:5911/test.git, both pull and push are supported.

### Remove repo

    giton> remove test
