export let BUILD_FILE = "build.sh";
export let RUN_FILE = "run.sh";
export let CODESPEED_HOSTNAME = "127.0.0.1";
export let CODESPEED_PORT = 8000;
export let CODESPEED_RESTPATH = "/result/add/";
export let CODESPEED_EXENAME = "exe";
export let CODESPEED_BENCHMARK = "float";
export let CODESPEED_ENVIRONMENT = "test-machine";
export let CODESPEED_CLONE_DIR = "projects/clones";
export let CODESPEED_BUILD_DIR = "projects/bld";

import {Step} from './step';
import {Project} from './project';

export let STEPS = [

    new Step(
        "Build",
        (proj: Project) => [BUILD_FILE],
        "build",
        "compiler",
        CODESPEED_ENVIRONMENT,
        true,
        10000,
        true
    ),

    new Step(
        "Running",
        (proj: Project) => [RUN_FILE],
        "run",
        "program",
        CODESPEED_ENVIRONMENT,
        false,
        1000,
        false,
        "test.ref"
    )

];