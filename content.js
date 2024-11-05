const DEBUG = 1;
if (!DEBUG) console.log = () => { };

let isScrolling;
let images = [...document.getElementsByTagName('img')];

function classifyImages() {
  [...images, ...document.getElementsByTagName('img')]
    .unique()
    .filter(validImage)
    .forEach(analyzeImage);
}

function validImage(image) {
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
    if (response && response.result === true) {
      const replacedImageSrc = `https://source.unsplash.com/random/${image.width}x${image.height}`;
      image.src = replacedImageSrc;
      image.srcset = "";
      image.dataset.filtered = true;
      image.dataset.isReplaced = true;
    }
  });
}

document.addEventListener("scroll", () => {
  clearTimeout(isScrolling);
  isScrolling = setTimeout(() => { classifyImages(); }, 100);
});

Array.prototype.unique = function () {
  return this.filter((value, index, self) => self.indexOf(value) === index);
};

// Run classification on initial load
classifyImages();
