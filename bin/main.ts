#!/usr/bin/env node

import * as yargs from 'yargs';
import FixJSON, { Config } from '..';

const USAGE = `Usage: $0 [-w|-i|--minify|--stdin-filename] [paths...]

JSON fixer for Humans using (relaxed) JSON5. If no path is given, it reads from STDIN. Input should be a JSON5 string. Quotes for keys in objects can be ommitted. Trailing comma at the end of array or object is allowed. Number can be written in hex format (e.g. 0xff).

In addition, input JSON5 string can be relaxed. Missing commas are allowed in objects and arrays. String literals can contain newlines. Note that NaN and Infinity as number are not permitted.

For more detail please visit https://github.com/rhysd/fixjson.`;

/* tslint:disable:no-floating-promises */
(async () => {
/* tslint:enable:no-floating-promises */
    try {
        const argv = yargs
            .usage(USAGE)
            .option('write', {
                alias: 'w',
                describe: 'overwrite a file instead of outputting to stdout',
                type: 'boolean',
                default: false,
            })
            .option('minify', {
                describe: 'disable pretty print',
                type: 'boolean',
                default: false,
            })
            .option('indent', {
                alias: 'i',
                describe: 'indent of JSON output',
                type: 'number',
                default: 2,
            })
            .option('stdin-filename', {
                describe: 'assuming a file name when reading from stdin',
                type: 'string',
                default: undefined,
            }).argv;

        await new FixJSON(argv as Config).main(argv._);
    } catch (e) {
        /* tslint:disable:no-console */
        console.error('Error:', e.message);
        /* tslint:enable:no-console */
        process.exit(1);
    }
})();
