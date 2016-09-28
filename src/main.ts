import * as fs from 'fs';
import * as rimraf from 'rimraf';
import * as post from './post';
import * as utils from './utils';
import {Step} from './step'
import {Project} from './project';
import * as settings from './settings';
let posix: any = require("posix");



async function processProject(proj: Project) {
    try {
        console.log(`Start processing ${proj.name}`);
        let projectInfo = await proj.update();

        // copy to build path
        console.log(`Copy cloned data to ${proj.build_path}...`);
        try {fs.mkdirSync(settings.CODESPEED_BUILD_DIR);}catch(e){}
        try {fs.mkdirSync(proj.build_path);}catch(e){}
        await utils.copy_without_git(proj.clone_path, proj.build_path);

        if(!projectInfo) {
            console.log(`Nothing to do!`)
            return;
        }

        let steps = settings.STEPS;
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

async function main() {
    try {
        posix.setrlimit('data', {soft: 1024 * 1024 * 1024});
        posix.setrlimit('fsize', {soft: 1024 * 1024 * 1024});
        //console.log("Start!")
        //var repo = await GIT.Clone.clone("https://github.com/SrTobi/FirstTest", "test");
        //repo. 
        //console.log(repo);
        let p1 = new Project("FirstTest", "https://github.com/SrTobi/FirstTest");
        let p2 = new Project("SecondTest", "https://github.com/SrTobi/SecondTest");
        await processProject(p1);
        await processProject(p2);
    } catch(e) {
        console.log(e);
    }
    process.exit();
}
main();