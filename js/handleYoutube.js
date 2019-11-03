const targetEle = document.querySelector('head > title');
const allowDebug = true;
let timeStampObj = {'links_tracks': []};
let activeTimeUpdate = false;
let currentDescr;
let mutationSet = false;
let cContent = false;
let timestampHistory = {'history': {}};
let withinComments = '';
let settings = {'toggle_heading': true, 'disable_background': true, 'below_title': true, 'above_title': false};

const targetObserve = new MutationObserver(function(cMutation) {
  consoleLogger('log', 'Change in title!');
  // Check the URL, ensure that it's a "video"
  const currentHref = window.location.href;

  if (currentHref.indexOf('/watch?v=') >= 0) {
    mutationSet = false, cContent = false, withinComments = '';
    const video = document.querySelector('#container .html5-video-container > video.video-stream');

    if (!activeTimeUpdate) {
      activeTimeUpdate = true;
      // video.ontimeupdate = (event) => {
      video.addEventListener('timeupdate', timeUpdate);

      function timeUpdate() {
        // Check for current track
        const boolPara = timeStampObj.links_tracks.length ? false : true; // (currentHref !== timeStampObj.current_video) ? true : false; // if not href from previous timestampObj ...

        if (Object.keys(timestampHistory.history).length) {
          let historyKeys = Object.keys(timestampHistory.history);

          if (historyKeys.indexOf(window.location.href.substring(0, 43)) >= 0) {
            // console.log(`Found previous timestamp comment, at ${timestampHistory.history[window.location.href.substring(0, 43)]}`, document.querySelector('#comments #sections > #contents').children[timestampHistory.history[window.location.href.substring(0, 43)]]);
            cContent = document.querySelector('#comments #sections > #contents').children[timestampHistory.history[window.location.href.substring(0, 43)]];
          }
        }

        const timeObj = findCurrentTimestamps(Math.floor(video.currentTime), boolPara, timeStampObj.links_tracks, cContent);

        if (timeObj) {
          timeStampObj = timeObj;
        } else {
          const ytContent = document.querySelector('#yt_timestamp_container');

          if (ytContent !== null) {
            ytContent.parentNode.removeChild(ytContent); // Remove appended content
          }

          // console.log(withinComments);
          if (withinComments === false) {
            activeTimeUpdate = false;
            video.removeEventListener('timeupdate', timeUpdate);
          }
        }
      };
    }
    /* if (result && targetHref !== currentHref) {
    targetHref = currentHref;
  } */
  }
});

targetObserve.observe(targetEle, {
  childList: true, // # DEV-NOTE Possible replace this with characterData && characterDataOldValue
});

