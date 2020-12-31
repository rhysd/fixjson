import * as fs from 'fs';
import * as JSON5R from 'json5-relaxed';
import * as glob from 'glob';
import * as detectIndent from 'detect-indent';

function readFromStdin() {
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

function readFile(path: string) {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(path, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(data);
        });
    });
}

function write(writer: NodeJS.WritableStream, chunk: string) {
    return new Promise(resolve => writer.write(chunk, 'utf8', resolve));
}

function isDirectory(path: string) {
    return new Promise<boolean>((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) {
                reject(err);
            } else {
                resolve(stat.isDirectory());
            }
        });
    });
}

function globPath(path: string) {
    return new Promise<string[]>((resolve, reject) => {
        glob(path, (err, p) => (err ? reject(err) : resolve(p)));
    });
}

async function globOne(pattern: string): Promise<string[]> {
    const globbed = await globPath(pattern);

    const paths = [];
    for (const path of globbed) {
        if (!(await isDirectory(path))) {
            paths.push(path);
        }
        let pat = path;
        if (pat[pat.length - 1] !== '/') {
            pat += '/';
        }
        pat += '**/*.json';
        Array.prototype.push.apply(paths, await globPath(pat));
    }
    return paths;
}

async function globAll(pats: string[]): Promise<string[]> {
    if (pats.length === 0) {
        // shortcut
        return [];
    }

    // flatten
    const paths: string[] = [];
    for (const p of await Promise.all(pats.map(globOne))) {
        Array.prototype.push.apply(paths, p);
    }
    return paths;
}

export interface Config {
    write?: boolean;
    indent?: number;
    minify?: boolean;
    stdinFilename?: string;
    stdout?: NodeJS.WriteStream;
}

interface Parsed {
    name: string;
    parsed: any;
    indent: string;
}

export default class FixJSON {
    public readonly config: Config;
    private readonly stdout: NodeJS.WriteStream;

    constructor(config?: Config) {
        this.config = { write: false, minify: false, stdout: process.stdout, ...config };
        this.stdout = this.config.stdout || process.stdout;
    }

    async main(argv: string[]) {
        const stdin = argv.length === 0;
        if (stdin) {
            const src = await this.parseStdin();
            if (this.stdout.setEncoding) {
                this.stdout.setEncoding('utf8');
            }
            this.stdout.write(this.unparse(src));
            return 1;
        }
        const files = await globAll(argv);
        await this.fixFiles(files);
        return files.length;
    }

    async fixFiles(paths: string[]) {
        const parsed = Promise.all(paths.map(p => this.parseFile(p)));
        if (!this.config.write && this.stdout.setEncoding) {
            this.stdout.setEncoding('utf8');
        }
        for (const src of await parsed) {
            const writer = this.config.write ? fs.createWriteStream(src.name) : this.stdout;
            await write(writer, this.unparse(src));
        }
    }

    convertString(input: string): string {
        return this.unparse({ name: '', parsed: JSON5R.parse(input), indent: this.indent(input) });
    }

    async convertFile(path: string): Promise<string> {
        return this.unparse(await this.parseFile(path));
    }

    private indent(code: string) {
        const { indent, minify } = this.config;
        if (minify) {
            return '';
        }
        if (typeof indent === 'number') {
            return ' '.repeat(indent);
        }
        return detectIndent(code).indent ?? '  ';
    }

    private unparse(src: Parsed): string {
        return JSON.stringify(src.parsed, null, src.indent) + '\n';
    }

    private parseString(code: string, file: string) {
        try {
            return JSON5R.parse(code);
        } catch (e) {
            e.message = `${file}: ${e.message}`;
            throw e;
        }
    }

    private async parseStdin(): Promise<Parsed> {
        const name = this.config.stdinFilename || '<stdin>';
        const code = await readFromStdin();
        const parsed = this.parseString(code, name);
        return { name, parsed, indent: this.indent(code) };
    }

    private async parseFile(path: string): Promise<Parsed> {
        const code = await readFile(path);
        const parsed = this.parseString(code, path);
        const indent = this.indent(code);
        return { name: path, parsed, indent };
    }
}

// Helper APIs

export function fixString(input: string, config?: Config) {
    return new FixJSON(config).convertString(input);
}

export function fixFile(file: string, config?: Config) {
    return new FixJSON(config).convertFile(file);
}
