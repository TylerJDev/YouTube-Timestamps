function timestampToSeconds(timestamp) {
  if (timestamp.split(':').length <= 3 && timestamp.indexOf(':') >= 0) { // If valid timestamp, i.e, timestamp.split(':') => ['00', '00', '00'].length = 3
    timestamp = timestamp.replace(/[:]/gi, '');

    // timestamp = 2:00, needs to be 00:02:00
    const currentT_count = (6 - timestamp.length);

    timestamp = currentT_count > 0 ? `${'0'.repeat(currentT_count)}${timestamp}`.match(/.{0,2}/g) : timestamp.match(/.{0,2}/g);
    timestamp.pop();
    timestamp = timestamp.join(':');

    var defTime = new Date(`Jan 1, 70 ${timestamp} GMT+00:00`);
    return defTime.getTime() / 1000;
  }

  return false; // Default, if clause didn't pass
}

function determineTimeSlot(time, tracks) { // 65, ['00:03', '2:38', '4:00'];
  // Current time in seconds
  var currTime = time; // 65

  // Filter through the entire timestamps array, if current timestamp time is less than "this" timestamp time ...
  var trackTypes = tracks.filter(trackTime => currTime < timestampToSeconds(trackTime));

  if (!trackTypes.length && currTime > timestampToSeconds(tracks[tracks.length - 1])) { // If last track
    return tracks.filter(trackTime => currTime > timestampToSeconds(trackTime[0])).reverse()[0];
  }

  // Find the exact timestamp that matches the above var "trackTypes"
  var currentSlot = tracks[tracks.indexOf(trackTypes[0]) - 1]; // Find index of trackTypes, get the array element (index) before this
  return currentSlot;
}

module.exports = {timestampToSeconds, determineTimeSlot}
