import * as fs from 'fs';
import * as tmp from 'tmp';

function readStdin() {
    process.stdin.setEncoding('utf8');
    return new Promise<string>(resolve => {
        let buf = '';
        process.stdin.on('data', chunk => {
            buf += chunk;
        });
        process.stdin.on('end', () => {
            resolve(buf);
        });
    });
}

interface TmpFile {
    path: string;
    fd: number;
    cleanup: () => void;
}

function tmpfile() {
    return new Promise<TmpFile>((resolve, reject) => {
        tmp.file({ postfix: '.js' }, (err, path, fd, cleanup) => {
            if (err) {
                reject(err);
            } else {
                resolve({ path, fd, cleanup });
            }
        });
    });
}

function writeTmpFileAsJS(f: TmpFile, content: string) {
    return new Promise<TmpFile>((resolve, reject) => {
        let src = 'module.exports = ' + content;
        fs.write(f.fd, src, err => {
            if (err) {
                reject(err);
            } else {
                resolve(f);
            }
        });
    });
}

export interface Config {
    write: boolean;
    indent: number;
}

export default class JsonFix {
    constructor(public config: Config) {}

    async run(paths: string[]) {
        const stdin = paths.length === 0;
        if (stdin) {
            const obj = await this.requireStdin();
            process.stdout.setEncoding('utf8');
            this.writeAsJson(process.stdout, obj);
        } else {
            throw new Error('Fixing file is not implemented yet');
        }
    }

    async writeAsJson(writer: NodeJS.WriteStream, obj: any) {
        writer.write(JSON.stringify(obj, null, this.config.indent || 2) + '\n');
    }

    async requireStdin() {
        return Promise.all([tmpfile(), readStdin()])
            .then(([tmpfile, input]) => writeTmpFileAsJS(tmpfile, input))
            .then(tmpfile => {
                try {
                    return require(tmpfile.path);
                } finally {
                    tmpfile.cleanup();
                }
            });
    }
}
