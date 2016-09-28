1. Install codespeed
--------------------

Dependencies:
- git
- python 2/3

1. Install codespeed globally

    pip install codespeed

2. Clone/Download codespeed

    git clone https://github.com/tobami/codespeed

3. Setup codespeed in codespeed/sample_project/settings.py
4. Init database

    cd codespeed
    python manage.py syncdb

5. See [here](https://github.com/tobami/codespeed/blob/master/sample_project/README.md#installing-for-production) for using with a webserver


2. Install speed-collector
--------------------------

Dependencies:
- node v6, npm
- firejail

1. Clone speed-collector

    git clone ...
    cd speed-collector

2. Configure

    mv settings.example.json settings.json
    vim settings.json

3. Install environment

    npm install     # install package dependencies
    npm run tsd     # download typescript typings

3. Build speed-collector

    npm run build

4a. Start once

    npm start

4b. Start as deamon

    npm run deamon