import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'

// Enable production mode in TensorFlow

tf.enableProdMode()

const IMAGE_SIZE = 224; // nsfwjs model used here takes input tensors as 224x224
const FILTER_THRESHOLD = 0.75; // you can set a threshold and use the filter only if the predictions are above the threshold
const FILTER_LIST = ["Hentai", "Porn", "Sexy"]; // the image classes that needs to be filtered
const RED_THRESHOLD = 0.4; // Threshold for red detection (40% of the image)
const MODEL_PATH = '../models/'; // the model is stored as a web accessible resource

nsfwjs.load(MODEL_PATH).then(model => {
  /*
  This function loads the nsfwjs model to memory and prepares it for making predictions.
  Once the model is loaded, it will load the images and make predictions.
  */
  async function loadImage(url) {
    /*
    This function loads the image for passing to the model.
    */
    const image = new Image(IMAGE_SIZE, IMAGE_SIZE);
    return new Promise((resolve, reject) => {
      image.crossOrigin = "anonymous";
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = url;
    });
  }

  function detectGore(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let redPixels = 0;
    let darkRedPixels = 0;
    let fleshTonePixels = 0;
    let totalPixels = imageData.length / 4;

    for (let i = 0; i < imageData.length; i += 4) {
      const red = imageData[i];
      const green = imageData[i + 1];
      const blue = imageData[i + 2];
      
      // Check for bright red (fresh blood)
      if (red > 150 && red > green * 2 && red > blue * 2) {
        redPixels++;
      }
      
      // Check for dark red (dried blood/gore)
      if (red > 80 && red < 150 && 
          red > green * 1.8 && 
          red > blue * 1.8 && 
          green < 80 && blue < 80) {
        darkRedPixels++;
      }

      // Check for flesh tones near red areas
      if (red > 180 && green > 120 && green < 170 && blue > 100 && blue < 140) {
        fleshTonePixels++;
      }
    }

    const redRatio = redPixels / totalPixels;
    const darkRedRatio = darkRedPixels / totalPixels;
    const fleshRatio = fleshTonePixels / totalPixels;
    
    // Detect gore based on combination of colors and patterns
    return (redRatio > 0.1) || // Lower threshold for bright red
           (darkRedRatio > 0.15) || // Lower threshold for dark red
           (redRatio > 0.05 && fleshRatio > 0.2); // Combination of blood and flesh tones
  }

  async function executeModel(url, hasGoreContext = false) {
    const image = await loadImage(url);
    const [prediction] = await model.classify(image, 1);
    
    // First check NSFW content
    if (FILTER_LIST.includes(prediction.className)) {
      return { shouldBlock: true, reason: 'nsfw' };
    }
    
    // For gore context, use more sensitive thresholds in detectGore
    if (hasGoreContext) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let redPixels = 0;
      let darkRedPixels = 0;
      let fleshTonePixels = 0;
      let totalPixels = imageData.length / 4;

      for (let i = 0; i < imageData.length; i += 4) {
        const red = imageData[i];
        const green = imageData[i + 1];
        const blue = imageData[i + 2];
        
        // More sensitive thresholds for gore context
        if (red > 140 && red > green * 1.8 && red > blue * 1.8) {
          redPixels++;
        }
        if (red > 70 && red < 140 && red > green * 1.6 && red > blue * 1.6) {
          darkRedPixels++;
        }
        if (red > 170 && green > 110 && green < 160 && blue > 90 && blue < 130) {
          fleshTonePixels++;
        }
      }

      const redRatio = redPixels / totalPixels;
      const darkRedRatio = darkRedPixels / totalPixels;
      const fleshRatio = fleshTonePixels / totalPixels;
      
      return {
        shouldBlock: (redRatio > 0.05) || // More sensitive threshold
                    (darkRedRatio > 0.08) ||
                    (redRatio > 0.03 && fleshRatio > 0.1)
      };
    }
    
    // Normal gore detection for non-gore-context
    if (detectGore(image)) {
      return { shouldBlock: true, reason: 'gore' };
    }
    
    return { shouldBlock: false };
  }

  chrome.runtime.onMessage.addListener((request, sender, callback) => {
    executeModel(request.url, request.hasGoreContext)
      .then(result => callback({ result: result.shouldBlock }))
      .catch(err => callback({ result: false, err: err.message }));
    return true;
  });

  
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      chrome.tabs.sendMessage(tabId, { action: "classify" });
    }
  });
});