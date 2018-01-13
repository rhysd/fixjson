import * as fs from 'fs';
import * as JSON5R from 'json5-relaxed';
import * as glob from 'glob';
import * as detectIndent from 'detect-indent';

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

function globAll(pats: string[]): Promise<string[]> {
    if (pats.length === 0) {
        // shortcut
        return Promise.resolve([]);
    }
    const ps = pats.map(
        pat =>
            new Promise<string[]>((resolve, reject) => {
                glob(pat, (err, matched) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve(matched);
                });
            }),
    );
    return Promise.all(ps).then((matched: string[][]) => {
        const flatten = [] as string[];
        for (const m of matched) {
            Array.prototype.push.apply(flatten, m);
        }
        return flatten;
    });
}

export interface Config {
    write?: boolean;
    indent?: number;
    minify?: boolean;
    stdinFilename?: string;
}

interface Parsed {
    name: string;
    parsed: any;
    indent: string;
}

export default class FixJSON {
    public readonly config: Config;

    constructor(config?: Config) {
        this.config = { write: false, minify: false, ...config };
    }

    async main(argv: string[]) {
        const stdin = argv.length === 0;
        if (stdin) {
            const src = await this.parseStdin();
            process.stdout.setEncoding('utf8');
            process.stdout.write(this.unparse(src));
            return;
        }
        await this.fixFiles(await globAll(argv));
    }

    async fixFiles(paths: string[]) {
        const parsed = Promise.all(paths.map(p => this.parseFile(p)));
        if (!this.config.write) {
            process.stdout.setEncoding('utf8');
        }
        for (const src of await parsed) {
            const writer = this.config.write ? fs.createWriteStream(src.name) : process.stdout;
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
        const spaces = minify ? '' : indent ? ' '.repeat(indent) : detectIndent(code).indent;
        return spaces || '  ';
    }

    private unparse(src: Parsed): string {
        return JSON.stringify(src.parsed, null, src.indent) + '\n';
    }

    private async parseStdin(): Promise<Parsed> {
        const name = this.config.stdinFilename || '<stdin>';
        const code = await readStdin();
        const parsed = JSON5R.parse(code);
        return { name, parsed, indent: this.indent(code) };
    }

    private async parseFile(path: string): Promise<Parsed> {
        const code = await readFile(path);
        const parsed = JSON5R.parse(code);
        const indent = detectIndent(code).indent || '  ';
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
