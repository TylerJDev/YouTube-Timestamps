const c_timestamps = require('../currentTimestamp.js');

describe('Tesitng currentTimestamp module', () => {
  test('Check currentTimestamp Times', () => {
    expect(c_timestamps.timestampToSeconds('1:00')).toBe(60);
    expect(c_timestamps.timestampToSeconds('10:00')).toBe(600);
    expect(c_timestamps.timestampToSeconds('59:00')).toBe(3540);
    expect(c_timestamps.timestampToSeconds('2:00')).toBe(120);
    expect(c_timestamps.timestampToSeconds('01:00:00')).toBe(3600);
    expect(c_timestamps.timestampToSeconds('10:00:00')).toBe(36000);
    expect(c_timestamps.timestampToSeconds('00:00:00')).toBe(0);

    // Should be false, due to being more than 2 colons
    expect(c_timestamps.timestampToSeconds('00:00:00:00')).toBeFalsy();
    expect(c_timestamps.timestampToSeconds('Hello, World!')).toBeFalsy();
    expect(c_timestamps.timestampToSeconds('0000')).toBeFalsy();
    expect(c_timestamps.timestampToSeconds('1234')).toBeFalsy();
  });

  test('Get current timestamp time', () => {
    expect(c_timestamps.determineTimeSlot(3, ['0:00', '2:33', '3:56', '6:40', '11:23'])).toBe('0:00');
    expect(c_timestamps.determineTimeSlot(690, ['0:00', '2:33', '3:56', '6:40', '11:23'])).toBe('11:23');
    expect(c_timestamps.determineTimeSlot(20, ['0:05', '0:10', '0:19'])).toBe('0:19');
  })
});
