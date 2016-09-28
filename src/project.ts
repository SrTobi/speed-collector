import * as Git from 'nodegit';
import * as path from 'path';
import * as utils from './utils';
import {Settings} from './settings';

export interface ProjectStateInfo {
    commitid: string;
    branch: string;
    project: string;
}

export class Project {
    public clone_path: string;
    public build_path: string;

    constructor(private settings: Settings, public name: string, public url: string) {
        this.clone_path = path.join(settings.clonedir, name);
        this.build_path = path.join(settings.builddir, name);
    }

    public async update(): Promise<ProjectStateInfo> {
        console.log(`Updating '${this.name}'`);
        var repo: Git.Repository;
        var cloned = false;
        try {
            repo = await Git.Repository.open(this.clone_path);
            console.log("Fetching all remotes...");
            try {
                await repo.fetchAll(null, null);
                console.log("Fetching done!")
            } catch(e) {
                console.log("Failed to fetch!");
                console.log(e);
            }
        } catch(e) {
            console.log(`Failed to open '${this.name}'!`);
            console.log(`Start cloning '${this.name}' from ${this.url}`);
            repo = await Git.Clone.clone(this.url, this.clone_path);
            cloned = true;
        }
        let headCommit = await repo.getHeadCommit();
        let branch = await repo.getCurrentBranch();
        let branchname = path.basename(branch.name());
        let remoteBranch = await repo.getBranch(`origin/${branchname}`)
        let recentCommit = await repo.getBranchCommit(remoteBranch);
        console.log(`Current branch is ${branch}`);
        console.log(`Current remote branch is ${remoteBranch}`);
        console.log(`Current HEAD points to ${headCommit}`);
        console.log(`Most recent commit is  ${recentCommit}`);

        if(headCommit.sha() == recentCommit.sha()) {
            if(!cloned)
                return null;
        } else {
            // update: merge new commit into branch
            console.log(`Start updating ${branch} to ${remoteBranch}`);
            await repo.mergeBranches(branch, remoteBranch, null, Git.Merge.PREFERENCE.FASTFORWARD_ONLY, null);
        }
        
        return {
            commitid: (await repo.getHeadCommit()).sha(),
            branch: branchname,
            project: this.name
        };
    }

    /*private async build(): Promise<Boolean> {
        console.log(`Start building ${this.build_path}/${settings.BUILD_FILE}...`);
        console.log("###############################################");
        let ret = await utils.call("sh", [BUILD_FILE], this.build_path);
        console.log(`################### Exit ${ret} ####################\n`);

        if(ret > 0) {
            console.log("Build failed!");
            return false;
        }

        return true;
    }

    private async run(): Promise<number> {
        console.log(`Start benchmark ${this.build_path}${RUN_FILE}...`);

        console.log("###############################################");
        let start = Date.now();
        let ret = await utils.call("sh", [RUN_FILE], this.build_path);
        let end = Date.now();
        console.log(`################### Exit ${ret} ####################\n`);

        let time = end - start;
        console.log(`Run needed ${time}ms`)
        return time;
    }*/
}