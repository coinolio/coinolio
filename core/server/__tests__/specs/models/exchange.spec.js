const Exchange = require('../../../src/models/Exchange');

describe('Exchange class', () => {
  it('should contain coorect methods', () => {
    const testClass = new Exchange();
    expect(testClass.init).toBeDefined();
    expect(testClass.preInit).toBeDefined();
    expect(testClass.fetchBalances).toBeDefined();
    expect(testClass.getBalances).toBeDefined();
    expect(testClass.fetchMarketHistory).toBeDefined();
    expect(testClass.getMarketHistory).toBeDefined();
    expect(testClass.destroy).toBeDefined();
    expect(testClass.handleError).toBeDefined();
  });

  it('should return balances', () => {
    const testClass = new Exchange();
    expect(testClass.getBalances()).toEqual([]);
  });

  it('should return market history', () => {
    const testClass = new Exchange();
    expect(testClass.getMarketHistory()).toEqual([]);
  });
});
