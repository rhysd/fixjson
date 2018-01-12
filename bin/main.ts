#!/usr/bin/env node

import * as yargs from 'yargs';
import FixJSON, { Config } from '..';

(async () => {
    const argv = yargs
        .usage('Usage: $0 [-w] [paths...]')
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

    try {
        await new FixJSON(argv as Config).main(argv._);
    } catch (e) {
        console.error('Error:', e.message);
        process.exit(1);
    }
})();
