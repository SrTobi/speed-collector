import * as cb from 'child_process';
import * as fs from 'fs';
import {ncp} from 'ncp';

export class CallOutput {
    public stdout: string = "";
    public stderr: string = "";
}

export async function call(cmd: string, args: Array<string>, cwd: string, timeout: number, output: CallOutput = new CallOutput): Promise<number> {
    return new Promise<number>((resolve, reject) => {
        let bat = cb.spawn(cmd, args, {cwd: cwd});


        let timer = setTimeout(() => {
            bat.kill();
            console.log(`Program timed out after ${timeout}ms`);
        }, timeout);

        bat.stdout.on('data', (data: any) => {
            output.stdout = output.stdout + data.toString();
            data.toString().split('\n').forEach((line: string) => console.log("INFO: " + line));
        });

        bat.stderr.on('data', (data: any) => {
            output.stderr = output.stderr + data.toString();
            data.toString().split('\n').forEach((line: string) => console.log("!ERR: " + line));
        });

        bat.on('exit', (retcode: number) => {
            clearTimeout(timer);
            resolve(retcode);
        });
    });
}



export async function copy_without_git(from: string, to: string) {
    return new Promise<void>((resolve, reject) => {
        ncp(from, to, {filter: (file: string) => !file.startsWith(".git")}, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

export async function loadFile(file: string): Promise<string> {
    return new Promise<string>(
        (resolve, reject) => {
            fs.readFile(file, 'utf8',
                (err, data) => {
                    if(err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
        });
}


export async function sleep(ms: number) {
    return new Promise<void>(
        (resolve, reject) => {
            setTimeout(() => resolve(), ms);
        });
}