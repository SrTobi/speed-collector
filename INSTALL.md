1 Install codespeed
--------------------

Dependencies:
- git
- python 2/3

1. Install codespeed globally

    ```
    pip install codespeed
    ```

2. Clone/Download codespeed

    ```
    git clone https://github.com/tobami/codespeed
    ```

3. Setup codespeed in codespeed/sample_project/settings.py
4. Init database

    ```
    cd codespeed
    python manage.py syncdb
    ```

5. See [here](https://github.com/tobami/codespeed/blob/master/sample_project/README.md#installing-for-production) for using with a webserver


2 Install speed-collector
-----------------------

Dependencies:
- node v6, npm
- firejail

1. Clone speed-collector

    ```
    git clone https://github.com/SrTobi/speed-collector
    cd speed-collector
    ```

2. Configure (See also Section 3)

    ```
    mv settings.example.json settings.json
    vim settings.json
    ```

3. Install environment

    ```
    npm install     # install package dependencies
    npm run tsd     # download typescript typings
    ```

4. Build speed-collector

    ```
    npm run build
    ```

5. (a) Start once

    ```
    npm start
    ```

5. (b) Start as deamon

    ```
    npm run deamon
    ```

3 Configure speed-collector
---------------------------

To configure speed-collector edit the `settings.json`:

~~~~~~~~~~~~~~~~~~~~~~~~
{
    // Settings for the data upload (required)
    "codespeed": {
        "hostname": "127.0.0.1",
        "port": 8000, 
        "restpath": "/result/add/"
    },

    // The directory the projects are cloned into.
    // Each project gets its own subdirectory
    "clonedir": "projects/clones",  // (required)

    // The directory where the projects are built and run.
    // Each project gets its own subdirectory
    // This directory will be cleaned after every a project has been processed!
    "builddir": "projects/bld",     // (required)

    // When used in deamon mode this will determine
    // how long the process should sleep in seconds between two updates.
    "sleep": 30,                    // (defaults to 600)

    // Each project will run through multiple steps
    // In each step a script is executed (exec)
    // Those may modify the directory
    // For each step a benchmark will be created (or not) and sent to a codespeed server
    // After the last step, the project directory will be removed
    "steps": [
        {
            // The name of the step
            "name": "Build",        // (required)

            // The command that should be executed inside the project
            "exec": "build.sh",     // (required)

            // Information about the benchmark
            // If this is undefined or null, no benchmark will be sent
            "benchmark": {          // (not required)
                "benchmark": "build",
                "executable": "compiler",
                "environment": "test-machine",

                // Determines how often the script should be run to messure the benchmark
                "repeat": 1
            },

            // Determines if this step is required by the following steps
            "required": true,       // (required)

            // Max runtime for this step in seconds.
            // After the timeout the step will fail.
            "timeout": 600          // (defaults to 600)
        },
        {
            "name": "Run",
            "exec": "run.sh",
            "benchmark": {
                "benchmark": "run",
                "executable": "program",
                "environment": "test-machine",
                "repeat": 11
            },
            "required": false,
            "timeout": 1,
            "reffile": "test.ref"
        }
    ],

    // A list of projects that should be monitored
    // The projects are automatically fetched from a git repository.
    "projects": [
        {
            "name": "FirstTest",
            "giturl": "https://github.com/SrTobi/FirstTest"
        },
        {
            "name": "SecondTest",
            "giturl": "https://github.com/SrTobi/SecondTest"
        }
    ]
}
~~~~~~~~~~~~~~~~~~~~~~~~