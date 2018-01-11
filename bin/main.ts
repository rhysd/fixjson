import * as yargs from 'yargs';
import JsonFix from '..';

(async () => {
    const argv = yargs
        .usage('Usage: $0 [-w] [paths...]')
        .option('write', {
            alias: 'w',
            default: false,
        })
        .option('indent', {
            alias: 'i',
            default: 2,
        }).argv as any;

    try {
        await new JsonFix(argv).run(argv._);
    } catch (e) {
        console.error('Error:', e.message);
    }
})();
