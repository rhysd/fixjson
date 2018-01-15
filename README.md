JSON fixer for Humans
=====================
[![npm version][]][fixjson]
[![travis ci badge][]][travis ci]
[![appveyor badge][]][appveyor]

[fixjson][] is a JSON file fixer/formatter for humans using (relaxed) JSON5.

fixjson provides:

- Pretty-printing JSON5 input
  - ES5 syntax is available to write up JSON
- Fixes various failures while humans writing JSON
  - Fixes trailing commas objects or arrays
  - Fixes missing commas for elements of objects or arrays
  - Adds quotes to keys in objects
  - Newlines in strings
  - Hex numbers
  - Fixes single quotes to double quotes

fixjson reads an input in [relaxed JSON5][forked json5] format and outputs it in JSON format. Indent
width is automatically detected.

This CLI tool aims to be used with editor extensions.

- [vim-fixjson][] (dedicated Vim plugin)
- [ALE](https://github.com/w0rp/ale/pull/1284) (Vim plugin, **ongoing**)
- [neoformat][] (Vim plugin)
- [vim-autoformat](https://github.com/Chiel92/vim-autoformat/pull/225) (Vim plugin, **ongoing**)

## Screenshots of Fixes

When moving a line to another line, you no longer need to care about a trailing comma:

![modify keys](https://github.com/rhysd/ss/raw/master/fixjson/modifykeys.gif)

And you also don't need to care about a trailing comma of a previous line when adding a new element
to an object or an array:

![add key](https://github.com/rhysd/ss/raw/master/fixjson/addkey.gif)

When adding a new key-value to an object, quotes of the key are fixed. And single quotes for strings
are also fixed to double quotes:

![key quotes](https://github.com/rhysd/ss/raw/master/fixjson/keyquotes.gif)

JSON string does not allow multi-line string. `\n` is required to embed multi-line string to JSON.
fixjson automatically fixes newlines in strings. This is useful when copy&paste some string to JSON
file:

![newlines in string](https://github.com/rhysd/ss/raw/master/fixjson/newlines.gif)

JSON only accepts decimal digits for numbers. fixjson automatically converts `0x` hex numbers to
decimal numbers. You no longer need to convert hex numbers manually:

![hex numbebr](https://github.com/rhysd/ss/raw/master/fixjson/number.gif)

And of course it pretty-prints the JSON code, with automatic indent detection:

![pretty printing](https://github.com/rhysd/ss/raw/master/fixjson/prettyprint.gif)

## Installation

```sh
$ npm install -g fixjson
```

It installs `fixjson` command globally.

## Usage

```sh
$ fixjson [--write|-w|--indent|-i] [paths...]
```

If paths are given, glob such as `dir/**/*.json` is available. If the path is a directory, it formats
all JSON files in the directory. If no path is given, it reads from STDIN.

If `--write` (or `-w`) option is provided, it overwrites files.

If `--indent` (or `-i`) is not provided, it detects indent spaces.

Please see `fixjson --help` for more details.

## License

Distributed under the MIT License. Please see [LICENSE](LICENSE).

[fixjson]: https://www.npmjs.com/package/fixjson
[vim-fixjson]: https://github.com/rhysd/vim-fixjson
[forked json5]: https://github.com/rhysd/json5
[travis ci badge]: https://travis-ci.org/rhysd/fixjson.svg?branch=master
[travis ci]: https://travis-ci.org/rhysd/fixjson
[appveyor badge]: https://ci.appveyor.com/api/projects/status/jqm3oenl6xwx7343?svg=true
[appveyor]: https://ci.appveyor.com/project/rhysd/fixjson
[npm version]: https://badge.fury.io/js/fixjson.svg
[neoformat]: https://github.com/sbdchd/neoformat
