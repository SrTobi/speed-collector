import * as http from 'http';
import * as qs from 'querystring';
import {ProjectStateInfo} from './project'
import {BenchmarkResult} from './step';

export type CodespeedPostData = ProjectStateInfo & BenchmarkResult;

export async function senddataTo(hostname: string, port: number, path: string, data: CodespeedPostData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        let post_data = qs.stringify(data);
        let options = {
            hostname: hostname,
            port: port,
            path: path,// + "?" + qs.stringify(data),
            method: 'POST',
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                'Content-Length': Buffer.byteLength(post_data)
            }
        };
        let req = http.request(options, (res) => {
            console.log('Status: ' + res.statusCode);
            if(res.statusCode > 200 && res.statusCode <= 226) {
                resolve("ok");
            }else {
                console.log('Send-Headers: ' + JSON.stringify(options, null, 2));
                console.log('Headers: ' + JSON.stringify(res.headers, null, 2));
                res.setEncoding('utf8');
                res.on('data', (body: any) => {
                    console.log('Body: ' + body);
                });
                res.on('end', () => {
                    reject("failed to send data");
                });
            }

        });
        req.on('error', (e: any) => {
            console.log('problem with request: ' + e.message);
            reject(e);
        });
        req.write(post_data);
        req.end();
    });
}