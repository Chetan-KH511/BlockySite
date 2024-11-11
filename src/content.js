
const DEBUG = 1;
if (!DEBUG) console.log = () => { };


// The script is executed when a user scrolls through a website on the tab that is active in the browser.
let isScrolling;
let images = [...document.getElementsByTagName('img')];

const replacementImages = [
  'replacements/safe-image.jpg',
  'replacements/safe-image2.jpg',
  'replacements/safe-image3.jpg'
];

const GORE_KEYWORDS = [
  'gore', 'violent', 'blood', 'brutal', 'grotesque', 'splatter', 
  'guts', 'massacre', 'slaughter', 'carnage', 'dismember',
  'mutilation', 'torture', 'cannibal', 'decapitation', 'entrails',
  'viscera', 'disembowel', 'eviscerate', 'wound', 'injury',
  'bloody', 'horror', 'death', 'corpse', 'cadaver', 'morgue'
];

function checkForGoreContext() {
  // Check URL
  const urlHasGore = GORE_KEYWORDS.some(keyword => 
    window.location.href.toLowerCase().includes(keyword)
  );

  // Check page text near images
  const hasGoreContext = GORE_KEYWORDS.some(keyword => {
    const elements = document.querySelectorAll('a, p, h1, h2, h3, h4, h5, span');
    return Array.from(elements).some(el => 
      el.textContent.toLowerCase().includes(keyword)
    );
  });

  return urlHasGore || hasGoreContext;
}

function clasifyImages() {
  /*
  Classifies images and calls all the helper functions.
  */
  [...images, ...document.getElementsByTagName('img')].unique().filter(validImage).forEach(analyzeImage);
}

function validImage(image) {
  /*
  Checks if the image is of a certain height and width and check if the image has already been replaced,
  preventing infinite loops.
  */
  const valid = image.src &&
    image.width > 64 && image.height > 64 &&
    !image.dataset.isReplaced;
  console.log('image %s valid', image.src, valid);
  return valid;
}

function analyzeImage(image) {
  console.log('analyze image %s', image.src);
  
  // Check for gore context first
  if (checkForGoreContext()) {
    // If gore context found, still analyze the image before blocking
    chrome.runtime.sendMessage({ 
      url: image.src, 
      hasGoreContext: true  // Pass this flag to background.js
    }, response => {
      if (response && response.result === true) {
        const randomIndex = Math.floor(Math.random() * replacementImages.length);
        const replacementImage = chrome.runtime.getURL(replacementImages[randomIndex]);
        image.src = replacementImage;
        image.srcset = "";
        image.dataset.filtered = true;
        image.dataset.isReplaced = true;
      }
    });
    return;
  }

  // Normal flow for non-gore-context images
  chrome.runtime.sendMessage({ url: image.src }, response => {
    console.log('prediction for image %s', image.src, response);
    console.log(image);
    if (response && response.result === true) {
      const randomIndex = Math.floor(Math.random() * replacementImages.length);
      const replacementImage = chrome.runtime.getURL(replacementImages[randomIndex]);
      image.src = replacementImage;
      image.srcset = "";
      image.dataset.filtered = true;
      image.dataset.isReplaced = true;
    }
  });
}

document.addEventListener("scroll", (images) => {
  /*
  Call function when scrolling and timeout after scrolling stops.
  */
  clearTimeout(isScrolling);
  isScrolling = setTimeout(() => { clasifyImages() }, 100);
});

document.addEventListener("DOMContentLoaded", () => {
  clasifyImages();
});

Array.prototype.unique = function () {
  return this.filter(function (value, index, self) {
    return self.indexOf(value) === index;
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "classify") {
    clasifyImages();
  }
});
