const bittrex = require('../')({});

describe('Exchange class', () => {
  it('should contain coorect methods', () => {
    expect(bittrex.preInit).toBeDefined();
    expect(bittrex.fetchBalances).toBeDefined();
    expect(bittrex.fetchMarketHistory).toBeDefined();
  });
});
