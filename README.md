# `ndu` 
> Visualize your Node app's disk space usage

**Requires node 10.13+ and `du`. Windows not yet supported.**

`ndu` is a tool for analyzing the size of dependencies in a node.js application.
It's similar to [`disc`](https://npmjs.com/disc), but for server-side
dependencies instead of client-side dependencies.

When building node.js apps, you can choose from hundreds of thousands of
libraries available on [npm](https://www.npmjs.com/). But sometimes these
libraries contain many hidden sub-dependencies that bloat the size of your
application. This tool helps you identify which modules are bringing in the bloat.
It's very useful when you're wondering why your seemingly simple node app takes up
hundreds of MBs of space on disk.

## Installation

Install from npm:

```bash
npm install --global ndu
```

## Usage

Simply run `ndu` in the root folder of your node.js application.

By default it will write an HTML file with the results to stdout:

```bash
ndu > ndu.html && open ndu.html
```

Just like `disc`, `ndu` can also open the result directly in a browser:

```bash
ndu --open
```

## Example

First, let's create a very simple web app using
[express-generator](https://www.npmjs.com/package/express-generator):

```bash
$ npm install -g express-generator
$ express example-web-app
$ cd example-web-app/
$ npm install
```

Now we have a simple web app built with express.js. Let's see how large the
dependency tree is using `ndu`:

```bash
$ npm install -g ndu
$ ndu --open
```

This opens your web browser and shows a breakdown of your app's dependency
tree:

<img width="840" alt="ndu screenshot" src="https://cloud.githubusercontent.com/assets/896692/14235172/2b5c4a24-f9ab-11e5-8dbf-f36472eb4b50.png">

From here you can see that your app is using 9.64MB of node dependencies. You
can highlight areas of the diagram to see which node dependencies use up that
space:

![ndu](https://cloud.githubusercontent.com/assets/896692/14235174/359da050-f9ab-11e5-82fe-3211a7df8a8b.gif)

This can be especially helpful in a large application. Sometimes just a few
dependencies make up the majority of your application's size.

For example, here's a real application that was running at Groupon. You can
easily see how one bloated dependency was increasing the size of the application by 10%:

<img width="771" alt="ndu screenshot 2" src="https://cloud.githubusercontent.com/assets/896692/14235173/311c5eb8-f9ab-11e5-8cd1-9f823de6b0fa.png">

Thanks to `ndu`, it was easy to clean up the largest dependencies and quickly
shrink the size of the app's footprint.

## Similar Tools

* [`disc`](https://npmjs.com/disc): For analyzing the size of browserify bundles, platform independent
* [`space-hogs`](https://github.com/dylang/space-hogs): Generic directory size info, highlights big entries, *nix
* [WinDirStat](https://windirstat.info/): Generic directory size info, Windows
* [Grand Perspective](http://grandperspectiv.sourceforge.net/): Generic directory size info, OSX
