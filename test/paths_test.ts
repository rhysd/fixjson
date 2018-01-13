import * as path from 'path';
import * as assert from 'assert';
import FixJSON from '..';

const EXPECTED = `{
  "foo": "bar",
  "piyo": "aaa\\nbbb\\nccc"
}
{
  "foo": 42
}
`;

class PseudoStdout {
    buf: string;
    writable: true;
    constructor() {
        this.buf = '';
    }
    write(s: string, _: string, cb: () => void) {
        this.buf += s;
        cb();
    }
}

describe('paths argument', function() {
    it('can be files', function() {
        const base = path.join(__dirname, 'data/rec');
        const a = path.join(base, 'foo/test2.json');
        const b = path.join(base, 'test1.json');
        const stdout = new PseudoStdout();
        const fixer = new FixJSON({ stdout: stdout as any });
        return fixer.main([a, b]).then(num => {
            assert.strictEqual(stdout.buf, EXPECTED);
            assert.strictEqual(num, 2);
        });
    });

    it('can be specified as directory', function() {
        const dir = path.join(__dirname, 'data/rec');
        const stdout = new PseudoStdout();
        const fixer = new FixJSON({ stdout: stdout as any });
        return fixer.main([dir]).then(num => {
            assert.strictEqual(stdout.buf, EXPECTED);
            assert.strictEqual(num, 2);
        });
    });

    it('can contain globs', function() {
        const glob = path.join(__dirname, 'data/rec/**/*.json');
        const stdout = new PseudoStdout();
        const fixer = new FixJSON({ stdout: stdout as any });
        return fixer.main([glob]).then(num => {
            assert.strictEqual(stdout.buf, EXPECTED);
            assert.strictEqual(num, 2);
        });
    });
});