function findCurrentTimestamps(currentVideoTime=0, searchForTimestamps=true, timestampsCurrent=[], commentContent=false, ) {
  // Check if any timestamps currently exist
  let descriptionContent = document.querySelector('#description > .content');
  let descriptionContentFrag = document.createDocumentFragment().appendChild(descriptionContent.cloneNode(true));

  if (commentContent !== false) {
    descriptionContent = commentContent;
  }

  if (descriptionContent.textContent !== currentDescr) {
    searchForTimestamps = true;
    currentDescr = descriptionContent.textContent;
    timestampObj = {'links_tracks': []};
    timestampsCurrent = [];
  }

  if (!descriptionContent.querySelectorAll('a').length) {
    return commentContent === false ? checkCommentsForTimestamps() : false; // If no links (timestamps) are found in the description
  }

  const currentLinks = Array.from(descriptionContent.querySelectorAll('a'));
  if (searchForTimestamps === true) {
    // Grab the corresponding timestamp text
    currentLinks.forEach(function(curr, index) {
      const val = timestampToSeconds(curr.textContent);
      if (val >= 0 && typeof val === 'number') {
        curr.classList.add('yt_timestamp_link'); // Add class to proper timestamp link

        // Check if link is not unique
        let this_href = curr.attributes.href.value;
        let duplicateLinks = descriptionContent.querySelectorAll(`a[href="${this_href}"]`);

        timestampsCurrent.push([curr, grabTimestampText(curr, descriptionContent, this_href, duplicateLinks)]); // timestampToSeconds returns an integer
      }
    });
  }

  // Grab the current track based on currentVideoTime parameter passed
  let currentTimestamp = timestampsCurrent.filter((currEle) => currEle[0].textContent === determineTimeSlot(currentVideoTime, timestampsCurrent.map((curr) => curr[0].textContent)));

  if (currentTimestamp.length === 2) {
    console.warn('2 non-unique timestamps found!');
    currentTimestamp = [currentTimestamp[1]];
  }

  if (currentTimestamp.length) {
    if (commentContent !== false && timestampsCurrent.length <= 4) { // If searching through comment(s) and links found is less or equal to 4
      return false;
    }

    const timestampObj = {'links_tracks': timestampsCurrent, 'current_link': currentTimestamp[0][0], 'current_track': currentTimestamp[0][1], 'current_video': window.location.href, 'current_index': ''};

    if (isNaN(timestampToSeconds(timestampObj.links_tracks[0][0].textContent.trim()))) { // If the first element in links_track text !== number
      return false;
    }

    timestampObj.links_tracks.forEach(function(x, index) {
      if (x[0] === timestampObj.current_link) {
        timestampObj.current_index = index;
      }
    });

    /* console.log(timestampObj.current_link, withinComments);
    if (!timestampToSeconds(timestampObj.current_link.textContent)) {
      return commentContent === false ? checkCommentsForTimestamps() : false; // If no links (timestamps) are found in the description
    } */

    if (!timestampObj.current_link.classList.contains('selected_yt_timestamp_link')) {
      // Remove aria-describedby
      Array.from(document.querySelectorAll('a.selected_yt_timestamp_link'), (curr) => curr.removeAttribute('aria-describedby'));

      // Remove previous selected classes
      Array.from(document.querySelectorAll('a.selected_yt_timestamp_link'), (curr) => curr.classList.remove('selected_yt_timestamp_link'));
    }

    const hideBg = settings.disable_background === true ? '' : 'yt_timestamps_bg_hide';

    // Add class to current link
    timestampObj.current_link.classList.add('selected_yt_timestamp_link');
    if (hideBg.length) {
      timestampObj.current_link.classList.add(hideBg);
    }

    if (document.querySelector('a.selected_yt_timestamp_link') !== null) {
      document.querySelector('a.selected_yt_timestamp_link').setAttribute('aria-describedby', 'yt_timestamp_title_playing');
    }

    // Create heading if it doesn't exist
    const headingTimestampTitle = document.querySelector('h2.yt_timestamp_nowplaying');

    // Create Next/Previous buttons
    const nextPrevButtons = document.querySelector('button.yt_timestamp_controls');

    function changeByControl(currEle) {
      const currentControlType = this.attributes['data-controltype'].value;

      if (currentControlType === 'next') {
        document.querySelector('#container .html5-video-container > video.video-stream').currentTime = timestampToSeconds(timeStampObj.links_tracks[timeStampObj.current_index + 1][0].textContent);
      } else if (currentControlType === 'previous') {
        let count = timestampToSeconds(timeStampObj.current_link.textContent) === timestampToSeconds(timeStampObj.links_tracks[timeStampObj.current_index - 1][0].textContent) ? 2 : 1;

        document.querySelector('#container .html5-video-container > video.video-stream').currentTime = timestampToSeconds(timeStampObj.links_tracks[timeStampObj.current_index - count][0].textContent);
      }
    }

    const hideBtn = timeStampObj.current_index === 0 ? '.yt_timestamp_prev' : timestampObj.current_index + 1 === timeStampObj.links_tracks.length ? '.yt_timestamp_next' : false;

    if (headingTimestampTitle === null) {
      const hideHeading = settings.toggle_heading === true ? '' : 'yt_timestamps_hide';
      const containerPosition = settings.below_title === true ? 'afterend' : settings.above_title === true ? 'beforebegin' : 'afterend';
      console.log(settings.toggle_heading, settings, hideHeading);

      // Create a container
      document.querySelector('#container > h1.title').insertAdjacentHTML(containerPosition, `<div id="yt_timestamp_container"></div>`);

      document.querySelector('#yt_timestamp_container').insertAdjacentHTML('afterbegin', `<h2 id="yt_timestamp_title_playing" class="${hideHeading + ' ' + hideBg} title style-scope ytd-video-primary-info-renderer yt_timestamp_nowplaying" aria-live="polite" role="status">Now Playing: ${timestampObj.current_track}</h2>`);
      if (nextPrevButtons === null) { // Double check
        document.querySelector('h2.yt_timestamp_nowplaying').insertAdjacentHTML('beforebegin', `<button class="${hideBg} yt_timestamp_controls yt_timestamp_prev" aria-label="Previous Track" data-controltype="previous"> &#9664; </button>`);
        document.querySelector('h2.yt_timestamp_nowplaying').insertAdjacentHTML('afterend', `<button class="${hideBg} yt_timestamp_controls yt_timestamp_next" aria-label="Next Track" data-controltype="next"> &#9658; </button>`);
        Array.from(document.querySelectorAll('button.yt_timestamp_controls'), (x) => x.addEventListener('click', changeByControl));

        // Reuse next/prev buttons
        const nextPrev = [document.querySelector('.ytp-left-controls .ytp-next-button svg'), document.querySelector('.ytp-left-controls .ytp-prev-button svg')];
        if (nextPrev.indexOf(null) === -1) {
          const nextPrevElements = [document.querySelector('.yt_timestamp_next'), document.querySelector('.yt_timestamp_prev')];
          nextPrevElements.forEach(function(curr, index, arr) {
            curr.textContent = '';
            curr.insertAdjacentHTML('afterbegin', nextPrev[index].outerHTML);
          });
        }
      }
    } else if (headingTimestampTitle.textContent !== timeStampObj.current_track) {
      // Add title to heading
      headingTimestampTitle.textContent = timestampObj.current_track;
    }

    // If video does not contain timestamps, ensure timeStampObj is empty, only with key 'links_track'
    if (timeStampObj.current_link !== undefined && (timeStampObj.current_link.parentNode === null || timeStampObj.current_link.href.substring(0, 43) !== window.location.href.substring(0, 43))) {
      if (timestampObj.current_track !== timeStampObj.current_track) {
        timeStampObj = timestampObj;
        return timestampObj;
      }

      timeStampObj = {'links_tracks': []};
      return false;
    }

    // Adjust color based on current settings within {settings} global
    if (document.querySelector('#yt_timestamp_container').children.length 
       && (document.querySelector('#yt_timestamp_container').children[0].getAttribute('style') !== null
       && document.querySelector('#yt_timestamp_container').children[0].getAttribute('style').indexOf(settings.color.trim() + ' !important') === -1)
       ) {
      consoleLogger('log', 'Color has been changed', 'to', settings.color.trim());
      Array.from(document.querySelector('#yt_timestamp_container').children, currElem => currElem.setAttribute('style', 'background-color: ' + settings.color.trim() + ' !important'));
    }

    if (hideBtn !== false 
       && (document.querySelector(hideBtn) !== null && document.querySelector(hideBtn).classList.contains('yt_disabled_btn') === false)) {
      consoleLogger('log', 'yt_disabled_btn has been added to:', hideBtn);
      document.querySelector(hideBtn).classList.add('yt_disabled_btn');
    } else if (hideBtn === false && document.querySelector('button.yt_disabled_btn') !== null) {
      consoleLogger('log', 'yt_disabled_btn has been removed');
      document.querySelector('button.yt_disabled_btn') !== null ? document.querySelector('button.yt_disabled_btn').classList.remove('yt_disabled_btn') : '';
    }

    return timestampObj;
  } else {
    return commentContent === false ? checkCommentsForTimestamps() : false;
  }
}

