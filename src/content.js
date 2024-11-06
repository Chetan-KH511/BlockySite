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
  chrome.runtime.sendMessage({ url: image.src }, response => {
    console.log('prediction for image %s', image.src, response);
    console.log(image);
    if (response && response.result === true) {
      // Use your custom replacement image
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
