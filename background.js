import * as tf from '@tensorflow/tfjs';
import * as nsfwjs from 'nsfwjs';

const MODEL_PATH = chrome.runtime.getURL('models/model.json');
const IMAGE_SIZE = 224;
const FILTER_LIST = ["Hentai", "Porn", "Sexy"];
const FILTER_THRESHOLD = 0.75;

let model = null;

async function loadModel() {
  try {
    tf.enableProdMode();
    model = await nsfwjs.load(MODEL_PATH);
    console.log('Model loaded successfully');
  } catch (err) {
    console.error('Failed to load model:', err);
  }
}

async function loadImage(url) {
  const image = new Image(IMAGE_SIZE, IMAGE_SIZE);
  return new Promise((resolve, reject) => {
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = url;
  });
}

async function executeModel(url) {
  const image = await loadImage(url);
  const prediction = model.classify(image, 1);

  const output = prediction;

  return output;
}

chrome.runtime.onMessage.addListener((request, sender, callback) => {
  executeModel(request.url)
    .then(op => {
      if (FILTER_LIST.includes(op[0].className)) {
        console.log("EUREKA! EUREKA! EUREKA!")
        console.log(op[0].className, op[0].probability)
        return true;
      }
      else {
        return false;
      }
    })
    .then(result => callback({ result: result }))
    .catch(err => callback({ result: false, err: err.message }));

  return true;
});