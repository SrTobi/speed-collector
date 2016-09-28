import {Project, ProjectStateInfo} from './project';
import * as utils from './utils'
import * as settings from './settings';
import * as post from './post';
import * as path from 'path';

export interface BenchmarkResult {
    executable: string;
    benchmark: string;
    environment: string;
    result_value: number;
    std_dev: number;
    max: number;
    min: number;
}

export class Step {
    constructor(
        private name: string,
        private command: ((proj: Project) => string[]),
        private benchmark: string,
        private executable: string,
        private environment: string,
        public required: boolean,
        private timeout: number,
        private simpleBenchmark: boolean = false,
        private refFile: string = null) {

    }

    private async postSpeedData(results: BenchmarkResult, pinfo: ProjectStateInfo) {
        let postdata: post.CodespeedPostData = Object.assign(results, pinfo);

        console.log(`Send data to ${settings.CODESPEED_HOSTNAME}:${settings.CODESPEED_PORT}${settings.CODESPEED_RESTPATH}`);
        console.log(JSON.stringify(postdata, null, 2));
        try {
            await post.senddataTo(settings.CODESPEED_HOSTNAME, settings.CODESPEED_PORT, settings.CODESPEED_RESTPATH, postdata);
            console.log("Sending done");
        } catch(e) {
            console.log("Sending failed!")
        }
    }

    public async process(proj: Project, info: ProjectStateInfo): Promise<boolean> {

        let times = this.simpleBenchmark? 1 : 11;
        let results: number[] = [];

        console.log(`Start step ${this.name}`);
        let firejailArgs = ["--quiet", "--noprofile", "--private=.", "sh"]
        let command = firejailArgs.concat(this.command(proj));
        console.log(`> ${command.join(" ")}`);

        var ret = 0;
        var refOk = true;
        let useReference = this.refFile != null;
        if(useReference) {
            console.log(`Check output with reference. Load it from '${this.refFile}'...`);
        }
        let refContent = useReference? await utils.loadFile(this.refFile) : null;
        for(var i = 0; i < times && ret == 0 && refOk; ++i)
        {
            console.log(`################### Begin ${i} ###################`);
            let output = new utils.CallOutput();
            let start = Date.now();
            ret = await utils.call("firejail", command, proj.build_path, this.timeout, output);
            let end = Date.now();
            if(useReference && ret == 0) {
                refOk = (refContent === output.stdout);
            }
            console.log(`################### Exit ${ret} ####################\n`);

            let time = end - start;
            results.push(time);
        }

        if(!refOk || ret > 0) {
            if(!refOk) {
                console.log("Error: Output is not equal to reference!");
            }
            if(this.required) {
                console.log(`${this.name} failed!`);
                return false;
            }
        } else {
            if(results.length > 1) {
                results.shift();
            }
            let min = Math.min(...results);
            let max = Math.max(...results);
            let mean = results.reduce((pv, cv) => pv + cv, 0) / results.length;
            let variance = results
                            .map((r) => (r - mean))
                            .map((d) => d * d)
                            .reduce((pv, cv) => pv + cv, 0) / results.length;
            let stddev = Math.sqrt(variance);

            let benchmarkResult: BenchmarkResult = {
                executable: this.executable,
                benchmark: this.benchmark,
                environment: this.environment,
                result_value: mean,
                std_dev: stddev,
                min: min,
                max: max
            };
            
            await this.postSpeedData(benchmarkResult, info);
        }

        return true;
    }
}