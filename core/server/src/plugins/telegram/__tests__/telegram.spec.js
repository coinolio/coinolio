const Plugin = require('../../Plugin');
const Telegram = require('../index');
jest.mock('../../Plugin');

beforeEach(() => {
  // Clear all instances and calls to constructor and all methods:
  Plugin.mockClear();
});

describe('Telegram plugin', () => {
  it('should be extended from Plugin constructor', () => {
    const telegram = new Telegram(); // eslint-disable-line
    expect(Plugin).toHaveBeenCalledTimes(1);
  });

  it('should contain correct methods', () => {
    const telegram = new Telegram();
    expect(telegram.init).toBeDefined();
    expect(telegram.sendPayload).toBeDefined();
    expect(telegram.formatTrade).toBeDefined();
    expect(telegram.formatSummary).toBeDefined();
    expect(telegram.destroy).toBeDefined();
  });
});
