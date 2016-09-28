/*export let BUILD_FILE = "build.sh";
export let RUN_FILE = "run.sh";
export let CODESPEED_HOSTNAME = "127.0.0.1";
export let CODESPEED_PORT = 8000;
export let CODESPEED_RESTPATH = "/result/add/";
export let CODESPEED_EXENAME = "exe";
export let CODESPEED_BENCHMARK = "float";
export let CODESPEED_ENVIRONMENT = "test-machine";
export let CODESPEED_CLONE_DIR = "projects/clones";
export let CODESPEED_BUILD_DIR = "projects/bld";*/

//import {Step} from './step';
//import {Project} from './project';
import {loadFile} from './utils';

export interface BenchmarkSettings {
    benchmark: string;
    executable: string;
    environment: string;
    repeat: number;
}

export interface StepSettings {
    name: string;
    exec: string;
    benchmark: BenchmarkSettings;
    required: boolean;
    timeout: number;
    reffile: string;
}

export interface CodespeedSettings {
    hostname: string;
    port: number;
    restpath: string;
}

export interface ProjectSettings {
    name: string;
    giturl: string;
    benchmark: string;
    executable: string;
    environment: string;
    repeat: number;
}

export interface Settings {
    codespeed: CodespeedSettings;
    steps: StepSettings[];
    projects: ProjectSettings[];
    clonedir: string;
    builddir: string;
    sleep: number;
}

export async function loadSettings(settingsFile: string = "settings.json"): Promise<Settings> {
    let content = await loadFile(settingsFile);
    let settings = <Settings>JSON.parse(content);

    return settings;
}

/*export let STEPS = [

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

];*/