const ListBoxComboBox = {
  listbox: document.querySelector('#color_picker_list'),
  combobox: document.querySelector('#combobox input'),
  count: -1,
};

/**
 * On user input within combobox, run anonymous function
 * Use event to handle current state of combobox
 */

ListBoxComboBox.combobox.addEventListener('input', function(e) {
  let value = e.target.value;
  let options = addItems(value);

  if (!value.length || options.length === 0) {
    handleState(true);
  } else if (ListBoxComboBox.listbox.classList.contains('hidden')) {
    handleState(false);
  }
});

/**
  * On user input within combobox, watch for keyCode
  * Use event to determine key pressed
  */

ListBoxComboBox.combobox.addEventListener('keydown', function(e) {
  const options = ListBoxComboBox.listbox.children;

  // If keyCode equals "UP" arrow key
  if (e.keyCode === 38) {

    ListBoxComboBox.count--;
    if (ListBoxComboBox.count <= -1) {
      ListBoxComboBox.count = options.length - 1;
    }
    addFocus(ListBoxComboBox.count, options);

  // If keyCode equals "DOWN" arrow key
  } else if (e.keyCode === 40) {

    ListBoxComboBox.count++;
    if (ListBoxComboBox.count >= options.length) {
      ListBoxComboBox.count = 0;
    }
    addFocus(ListBoxComboBox.count, options);
  }

  // If keyCode equals "ENTER" or "SPACE" key
  if (e.keyCode === 13 || e.keyCode === 32) {
    const item = ListBoxComboBox.combobox.attributes['aria-activedescendant'].value.length ? document.querySelector(`#${ListBoxComboBox.combobox.attributes['aria-activedescendant'].value}`) : '';

    if (item !== null && item !== '') {
      const selected = document.querySelector(`#${ListBoxComboBox.combobox.attributes['aria-activedescendant'].value}`);
      selected.setAttribute('aria-selected', 'true');

      ListBoxComboBox.combobox.value = selected.textContent;
      handleState(true);
    }

    ListBoxComboBox.count = -1;
  }

  if (e.keyCode === 27) {
    /**
      * 1. Clear combobox
      * 2. Close listbox
      * 3. Hide listbox
      */
    handleState(true);
  }
});

ListBoxComboBox.listbox.addEventListener('click', function(e) {
  const elem = e.target;

  if (e.target.attributes['role'] !== undefined && e.target.attributes['role'].value === 'option') {
    const selected = elem;
    selected.setAttribute('aria-selected', 'true');

    ListBoxComboBox.combobox.value = selected.textContent;
    handleState(true);
  }
});

// On focus out
ListBoxComboBox.combobox.addEventListener('blur', function(e) {
  setTimeout(() => {handleState(true)}, 250);
});

/**
  * Add options based on value passed
  *
  * @param {string} value - Current value of the combobox
  */

function addItems(value) {
  let curr_options = [];
  value = value.replace(/[ *]/g, '').toLowerCase();

  // Remove all children from listbox
  ListBoxComboBox.listbox.innerHTML = '';
  let currentOptions = supportedColors.filter(currentVal => currentVal.toLowerCase().replace(/[ *]/g, '').indexOf(value) === 0);

  // Append list options to listbox element
  for (let options in currentOptions) {
    curr_options.push(currentOptions[options]);
    ListBoxComboBox.listbox.insertAdjacentHTML('beforeend', `<li id="color_picker_item_${options}" role="option" aria-selected="false"><span class="color_box" style="background-color: ${currentOptions[options].split(' ').join('')}"></span>${currentOptions[options]}</li>`);
  }

  return curr_options;
}

/**
  * Set focus via aria-activedescendant attribute
  *
  * @param {integer} count - Which item should currently be "focused"
  * @param {HTMLElement} opt - Children (elements) of listbox
  */

function addFocus(count, opt) {
  const item = document.querySelector(`#color_picker_item_${count}`);
  if (item !== null) {

    // Reset all options to initial state
    Array.from(opt).forEach((currOpt) => {
      currOpt.classList.remove('focused');
      currOpt.setAttribute('aria-selected', 'false');
    });

    item.classList.add('focused');
    item.setAttribute('aria-selected', 'true');
    ListBoxComboBox.combobox.setAttribute('aria-activedescendant', item.attributes['id'].value);
  }
}

