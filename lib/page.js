/*
 * Copyright (c) 2016, Groupon
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
'use strict';
const browserify = require('browserify');
const _ = require('lodash');

function writePageFromStats(stats, out) {
  out.write('<!DOCTYPE html><html><head>');
  out.write('<meta charset="utf-8" />');
  out.write('<title>node disk usage</title>');
  out.write('</head>');
  out.write('<body>');
  out.write('<div id="wrap"><div id="graph"></div><div id="details"></div></div>');
  out.write('<div id="stats-data" style="display: none">' + _.escape(JSON.stringify(stats)) + '</div>');
  out.write('<script>');
  const bundle = browserify({
    entries: require.resolve('./browser.js'),
  });
  bundle.on('bundle', stream => {
    stream.pipe(out, { end: false });
    stream.on('end', () => {
      out.write('</script></body></html>');
      if (out !== process.stdout) out.end();
    });
  });
  bundle.bundle();
}
module.exports = writePageFromStats;
