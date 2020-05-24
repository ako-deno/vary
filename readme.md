# vary

[![tag](https://img.shields.io/github/tag/ako-deno/vary.svg)](https://github.com/ako-deno/vary/tags)
![vary-ci](https://github.com/ako-deno/vary/workflows/vary-ci/badge.svg)

Manipulate the HTTP Vary header for Deno, compatible with Browser. Based on `https://github.com/jshttp/vary`.

## API

```js
import { vary, append } from "https://raw.githubusercontent.com/ako-deno/isIP/master/mod.ts";
```

### vary(header: Headers, field: string | string[]): void

Adds the given header `field` to the `Vary` response header.
This can be a string of a single field, a string of a valid `Vary`
header, or an array of multiple fields.

This will append the header if not already listed, otherwise leaves
it listed in the current location.

```js
// Append "Origin" to the Vary header of the response's header
vary(res, 'Origin')
```

### append(header: string, field: string | string[]): string

Adds the given header `field` to the `Vary` response header string `header`.
This can be a string of a single field, a string of a valid `Vary` header,
or an array of multiple fields.

This will append the header if not already listed, otherwise leaves
it listed in the current location. The new header string is returned.

```js
// Get header string appending "Origin" to "Accept, User-Agent"
append('Accept, User-Agent', 'Origin')
```

# License

[MIT](./LICENSE)
