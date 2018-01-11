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
    write?: boolean;
    indent?: number;
    minify?: boolean;
}

export default class JsonFix {
    public readonly config: Config;

    constructor(config?: Config) {
        this.config = Object.assign({ write: false, indent: 2, minify: false }, config || {});
    }

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

    async runString(input: string) {
        const obj = await this.requireString(input);
        process.stdout.setEncoding('utf8');
        this.writeAsJson(process.stdout, obj);
    }

    private async writeAsJson(writer: NodeJS.WriteStream, obj: any) {
        const { indent, minify } = this.config;
        const level = minify ? 0 : indent || 2;
        writer.write(JSON.stringify(obj, null, level) + '\n');
    }

    private async requireString(input: string) {
        const file = await tmpfile();
        await writeTmpFileAsJS(file, input);
        try {
            return require(file.path);
        } finally {
            file.cleanup();
        }
    }

    private async requireStdin() {
        const [file, input] = await Promise.all([tmpfile(), readStdin()]);
        await writeTmpFileAsJS(file, input);
        try {
            return require(file.path);
        } finally {
            file.cleanup();
        }
    }
}

export function convert(input: string, config?: Config) {
    return new JsonFix(config).runString(input);
}
