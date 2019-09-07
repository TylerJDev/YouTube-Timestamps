const mock = require('./mocks/MutationObserver.mock'); // @https://jestjs.io/docs/en/manual-mocks
const c_timestamps = require('../handleYoutube.js');

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

describe('Tesitng findTimestamp module', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
    `<div id="container">` +
      `<h1 class="title"></h1>` +
      '<div id="description">' +
        '<div class="content">' +
          '<a href="/watch?v=123456=0s">00:00</a>' +
          '<a href="/watch?v=123456=0s">00:01</a>' +
          '<a href="/watch?v=123456=3s">00:03</a>' +
          '<a href="/watch?v=123456=3s">Nani!?</a>' +
          '<video class="video-stream"></video>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  test('Check currentTimestamp Times', () => {
    expect(c_timestamps.findCurrentTimestamps()['links_tracks'].length).toEqual(3);
  });
});

describe('Testing grabbing timestamp text', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
    `<div id="container">` +
      `<h1 class="title"></h1>` +
      '<div id="description">' +
        '<div class="content">Sounds by Yoko Shimomura ^-^' +
          'Not all songs are in this video, but I hope you enjoy :3\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=0s">00:00</a> Otar Botkoveli Debate\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=246s">04:06</a> Prague - First visit ambience\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=453s">07:33</a> Prague - General ambience\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=453s">09:33</a> Prague - General ambience Part 2\n' +
          'Detroit City ambience<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=1833s">30:33</a>\n' +
          '<video class="video-stream"></video>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  test('Grab correct timestamp text', () => {
    expect(c_timestamps.findCurrentTimestamps()['links_tracks'][0][1]).toBe('Otar Botkoveli Debate');
    expect(c_timestamps.findCurrentTimestamps()['links_tracks'][4][1]).toBe('Detroit City ambience');
  });

  test('Grab current track', () => {
    expect(c_timestamps.findCurrentTimestamps(430)['current_track']).toBe('Prague First visit ambience');
    expect(c_timestamps.findCurrentTimestamps(4300)['current_track']).toBe('Detroit City ambience');
    expect(c_timestamps.findCurrentTimestamps(0)['current_track']).toBe('Otar Botkoveli Debate');
  });
});

describe('Testing correct attributes on links', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
    `<div id="container">` +
      `<h1 class="title"></h1>` +
      '<div id="description">' +
        '<div class="content">Sounds by Yoko Shimomura ^-^' +
          'Not all songs are in this video, but I hope you enjoy :3\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=0s">00:00</a> Otar Botkoveli Debate\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=246s">04:06</a> Prague - First visit ambience\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=453s">07:33</a> Prague - General ambience\n' +
          '<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=453s">09:33</a> Prague - General ambience Part 2\n' +
          'Detroit City ambience<a class="yt-simple-endpoint style-scope yt-formatted-string yt_timestamp_link" spellcheck="false" href="/watch?v=7lERcfsqJSk&amp;t=1833s">30:33</a>\n' +
          '<video class="video-stream"></video>' +
        '</div>' +
      '</div>' +
    '</div>';
  });

  test('Testing current class added to current timestamp link', () => {
    c_timestamps.findCurrentTimestamps(0);
    expect(document.querySelectorAll('a.selected_yt_timestamp_link').length).toBeTruthy();
    expect(document.querySelector('a.selected_yt_timestamp_link').textContent).toBe('00:00');

    c_timestamps.findCurrentTimestamps(430);
    expect(document.querySelectorAll('a.selected_yt_timestamp_link').length).toBe(1);
    expect(document.querySelector('a.selected_yt_timestamp_link').textContent).toBe('04:06');
  });
});
