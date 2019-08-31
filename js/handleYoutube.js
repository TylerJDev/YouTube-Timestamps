var targetEle = document.querySelector('head > title');
var targetHref = '';
var timeStampObj = {'links_tracks': []};
var activeTimeUpdate = false;
var currentDescr;
var mutationSet = false;
var cContent = false;

var targetObserve = new MutationObserver(function(c_mutation) {
  console.log('Change in title!');
  // Check the URL, ensure that it's a "video"
  var currentHref = window.location.href;

  if (currentHref.indexOf('/watch?v=') >= 0) {
    mutationSet = false, cContent = false;
    var video = document.querySelector('#container .html5-video-container > video.video-stream')
    // var result = findCurrentTimestamps(Math.floor(video.currentTime));
    if (!activeTimeUpdate) {
      activeTimeUpdate = true;
      // video.ontimeupdate = (event) => {
      video.addEventListener('timeupdate', timeUpdate);

      function timeUpdate() {
        // Check for current track
        console.log('!');
        var boolPara = timeStampObj.links_tracks.length ? false : true; // (currentHref !== timeStampObj.current_video) ? true : false; // if not href from previous timestampObj ...
        var timeObj = findCurrentTimestamps(Math.floor(video.currentTime), boolPara, timeStampObj.links_tracks, cContent);

        if (timeObj) {
          timeStampObj = timeObj;
        } else {
          var yt_content = document.querySelector('#yt_timestamp_container');

          if (yt_content !== null) {
            yt_content.parentNode.removeChild(yt_content); // Remove appended content
          }

          activeTimeUpdate = false;
          video.removeEventListener('timeupdate', timeUpdate);
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

function findCurrentTimestamps(currentVideoTime=0, searchForTimestamps=true, timestamps_current=[], commentContent=false, ) {
  // Check if any timestamps currently exist
  var descriptionContent = document.querySelector('#description > .content');

  if (commentContent !== false) {
    descriptionContent = commentContent;
    console.log(commentContent);
  }


  if (descriptionContent.textContent !== currentDescr) {
    searchForTimestamps = true;
    currentDescr = descriptionContent.textContent;
    timestampObj = {'links_tracks': []};
    timestamps_current = [];
  }

  if (!descriptionContent.querySelectorAll('a').length) {
    return commentContent === false ? checkCommentsForTimestamps() : false; // If no links (timestamps) are found in the description
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
    var timestampObj = {'links_tracks': timestamps_current, 'current_link': currentTimestamp[0][0], 'current_track': currentTimestamp[0][1], 'current_video': window.location.href, 'current_index': ''};

    if (isNaN(timestampToSeconds(timestampObj.links_tracks[0][0].textContent.trim()))) { // If the first element in links_track text !== number
      return false;
    }

    timestampObj.links_tracks.forEach(function(x, index) {
      if (x[1] === timestampObj.current_track) {
        timestampObj.current_index = index;
      }
    });

    if (!timestampObj.current_link.classList.contains('selected_yt_timestamp_link')) {
      // Remove previous selected classes
      Array.from(document.querySelectorAll('a.selected_yt_timestamp_link'), curr => curr.classList.remove('selected_yt_timestamp_link'));
    }

    // Add class to current link
    timestampObj.current_link.classList.add('selected_yt_timestamp_link');

    // Create heading if it doesn't exist
    var headingTimestampTitle = document.querySelector('h2.yt_timestamp_nowplaying');

    // Create Next/Previous buttons
    var nextPrevButtons = document.querySelector('button.yt_timestamp_controls');

    function changeByControl(currEle) {
      const currentControlType = this.attributes['data-controltype'].value;

      if (currentControlType === 'next') {
        document.querySelector('#container .html5-video-container > video.video-stream').currentTime = timestampToSeconds(timeStampObj.links_tracks[timeStampObj.current_index + 1][0].textContent);
      } else if (currentControlType === 'previous') {
        document.querySelector('#container .html5-video-container > video.video-stream').currentTime = timestampToSeconds(timeStampObj.links_tracks[timeStampObj.current_index - 1][0].textContent);
      }
    }

    var hideBtn = timeStampObj.current_index === 0 ? '.yt_timestamp_prev' : timestampObj.current_index + 1 === timeStampObj.links_tracks.length ? '.yt_timestamp_next' : false;

    if (headingTimestampTitle === null) {
      // Create a container
      document.querySelector('#container > h1.title').insertAdjacentHTML('afterend', `<div id="yt_timestamp_container"></div>`);

      document.querySelector('#yt_timestamp_container').insertAdjacentHTML('afterbegin', `<h2 class="title style-scope ytd-video-primary-info-renderer yt_timestamp_nowplaying">Now Playing: ${timestampObj.current_track}</h2>`);
      if (nextPrevButtons === null) { // Double check
        document.querySelector('h2.yt_timestamp_nowplaying').insertAdjacentHTML('beforebegin', `<button class="yt_timestamp_controls yt_timestamp_prev" aria-label="Previous Track" data-controltype="previous"> < </button>`);
        document.querySelector('h2.yt_timestamp_nowplaying').insertAdjacentHTML('afterend', `<button class="yt_timestamp_controls yt_timestamp_next" aria-label="Next Track" data-controltype="next"> > </button>`);
        Array.from(document.querySelectorAll('button.yt_timestamp_controls'), x => x.addEventListener('click', changeByControl));
      }
    } else if (headingTimestampTitle.textContent !== timeStampObj.current_track) {
      // Add title to heading
      headingTimestampTitle.textContent = timestampObj.current_track;
    }

    Array.from(document.querySelectorAll('button.yt_disabled_btn'), curr => curr.classList.remove('yt_disabled_btn')); // Remove class from existing buttons
    if (hideBtn !== false) {
      document.querySelector(hideBtn).classList.add('yt_disabled_btn');
    }

    return timestampObj;
  } else {
    return commentContent === false ? checkCommentsForTimestamps() : false;
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

function checkCommentsForTimestamps() {
  var titleObserve = new MutationObserver(function(curr_mutation) {
    if (document.querySelector('ytd-comments#comments #contents').childElementCount > 0) {
      var setupCommentCheck = new Promise((resolve, reject) => {
        setTimeout(function() {
          resolve(document.querySelector('ytd-comments#comments #contents').children);
        }, 1500);
      });

      setupCommentCheck.then((result) => {
        var toArray = Array.from(result);
        for (var currNode in toArray) {
          if (findCurrentTimestamps(Math.floor(document.querySelector('#container .html5-video-container > video.video-stream').currentTime), true, [], toArray[currNode]) !== false) {
            cContent = toArray[currNode];
            break;
          }
        }
      });

      titleObserve.disconnect();
    }
  });

  if (document.querySelector('ytd-comments#comments #contents') !== null && document.querySelector('ytd-comments#comments #contents').childElementCount === 0 && mutationSet === false) {
    titleObserve.observe(document.querySelector('ytd-comments#comments #contents'), {
      childList: true // # DEV-NOTE Possible replace this with characterData && characterDataOldValue
    });
    mutationSet = true;
  } else {
    return false;
  }
}

// checkCommentsForTimestamps();
