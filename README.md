# ndu - node disk usage

**Requires node 4 or later.**

Like [`disc`](https://npmjs.com/disc) but for server-side dependencies.
Very useful when you're wondering why your simple node app takes up hundreds of MB on disk.

```bash
npm install --global ndu
```

## Usage

By default it will analyze the current working directory and write an HTML file with the results to stdout:

```bash
ndu > ndu.html && open ndu.html
```

Just like `disc`, it can also open the result in a browser:

```bash
ndu --open
```
