

# BlockySite

<img src="./dist/images/icon.png" align="right"
     alt="Download now" width="178" height="178">

A simple NSFW filter extension for chrome, built as a part of Mini project, Hope you like it...!!

It uses NSFW JS to check NSFW images when they are loaded. 

If the loaded images contain NSFW content as predicted by the algorithm, they are replaced by a replacement image provided.

Model used- [**nsfwjs**](https://github.com/infinitered/nsfwjs) devoleped by [**Infinite Red, Inc.**](https://github.com/infinitered)

Original better version that contains multiple models and many more features.....
[**Download Officical NSFW Filter**](https://github.com/nsfw-filter/nsfw-filter)

Supported browsers: [**Google Chrome**](#adding-to-chrome), [**Mozilla Firefox**](#adding-to-firefox).

Comments on the code is entirely done by Claude and Chatgpt for better understanding


# Installation 

Clone this repository and navigate inside the project folder and install the dependencies by running:

```
npm i

```

After installing the dependencies, build the project by executing:

```
npm run-script build
```


After you have finished the above,  open Google Chrome and open the Extension Management page by navigating to ```chrome://extensions``` or by opening Settings and clicking Extensions from the bottom left.

Enable Developer Mode by clicking the toggle switch next to Developer mode.

Click the LOAD UNPACKED button and select the extension directory(```.../dist```).

