const f_timestamps = require('../findTimestamp.js');

describe('Tesitng findTimestamp module', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
    '<div id="description">' +
      '<div class="content">' +
        '<a href="/watch?v=123456=0s">00:00</a>' +
        '<a href="/watch?v=123456=0s">00:01</a>' +
        '<a href="/watch?v=123456=3s">00:03</a>' +
        '<a href="/watch?v=123456=3s">Nani!?</a>' +
        '<video class="video-stream"></video>' +
      '</div>' +
    '</div>';
  });

  test('Check currentTimestamp Times', () => {
    expect(f_timestamps.findCurrentTimestamps()['links_tracks'].length).toEqual(3);
  });
});

describe('Testing grabbing timestamp text', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
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
    '</div>'
  });

  test('Grab correct timestamp text', () => {
    expect(f_timestamps.findCurrentTimestamps()['links_tracks'][0][1]).toBe('Otar Botkoveli Debate');
    expect(f_timestamps.findCurrentTimestamps()['links_tracks'][4][1]).toBe('Detroit City ambience');
  });

  test('Grab current track', () => {
    expect(f_timestamps.findCurrentTimestamps(430)['current_track']).toBe('Prague - First visit ambience');
    expect(f_timestamps.findCurrentTimestamps(4300)['current_track']).toBe('Detroit City ambience');
    expect(f_timestamps.findCurrentTimestamps(0)['current_track']).toBe('Otar Botkoveli Debate');
  });
});

describe('Testing correct attributes on links', () => {
  beforeEach(() => {
    // Create "mock" element
    document.body.innerHTML =
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
    '</div>';
  });

  test('Testing current class added to current timestamp link', () => {
    f_timestamps.findCurrentTimestamps(0);
    expect(document.querySelectorAll('a.yt_timestamp_selected').length).toBeTruthy();
    expect(document.querySelector('a.yt_timestamp_selected').textContent).toBe('00:00');

    f_timestamps.findCurrentTimestamps(430);
    expect(document.querySelectorAll('a.yt_timestamp_selected').length).toBe(1);
    expect(document.querySelector('a.yt_timestamp_selected').textContent).toBe('04:06');
  });
});