function grabTimestampText(ele, descr, href, nonUnique) {
  const siblings = [ele.previousSibling, ele.nextSibling]; // [0] = Some random text not related, [1] Proper timestamp text
  const descrText = descr.textContent.split('\n');
  let defTitle = '';

  const timestampText = descrText.filter(function(curr, idx) {


    // @ If previous sibling exists, and this current line within the description has the previous sibling's text content as well as timestamp which was passed in this function
    if (siblings[0] !== null && curr.indexOf(siblings[0].textContent.trim()) >= 0 && curr.indexOf(ele.textContent) >= 0 && ele === nonUnique[nonUnique.length - 1]) {
      return curr;
    } else if (siblings[1] !== null && curr.indexOf(siblings[1].textContent.trim().split('\n')[0]) >= 0 && curr.indexOf(ele.textContent) >= 0) {
      defTitle = curr;
      return curr;
    } else if (siblings[0] !== null &&
      (siblings[0].textContent.split('\n').length > 1 && curr.indexOf(siblings[0].textContent.trim().split('\n').pop()) >= 0 && curr.indexOf(ele.textContent) >= 0)) {
      return siblings[0].textContent.split('\n').pop();
    } else if (siblings[1] !== null &&
      (siblings[1].textContent.split('\n').length > 1 && curr.indexOf(siblings[1].textContent.trim().split('\n').pop()) >= 0)) {
      return siblings[1].textContent.split('\n').pop();
    } else if (curr.indexOf(ele.textContent) >= 0 && curr.replace(ele.textContent).trim().length) {
      return curr.replace(ele.textContent).trim();
    }
  });

  if (nonUnique.length > 1 && ele === nonUnique[nonUnique.length - 1] && timestampText.length === 2) {
    timestampText.shift();
  }

  if (timestampText.length <= 5) {
    return parseString(timestampText[0], ele.textContent);
  } else {
    return parseString(defTitle, ele.textContent);
  }
}

