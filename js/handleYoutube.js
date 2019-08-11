var targetEle = document.querySelector('head > title');
var targetHref = '';
var timeStampObj = {'links_tracks': []};
var activeTimeUpdate = false;
var currentDescr;

var targetObserve = new MutationObserver(function(c_mutation) {
  console.log('Change in title!');
  // Check the URL, ensure that it's a "video"
  var currentHref = window.location.href;

  if (currentHref.indexOf('/watch?v=') >= 0) {
    var video = document.querySelector('#container .html5-video-container > video.video-stream')
    // var result = findCurrentTimestamps(Math.floor(video.currentTime));
    if (!activeTimeUpdate) {
      activeTimeUpdate = true;
      video.ontimeupdate = (event) => {
        // Check for current track
        var boolPara = timeStampObj.links_tracks.length ? false : true; // (currentHref !== timeStampObj.current_video) ? true : false; // if not href from previous timestampObj ...
        var timeObj = findCurrentTimestamps(Math.floor(video.currentTime), boolPara, timeStampObj.links_tracks);

        if (timeObj) {
          timeStampObj = timeObj;
        }
      };
    }
    /* if (result && targetHref !== currentHref) {
    targetHref = currentHref;
  } */
}
});

targetObserve.observe(targetEle, {
  childList: true // # DEV-NOTE Possible replace this with characterData && characterDataOldValue
});

function findCurrentTimestamps(currentVideoTime=0, searchForTimestamps=true, timestamps_current=[]) {
  // Check if any timestamps currently exist
  var descriptionContent = document.querySelector('#description > .content');

  if (descriptionContent.textContent !== currentDescr) {
    searchForTimestamps = true;
    currentDescr = descriptionContent.textContent;
    timestampObj = {'links_tracks': []};
    timestamps_current = [];
  }

  if (!descriptionContent.querySelectorAll('a').length) {
    return false; // If no links (timestamps) are found
  }

  var currentLinks = Array.from(descriptionContent.querySelectorAll('a'));
  // var timestamps_current = [];
  if (searchForTimestamps === true) {
    // Grab the corresponding timestamp text
    currentLinks.forEach(function(curr, index) {
      var val = timestampToSeconds(curr.textContent);
      if (val >= 0 && typeof val === 'number') {
        curr.classList.add('yt_timestamp_link'); // Add class to proper timestamp link
        timestamps_current.push([curr, grabTimestampText(curr, descriptionContent)]); // timestampToSeconds returns an integer
      }
    });
  }

  // Grab the current track based on currentVideoTime parameter passed
  var currentTimestamp = timestamps_current.filter(currEle => currEle[0].textContent === determineTimeSlot(currentVideoTime, timestamps_current.map(curr => curr[0].textContent)))

  if (currentTimestamp.length) {
    var timestampObj = {'links_tracks': timestamps_current, 'current_link': currentTimestamp[0][0], 'current_track': currentTimestamp[0][1], 'current_video': window.location.href};

    if (!timestampObj.current_link.classList.contains('selected_yt_timestamp_link')) {
      // Remove previous selected classes
      Array.from(document.querySelectorAll('a.selected_yt_timestamp_link'), curr => curr.classList.remove('selected_yt_timestamp_link'));
    }

    // Add class to current link
    timestampObj.current_link.classList.add('selected_yt_timestamp_link');

    // Create heading if it doesn't exist
    var headingTimestampTitle = document.querySelector('h2.yt_timestamp_nowplaying');

    if (headingTimestampTitle === null) {
      document.querySelector('#container > h1.title').insertAdjacentHTML('afterend', `<h2 class="title style-scope ytd-video-primary-info-renderer yt_timestamp_nowplaying">Now Playing: ${timestampObj.current_track}</h2>`);
    } else if (headingTimestampTitle.textContent !== timeStampObj.current_track) {
      // Add title to heading
      headingTimestampTitle.textContent = timestampObj.current_track;
    }

    //console.log(timestampObj);
    return timestampObj;
  }
}

function grabTimestampText(ele, descr) {
  var siblings = [ele.previousSibling, ele.nextSibling]; // [0] = Some random text not related, [1] Proper timestamp text
  var descrText = descr.textContent.split('\n');

  var timestampText = descrText.filter(function(curr, idx) {
    if (siblings[0] !== null && curr.indexOf(siblings[0].textContent.trim()) >= 0 && curr.indexOf(ele.textContent) >= 0) {
      return curr;
    } else if (siblings[1] !== null && curr.indexOf(siblings[1].textContent.trim()) >= 0 && curr.indexOf(ele.textContent) >= 0) {
      return curr;
    } else if (siblings[0] !== null &&
      (siblings[0].textContent.split('\n').length > 1 && curr.indexOf(siblings[0].textContent.trim().split('\n').pop()) >= 0))
    {
      return siblings[0].textContent.split('\n').pop();
    } else if (siblings[1] !== null &&
      (siblings[1].textContent.split('\n').length > 1 && curr.indexOf(siblings[1].textContent.trim().split('\n').pop()) >= 0))
    {
      return siblings[1].textContent.split('\n').pop();
    } else if (curr.indexOf(ele.textContent) >= 0 && curr.replace(ele.textContent).trim().length) {
      return curr.replace(ele.textContent).trim();
    }
  });

  if (timestampText.length) {
    return timestampText[0].replace(ele.textContent, '').trim();
  }
}

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
