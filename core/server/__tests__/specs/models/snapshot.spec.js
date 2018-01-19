const snapshot = require('../../../src/models/snapshot.model');

describe('Snapshot model', () => {
  it('should contain correct methods', () => {
    expect(snapshot.Snapshot).toBeDefined();
    expect(snapshot.Snapshots).toBeDefined();
  });
});
