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

const childProcess = require('child_process');

function exec(cmd, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(
      cmd,
      options,
      (error, stdout) => (error ? reject(error) : resolve(stdout))
    );
  });
}

function excludeSubDirs(entry) {
  // Exclude random subdirectories of modules like lib
  return /^(.+\/|)node_modules\/\w[^/]+$/.test(entry.directory);
}

function parseLine(line) {
  const match = line.match(/^([\d]+)[\s]+(.+)$/);
  if (!match) {
    throw new Error(`Invalid line: ${line}`);
  }
  return { size: parseInt(match[1], 10), directory: match[2] };
}

function processOutput(stdout) {
  const byPath = {};

  function addDefaults(entry) {
    const path = entry.directory.replace(
      /(\/|^)node_modules\/([^/]+)/g,
      '$1$2'
    );
    return (byPath[path] = Object.assign(
      {
        path,
        children: [],
        self: entry.size,
      },
      entry
    ));
  }

  function calcParentStats(entry) {
    // map to parent
    const parentPath = entry.path
      .split('/')
      .slice(0, -1)
      .join('/');
    const parent = byPath[parentPath];
    if (parent) {
      parent.self -= entry.size;
      parent.children.push(entry);
    }
    return entry;
  }

  return stdout
    .trim()
    .split('\n')
    .map(parseLine)
    .filter(excludeSubDirs)
    .map(addDefaults)
    .map(calcParentStats);
}

function generateDependencyStats(cwd) {
  return exec('du -k node_modules/*', {
    maxBuffer: 1024 * 1024 * 5, // 5MB
    cwd,
  }).then(processOutput);
}
module.exports = generateDependencyStats;
