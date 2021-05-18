import * as assert from 'assert';
import * as vsc from 'vscode';

suite('Extension Test Suite', () => {
  vsc.window.showInformationMessage('Start all tests.');

  test('Sample test', () => {
    assert.strictEqual(-1, [1, 2, 3].indexOf(5));
    assert.strictEqual(-1, [1, 2, 3].indexOf(0));
  });
});
