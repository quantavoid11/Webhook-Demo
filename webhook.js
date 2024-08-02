import crypto from 'crypto';
import http from 'http';
import { exec } from 'child_process';

const secret = "zMTqrts45jdkl0";
const repo = "D:\\Webhook"; // Use double backslashes for Windows path

http.createServer((req, res) => {
    let body = [];

    req.on('data', chunk => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();

        let sig = "sha1=" + crypto.createHmac('sha1', secret).update(body).digest('hex');

        if (req.headers['x-hub-signature'] === sig) {
            exec(`cd ${repo} && git pull`, (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    res.statusCode = 500;
                    res.end(`exec error: ${error}`);
                    return;
                }
                console.log(`stdout: ${stdout}`);
                console.error(`stderr: ${stderr}`);
                res.statusCode = 200;
                res.end('Success');
            });
        } else {
            res.statusCode = 401;
            res.end('Signature mismatch');
        }
    });

    req.on('error', (err) => {
        console.error(`Request error: ${err}`);
        res.statusCode = 500;
        res.end(`Request error: ${err}`);
    });

}).listen(8080, () => {
    console.log('Server is listening on port 8080');
});
