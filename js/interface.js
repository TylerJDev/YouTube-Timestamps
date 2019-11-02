let settings = {'toggle_heading': 'true', 'disable_background': 'false', 'below_title': 'true', 'above_title': 'false', 'color': '#575757'};
const allowDebug = true;
const checkboxes = {
  "toggle_heading": function(ele) {
    return ['toggle_heading', ele.checked];
  },

  "disable_background": function(ele) {
    return ['disable_background', ele.checked];
  },

  "ui_placement": function(ele) {
    switch(ele.attributes['id'].value) {
      case 'below_title':
        settings.above_title = false;
        document.querySelector('#above_title').checked = false;
        return ['below_title', ele.checked];
        break;
      case 'above_title':
        settings.below_title = false;
        document.querySelector('#below_title').checked = false;
        return ['above_title', ele.checked];
        break;
      default:
        break;
    }
  }
}

Array.from(document.querySelectorAll('#container #tier_setings input'), currEle => currEle.addEventListener('click', checkboxState));

document.querySelector('#color_picker').addEventListener('keydown', function(e) {
  if (e.keyCode === 13 || e.keyCode === 32) {
    const colorValue = this.value.match(/[a-zA-Z0-9#]/g).join('');
    consoleLogger('log', ['Color Value:', colorValue]);

    const item = ListBoxComboBox.combobox.attributes['aria-activedescendant'].value.length ? document.querySelector(`#${ListBoxComboBox.combobox.attributes['aria-activedescendant'].value}`) : '';

    settings.color = colorValue;
    if (item !== null && item !== '') {
      settings.color = item.textContent.split(' ').join('');
    }

    chrome.storage.sync.set({'plugin_settings': settings}, function() {
      consoleLogger('log', ['Settings set:', settings]);
    });
  }
});

document.querySelector('#color_picker_list').addEventListener('click', function(e) {
  const elem = e.target;

  if (e.target.attributes['role'] !== undefined && e.target.attributes['role'].value === 'option') {
    const selected = elem;
    settings.color = elem.textContent.split(' ').join('');

    chrome.storage.sync.set({'plugin_settings': settings}, function() {
      consoleLogger('log', ['Settings set:', settings]);
    });
  }
});


document.querySelector('#submitbtn').addEventListener('click', function(e) {
  if (ListBoxComboBox.combobox.value.length) {
    const colorValue = ListBoxComboBox.combobox.value.match(/[a-zA-Z0-9#]/g).join('');
    settings.color = colorValue

    chrome.storage.sync.set({'plugin_settings': settings}, function() {
      consoleLogger('log', ['Settings set:', settings]);
    });
  }
});

document.querySelector('#reset_settings').addEventListener('click', function() {
  settings = {'toggle_heading': true, 'disable_background': true, 'below_title': true, 'above_title': false, 'color': '#575757'};
  ListBoxComboBox.combobox.value = '';

  for (let defState in Object.keys(settings)) {
    if (Object.keys(settings)[defState] !== 'color')
      document.querySelector('#' + Object.keys(settings)[defState]).checked = Object.values(settings)[defState];
  }

  setToStorage();
});

function checkboxState() {
  var findKey = Object.keys(checkboxes).indexOf(this.attributes['id'].value);
  findKey = findKey === -1 ? "ui_placement" : this.attributes['id'].value;

  setToStorage(...checkboxes[findKey](this));
}

function setToStorage(key=false, value=false) {
  if (key !== false) {
    settings[key] = value;
    consoleLogger('log', [key]);
  }

  chrome.storage.sync.set({'plugin_settings': settings}, function() {
    consoleLogger('log', ['Settings set:', settings]);
  });
}

function runSettings() {
  chrome.storage.sync.get(['plugin_settings'], function(result) {
    if (!Object.keys(result).length) {
      consoleLogger('log', 'Run default settings');
    } else if (Object.keys(result.plugin_settings).length === Object.keys(settings).length) {
      settings = result.plugin_settings;
    }

    Object.keys(settings).forEach(function(curr, idx, arr) {
      if (curr !== 'color') {
        consoleLogger('log', [curr, settings[curr], arr]);
        document.querySelector('#' + curr).checked = String(settings[curr]) === 'true' ? true : false;
      }
    });

    // Set color input placeholder
    if (settings.color !== '#575757') { // !== Default color
      document.querySelector('#color_picker').value = settings.color;
    }
  });
}

runSettings()

function consoleLogger(logLevel, ...args) {
  if (allowDebug)
    console[logLevel](...args);
}
