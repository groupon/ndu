'use strict';

const assert = require('assert');
const sumBy = require('lodash.sumby');

const generateDependencyStats = require('..');

describe('generateDependencyStats', () => {
  it('is a function', () => {
    assert.strictEqual(typeof generateDependencyStats, 'function');
  });

  describe('ndu dependency stats', () => {
    let nduStats;
    before(() => generateDependencyStats().then(stats => (nduStats = stats)));

    it('includes a node for mocha', () => {
      const mocha = nduStats.find(x => x.path === 'mocha');

      assert.ok(mocha, 'Mocha is part of the stats');
      assert.strictEqual(mocha.directory, 'node_modules/mocha');
      assert.strictEqual(typeof mocha.size, 'number');
      assert.strictEqual(typeof mocha.self, 'number');
      assert.ok(mocha.size >= mocha.self);
    });

    it('size = self + children.size', () => {
      function verifyNode(node) {
        assert.strictEqual(
          node.self + sumBy(node.children, 'size'),
          node.size,
          `${node.path}#size adds up`
        );
      }
      nduStats.forEach(verifyNode);
    });
  });
});
