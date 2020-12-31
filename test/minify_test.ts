import * as path from 'path';
import * as assert from 'assert';
import FixJSON, { Config } from '..';

const testcases: Array<{
    context: string;
    config: Config;
}> = [
    {
        context: '--minify',
        config: { minify: true },
    },
    {
        context: '--indent 0',
        config: { indent: 0 },
    },
];
const file = path.join(__dirname, 'data/rec/test1.json');

for (const tc of testcases) {
    describe(tc.context, function () {
        it('minifies JSON input', function () {
            const fixer = new FixJSON(tc.config);
            return fixer.convertFile(file).then(out => {
                assert.strictEqual('{"foo":42}\n', out);
            });
        });
    });
}
