'use strict';
const assert = require('assertive');
const _ = require('lodash');

const generateDependencyStats = require('../');

describe('generateDependencyStats', () => {
  it('is a function', () => {
    assert.hasType(Function, generateDependencyStats);
  });

  describe('ndu dependency stats', () => {
    let nduStats;
    before(() =>
      generateDependencyStats().then(stats => nduStats = stats));

    it('includes a node for mocha', () => {
      const mocha = _.find(nduStats, { path: 'mocha' });
      assert.truthy('Mocha is part of the stats', mocha);
      assert.equal('node_modules/mocha', mocha.directory);
      assert.hasType(Number, mocha.size);
      assert.hasType(Number, mocha.self);
      assert.expect(mocha.size >= mocha.self);
    });

    it('size = self + children.size', () => {
      function verifyNode(node) {
        assert.equal(`${node.path}#size adds up`,
          node.size,
          node.self + _.sumBy(node.children, 'size')
        );
      }
      nduStats.forEach(verifyNode);
    });
  });
});