/** 
* Parse Timestamp Text
*
* @param {string} str - The string to pare
* @param {string} content - The original timestamp itself ("0:00")
*
* @example
*
*   parseString('1:00 Best Track Ever', '1:00')
*/

const parseString = (str, content) => {
  var hasTimestamp = str.replace(/[\[\]()]+/g, '').split(' ').filter(currStr => timestampToSeconds(currStr));

  if (hasTimestamp.length) {
    for (let foundStamps in hasTimestamp) {
      str = str.replace(hasTimestamp[foundStamps], '');
    }
  }

  return str.replace(content, '')
    .replace(/[()\[\]-] +/gi, '')
    .replace(':', '').trim();
}

function timestampToSeconds(timestamp) {
  if (timestamp.split(':').length <= 3 && timestamp.indexOf(':') >= 0) { // If valid timestamp, i.e, timestamp.split(':') => ['00', '00', '00'].length = 3
    timestamp = timestamp.replace(/[:]/gi, '');

    // timestamp = 2:00, needs to be 00:02:00
    const currentTcount = (6 - timestamp.length);

    timestamp = currentTcount > 0 ? `${'0'.repeat(currentTcount)}${timestamp}`.match(/.{0,2}/g) : timestamp.match(/.{0,2}/g);
    timestamp.pop();
    timestamp = timestamp.join(':');

    const defTime = new Date(`Jan 1, 70 ${timestamp} GMT+00:00`);
    return defTime.getTime() / 1000;
  }

  return false; // Default, if clause didn't pass
}

function determineTimeSlot(time, tracks) { // 65, ['00:03', '2:38', '4:00'];
  // Current time in seconds
  const currTime = time; // 65

  // Filter through the entire timestamps array, if current timestamp time is less than "this" timestamp time ...
  const trackTypes = tracks.filter((trackTime) => currTime < timestampToSeconds(trackTime));

  if (!trackTypes.length && currTime > timestampToSeconds(tracks[tracks.length - 1])) { // If last track
    return tracks.filter((trackTime) => currTime > timestampToSeconds(trackTime[0])).reverse()[0];
  }

  // Find the exact timestamp that matches the above var "trackTypes"
  const currentSlot = tracks[tracks.indexOf(trackTypes[0]) - 1]; // Find index of trackTypes, get the array element (index) before this

  if (currentSlot === undefined && currTime < timestampToSeconds(trackTypes[0])) { // This is for a specific issue, @ watch?v=_MVcJDzX-OU
    return trackTypes[0]; // If no timestamp is found (currentSlot) and current video time is LESS than first trackTypes item, return first trackTypes item
  }

  return currentSlot;
}

