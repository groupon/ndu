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

/* eslint-env browser */
/* eslint no-var: 0, vars-on-top: 0 */
var bytes = require('bytes');
var d3 = require('d3');
var _ = require('lodash');

var WIDTH = 1000;
var HEIGHT = 1000;

var styles = document.createElement('style');
styles.innerText = [
  'html, body {',
  '  padding: 0;',
  '  margin: 0;',
  '  width: 100%;',
  '  height: 100%;',
  '  font-family: Helvetica, Arial, sans-serif;',
  '  font-size: 14px;',
  '}',
  '',
  'h4 {',
  '  color: #999;',
  '}',
  '',
  'a:link, a:visited {',
  '  color: #3b73af;',
  '}',
  '',
  'h4 strong {',
  '  font-weight: normal;',
  '  color: #333;',
  '}',
  '',
  'h4 span {',
  '  padding: 0 2px;',
  '}',
  '',
  '#wrap {',
  '  display: flex;',
  '  height: 100%;',
  '  width: 100%;',
  '  flex-direction: row;',
  '}',
  '',
  '#graph {',
  '  flex: 0 1 100%;',
  '  position: relative;',
  '}',
  '',
  '#graph svg {',
  '  position: absolute;',
  '  left: 0;',
  '  top: 0;',
  '  right: 0;',
  '  bottom: 0;',
  '}',
  '',
  '#details {',
  '  flex: 0 0 33%;',
  '}',
  '',
  '#details h4 {',
  '  font-size: 16px;',
  '  font-weight: 200;',
  '}',
  '',
  '#graph path {',
  '  cursor: pointer;',
  '}',
  '',
  '#graph path:hover {',
  '  opacity: 0.5;',
  '}',
].join('\n');
document.head.appendChild(styles);

var statsData = JSON.parse(document.getElementById('stats-data').innerHTML);

function isTopLevelChild(node) {
  return node.path.indexOf('/') === -1;
}

var defaultRoot = {
  path: '.',
  directory: '.',
  self: 0,
  parent: null,
  children: statsData.filter(isTopLevelChild),
};
defaultRoot.size = _.sumBy(defaultRoot.children, 'size');

function addParentRefsAndName(node) {
  node.name = node.path.split('/').pop();
  node.children.forEach(function addToChild(child) {
    child.parent = node;
    addParentRefsAndName(child);
  });
}
addParentRefsAndName(defaultRoot);

function sliceColor(weight, position, depth) {
  return d3.hsl(position * 360, weight / 2 + 0.5, depth / 4 + 0.75);
}

function formatBytes(byteCount) {
  var pretty = bytes(byteCount * 1024);
  var pct = Math.round(byteCount / defaultRoot.size * 100);
  return `${pretty} / ${pct}%`;
}

var showNodeInfo; // defined further down

function renderWithRoot(rootNode) {
  var maxLevel = (function findMaxLevel(level, node) {
    node.level = level;
    node.children = _.orderBy(node.children, ['size'], ['desc']);
    return Math.max.apply(
      null,
      [node.level].concat(
        node.children.map(function findInChild(child) {
          return findMaxLevel(level + 1, child);
        })
      )
    );
  })(0, rootNode);

  var angleScale = 2 * Math.PI / rootNode.size;
  var sliceSize = HEIGHT / 2 / (maxLevel + 1);
  var slicePadding = 2;

  var svg = d3
    .select('#graph')
    .html('')
    .append('svg')
    .attr('viewBox', '0 0 1000 1000')
    .attr('width', '100%')
    .attr('height', '100%')
    .append('g')
    .attr('transform', `translate(${WIDTH / 2}, ${HEIGHT / 2})`);

  function resetNodeInfo() {
    showNodeInfo(rootNode);
  }

  function renderNode(node, offset) {
    var startAngle = offset * angleScale;
    var arc = d3.svg
      .arc()
      .innerRadius(node.level * sliceSize)
      .outerRadius((node.level + 1) * sliceSize - slicePadding)
      .startAngle(startAngle)
      .endAngle(startAngle + node.size * angleScale);

    var weight = node.size / rootNode.size;
    var position = offset / rootNode.size;
    var depth = (node.level + 1) / (maxLevel + 1);

    svg
      .append('path')
      .attr('d', arc)
      .attr('fill', sliceColor(weight, position, depth))
      .attr('stroke', '#fff')
      .on('mouseover', showNodeInfo.bind(null, node))
      .on('mouseout', resetNodeInfo)
      .on('click', function onNodeClick() {
        if (node.children.length < 1) return;

        if (node !== rootNode) {
          renderWithRoot(node);
        } else if (node.parent) {
          renderWithRoot(node.parent);
        }
      });

    var childOffset = offset + node.self;
    node.children.forEach(function renderChild(child) {
      renderNode(child, childOffset);
      childOffset += child.size;
    });
  }

  renderNode(rootNode, 0);
  resetNodeInfo();
}

showNodeInfo = function _showNodeInfo(node) {
  var details = d3.select('#details').html('');

  var h4 = details.append('h4');
  var segments = node.path === '.' ? [] : node.path.split('/');
  segments.unshift('.');
  var leaf = segments.pop();
  var segmentNode = defaultRoot;
  segments.forEach(function handleSegment(segment) {
    if (segment !== '.') {
      segmentNode = _.find(segmentNode.children, { name: segment });
    }
    h4
      .append('a')
      .attr('href', '#')
      .text(segment)
      .on('click', _.partial(renderWithRoot, segmentNode));
    h4.append('span').text('/');
  });

  h4.append('strong').text(leaf === '.' ? defaultRoot.name : leaf);

  var statsList = details.append('dl');
  statsList.append('dt').text('Total Size');
  statsList.append('dd').text(formatBytes(node.size));
  statsList.append('dt').text('Size without deps');
  statsList.append('dd').text(formatBytes(node.self));
};

renderWithRoot(defaultRoot);
