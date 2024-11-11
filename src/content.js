import * as tf from '@tensorflow/tfjs'
import * as nsfwjs from 'nsfwjs'

// Enable production mode in TensorFlow

tf.enableProdMode()

nsfwjs.load(MODEL_PATH).then(model => {
  
  async function loadImage(url) {
    
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
      

      if (red > 150 && red > green * 2 && red > blue * 2) {
        redPixels++;
      }
      
     if (red > 80 && red < 150 && 
          red > green * 1.8 && 
          red > blue * 1.8 && 
          green < 80 && blue < 80) {
        darkRedPixels++;
      }

     if (red > 180 && green > 120 && green < 170 && blue > 100 && blue < 140) {
        fleshTonePixels++;
      }
    }

    const redRatio = redPixels / totalPixels;
    const darkRedRatio = darkRedPixels / totalPixels;
    const fleshRatio = fleshTonePixels / totalPixels;
    
    r

  async function executeModel(url, hasGoreContext = false) {
    const image = await loadImage(url);
    const [prediction] = await model.classify(image, 1);
    
    // First check NSFW content
    if (FILTER_LIST.includes(prediction.className)) {
      return { shouldBlock: true, reason: 'nsfw' };
    }
    
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