/**
 * Handle state of combobox
 *
 * @param {boolean} clearState - Reducing combobox back to the initial state
 */

function handleState(clearState) {
  if (clearState) {
    ListBoxComboBox.listbox.classList.add('hidden');
    ListBoxComboBox.combobox.setAttribute('aria-activedescendant', '');
    ListBoxComboBox.combobox.setAttribute('aria-expanded', 'false');

    ListBoxComboBox.listbox.innerHTML = '';
    ListBoxComboBox.count = -1;
  } else {
    ListBoxComboBox.listbox.classList.remove('hidden');
    ListBoxComboBox.combobox.setAttribute('aria-expanded', 'true');
  }
}

const supportedColors = [
  "Alice Blue",
  "Antique White",
  "Aqua",
  "Aquamarine",
  "Azure",
  "Beige",
  "Bisque",
  "Black",
  "Blanched Almond",
  "Blue",
  "Blue Violet",
  "Brown",
  "Burly Wood",
  "Cadet Blue",
  "Chartreuse",
  "Chocolate",
  "Coral",
  "Cornflower Blue",
  "Cornsilk",
  "Crimson",
  "Cyan",
  "Dark Blue",
  "Dark Cyan",
  "Dark Golden Rod",
  "Dark Gray",
  "Dark Grey",
  "Dark Green",
  "Dark Khaki",
  "Dark Magenta",
  "Dark Olive Green",
  "Dark Orange",
  "Dark Orchid",
  "Dark Red",
  "Dark Salmon",
  "Dark Sea Green",
  "Dark Slate Blue",
  "Dark Slate Gray",
  "Dark Slate Grey",
  "Dark Turquoise",
  "Dark Violet",
  "Deep Pink",
  "Deep Sky Blue",
  "Dim Gray",
  "Dim Grey",
  "Dodger Blue",
  "Fire Brick",
  "Floral White",
  "Forest Green",
  "Fuchsia",
  "Gainsboro",
  "Ghost White",
  "Gold",
  "Golden Rod",
  "Gray",
  "Grey",
  "Green",
  "Green Yellow",
  "Honey Dew",
  "Hot Pink",
  "Indian Red",
  "Indigo",
  "Ivory",
  "Khaki",
  "Lavender",
  "Lavender Blush",
  "Lawn Green",
  "Lemon Chiffon",
  "Light Blue",
  "Light Coral",
  "Light Cyan",
  "Light Golden Rod Yellow",
  "Light Gray",
  "Light Grey",
  "Light Green",
  "Light Pink",
  "Light Salmon",
  "Light Sea Green",
  "Light Sky Blue",
  "Light Slate Gray",
  "Light Slate Grey",
  "Light Steel Blue",
  "Light Yellow",
  "Lime",
  "Lime Green",
  "Linen",
  "Magenta",
  "Maroon",
  "Medium Aqua Marine",
  "Medium Blue",
  "Medium Orchid",
  "Medium Purple",
  "Medium Sea Green",
  "Medium Slate Blue",
  "Medium Spring Green",
  "Medium Turquoise",
  "Medium Violet Red",
  "Midnight Blue",
  "Mint Cream",
  "Misty Rose",
  "Moccasin",
  "Navajo White",
  "Navy",
  "Old Lace",
  "Olive",
  "Olive Drab",
  "Orange",
  "Orange Red",
  "Orchid",
  "Pale Golden Rod",
  "Pale Green",
  "Pale Turquoise",
  "Pale Violet Red",
  "Papaya Whip",
  "Peach Puff",
  "Peru",
  "Pink",
  "Plum",
  "Powder Blue",
  "Purple",
  "Rebecca Purple",
  "Red",
  "Rosy Brown",
  "Royal Blue",
  "Saddle Brown",
  "Salmon",
  "Sandy Brown",
  "Sea Green",
  "Sea Shell",
  "Sienna",
  "Silver",
  "Sky Blue",
  "Slate Blue",
  "Slate Gray",
  "Slate Grey",
  "Snow",
  "Spring Green",
  "Steel Blue",
  "Tan",
  "Teal",
  "Thistle",
  "Tomato",
  "Turquoise",
  "Violet",
  "Wheat",
  "White",
  "White Smoke",
  "Yellow",
  "Yellow Green",
]
