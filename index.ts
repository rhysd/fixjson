import * as vm from 'vm';

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

export interface Config {
    write?: boolean;
    indent?: number;
    minify?: boolean;
}

export default class JsonFiver {
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
        const obj = this.safeEval(input);
        process.stdout.setEncoding('utf8');
        this.writeAsJson(process.stdout, obj);
    }

    private async writeAsJson(writer: NodeJS.WriteStream, obj: any) {
        const { indent, minify } = this.config;
        const level = minify ? 0 : indent || 2;
        writer.write(JSON.stringify(obj, null, level) + '\n');
    }

    private safeEval(src: string) {
        const ctx = vm.createContext(undefined);
        vm.runInNewContext('JSONFIX_CONVERTED_RESULT = ' + src, ctx);
        return (ctx as any).JSONFIX_CONVERTED_RESULT;
    }

    private async requireStdin() {
        return this.safeEval(await readStdin());
    }
}

export function convert(input: string, config?: Config) {
    return new JsonFiver(config).runString(input);
}