function checkCommentsForTimestamps() {
  const titleObserve = new MutationObserver(function(currMutation) {
    if (document.querySelector('ytd-comments#comments #contents').childElementCount > 0) {
      const setupCommentCheck = new Promise((resolve, reject) => {
        setTimeout(function() {
          resolve(document.querySelector('ytd-comments#comments #contents').children);
        }, 1500);
      });

      setupCommentCheck.then((result) => {
        const toArray = Array.from(result);
        for (const currNode in toArray) {
          if (findCurrentTimestamps(Math.floor(document.querySelector('#container .html5-video-container > video.video-stream').currentTime), true, [], toArray[currNode]) !== false) {
            cContent = toArray[currNode];
            timestampHistory.history[window.location.href.substring(0, 43)] = Array.from(toArray[currNode].parentNode.children).indexOf(toArray[currNode])

            break;
          }
        }

        if (cContent === false) { // If no timestamps are found within the comments
          withinComments = false;
        }
      });

      titleObserve.disconnect();
    }
  });

  if (document.querySelector('ytd-comments#comments #contents') !== null && document.querySelector('ytd-comments#comments #contents').childElementCount === 0 && mutationSet === false) {
    titleObserve.observe(document.querySelector('ytd-comments#comments #contents'), {
      childList: true,
    });
    mutationSet = true;
  } else {
    return false;
  }
}

function runSettings(currSettings) {
  var changedSetting = Object.keys(currSettings.plugin_settings.oldValue).filter(function(curr, idx) {
    if (currSettings.plugin_settings.oldValue[curr] !== currSettings.plugin_settings.newValue[curr]) {
      return curr;
    }
  });

  consoleLogger('log', currSettings);
  consoleLogger('log', changedSetting);

  if (changedSetting.indexOf('toggle_heading') > -1) {
    settings.toggle_heading === true ?
    document.querySelector('#yt_timestamp_title_playing').classList.remove('yt_timestamps_hide') :
    document.querySelector('#yt_timestamp_title_playing').classList.add('yt_timestamps_hide');
  }

  if (changedSetting.indexOf('disable_background') > -1) {
    settings.disable_background === true ?
    Array.from(document.querySelectorAll('h2.yt_timestamp_nowplaying, button.yt_timestamp_controls, a.selected_yt_timestamp_link'), x => x.classList.remove('yt_timestamps_bg_hide')) :
    Array.from(document.querySelectorAll('h2.yt_timestamp_nowplaying, button.yt_timestamp_controls, a.selected_yt_timestamp_link'), x => x.classList.add('yt_timestamps_bg_hide'));
  }

  if (changedSetting.indexOf('above_title') > -1 || changedSetting.indexOf('below_title') > -1) {
    if (settings.below_title) {
      document.querySelector('#info #container').insertBefore(document.querySelector('#yt_timestamp_container'), document.querySelector('#container > h1.title').nextSibling);
    } else if (settings.above_title) {
      document.querySelector('#info #container').insertBefore(document.querySelector('#yt_timestamp_container'), document.querySelector('#container > h1.title'));
    }
  }

  if (changedSetting.indexOf('color') > -1) {
    // Check if current color !== settings.color
    Array.from(document.querySelector('#yt_timestamp_container').children, currElem => currElem.setAttribute('style', 'background-color: ' + settings.color + ' !important'));
  }
}

function consoleLogger(logLevel, ...args) {
  if (allowDebug)
    console[logLevel](...args);
}

chrome.storage.sync.get(['plugin_settings'], function(result) {
  if (Object.keys(result).length) {
    settings = result.plugin_settings;
  }
});

chrome.storage.onChanged.addListener(function(changes) {
  settings = changes.plugin_settings.newValue;
  runSettings(changes);
});

try {
  module.exports = {
    timestampToSeconds, determineTimeSlot, findCurrentTimestamps,
  };
} catch (ReferenceError) {
  console.log('temp');
}
