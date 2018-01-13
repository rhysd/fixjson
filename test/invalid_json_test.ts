import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as glob from 'glob';
import FixJSON from '..';

describe('invalid cases', function() {
    const files = glob.sync(path.join(__dirname, 'data/invalid/*.json'));
    for (const file of files) {
        const title = path
            .basename(file)
            .replace('.json', '')
            .replace(/_/g, ' ');
        it(title, function() {
            const fixer = new FixJSON();
            const want = fs.readFileSync(file, 'utf8');
            assert.throws(() => fixer.convertString(want));
        });
    }
});
