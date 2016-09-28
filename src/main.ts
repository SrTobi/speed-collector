import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as post from './post';
import * as utils from './utils';
import {Step} from './step'
import {Project} from './project';
import {Settings, StepSettings, loadSettings} from './settings';
let posix: any = require("posix");

var settings: Settings = null;

async function processProject(proj: Project, steps: Step[]) {
    try {
        console.log(`Start processing ${proj.name}`);
        let projectInfo = await proj.update();

        // copy to build path
        console.log(`Copy cloned data to ${proj.build_path}...`);
        try {fs.mkdirSync(settings.builddir);}catch(e){}
        try {fs.mkdirSync(proj.build_path);}catch(e){}
        await utils.copy_without_git(proj.clone_path, proj.build_path);

        if(!projectInfo) {
            console.log(`Nothing to do!`)
            return;
        }

        for(var i = 0; i < steps.length; ++i) {
            let step = steps[i];
            let success = await step.process(proj, projectInfo);
            if(!success) {
                break;
            }
        }
    }catch(e)
    {
        console.error(`Error: ${e}`);
    }

    console.log(`Deleting ${proj.build_path}`)
    rimraf.sync(proj.build_path);
    console.log(`Done processing ${proj.name}`)
}

function need<T>(v: T, name: string): T {
    if(v == null || v == undefined) {
        throw new Error(`No option '${name}' secified!`);
    }
    return v;
}
function getor<T>(v: T, d: T): T {
    if(v == null || v == undefined) {
        return d;
    }
    return v;
}

async function main() {
    settings = await loadSettings();

    need(settings.builddir, "settings.builddir");
    need(settings.clonedir, "settings.clonedir");
    need(settings.codespeed, "settings.codespeed");
    need(settings.codespeed.hostname, "codespeed.hostname");
    need(settings.codespeed.port, "codespeed.port");
    need(settings.codespeed.restpath, "codespeed.restpath");

    // load steps
    need(settings.steps, "settings.steps");
    let steps = settings.steps.map((stepSetting) => {
        let exec = need(stepSetting.exec, "step.exec");
        return new Step(
            settings.codespeed,
            need(stepSetting.name, "step.name"),
            (proj) => [exec],
            stepSetting.benchmark,
            need(stepSetting.required, "step.required"),
            getor(stepSetting.timeout, 600) * 1000,
            stepSetting.reffile);
    });

    need(settings.projects, "settings.projects");
    let projects = settings.projects.map((projSettings) => {
        return new Project(
            settings,
            need(projSettings.name, "project.name"),
            need(projSettings.giturl, "project.giturl")
        );
    })

    try {
        posix.setrlimit('data', {soft: 1024 * 1024 * 1024});
        posix.setrlimit('fsize', {soft: 1024 * 1024 * 1024});
        //console.log("Start!")
        //var repo = await GIT.Clone.clone("https://github.com/SrTobi/FirstTest", "test");
        //repo. 
        //console.log(repo);
        //let p1 = new Project("FirstTest", "https://github.com/SrTobi/FirstTest");
        //let p2 = new Project("SecondTest", "https://github.com/SrTobi/SecondTest");
        //await processProject(p1);
        //await processProject(p2);
        for(var i = 0; i < projects.length; ++i) {
            await processProject(projects[i], steps);
        }
    } catch(e) {
        console.log(e);
    }
    process.exit();
}
main();