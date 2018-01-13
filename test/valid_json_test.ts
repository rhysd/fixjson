import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as glob from 'glob';
import FixJSON from '..';

describe('valid cases', function() {
    const befs = glob.sync(path.join(__dirname, 'data/valid/*_before.json'));
    for (const bef of befs) {
        const title = path
            .basename(bef)
            .replace('_before.json', '')
            .replace(/_/g, ' ');
        it(title, function() {
            const af = bef.replace('_before.json', '_after.json');
            const fixer = new FixJSON();
            return fixer.convertFile(bef).then(out => {
                const want = fs.readFileSync(af, 'utf8');
                assert.strictEqual(out, want);
            });
        });
    }
});
