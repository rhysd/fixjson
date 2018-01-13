JSON fixer for Humans
=====================

[fixjson][] is a source code fixer for humans using (relaxed) JSON5.

fixjson provides:

- Pretty-prints JSON input
- Fixes varios failures while humans writing JSON
  - Fixes trailing commas objects or arrays
  - Fixes missing commas of elements of objects or arrays
  - Adds quotes to keys in objects
  - Newlines in strings
  - Hex numbers
  - Fixes single quotes to double quotes

fixjson reads input as [relaxed json][forked json5] and outputs it as formatted JSON.

## Fix Screenshots

TODO

## Installation

```sh
$ npm install -g fixjson
```

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
[forked json5]: https://github.com/rhysd/json5
