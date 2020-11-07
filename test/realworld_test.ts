import * as path from 'path';
import * as fs from 'fs';
import * as assert from 'assert';
import * as glob from 'glob';
import FixJSON from '..';

describe('JSON files in real world', function () {
    const files = glob.sync(path.join(__dirname, 'data/realworld/**/*.json'));
    files.push(path.join(__dirname, '../package.json'));

    const fixer = new FixJSON();
    for (const file of files) {
        if (
            file.indexOf('invalid') >= 0 ||
            file.indexOf('fail') >= 0 ||
            file.indexOf('bad') >= 0 ||
            file.indexOf(path.normalize('/n_')) >= 0
        ) {
            continue;
        }
        it(file, function () {
            this.timeout(60000);
            const json = fs.readFileSync(file, 'utf8');
            assert.ok(fixer.convertString(json));
        });
    }
});
