

# NSFW Filter

<img src="./dist/images/icon.png" align="right"
     alt="Download now" width="120" height="178">

A simple NSFW filter extension for chrome, built as a part of Mini project, Hope you like it...!!

It uses NSFW JS to check NSFW images when they are loaded. 

If the loaded images contain NSFW content as predicted by the algorithm, it is replaced by a replacement image provided.

Model used- [**nsfwjs**](https://github.com/infinitered/nsfwjs) devoleped by [**Infinite Red, Inc.**](https://github.com/infinitered)

Original better version that contains multiple models and many more features.....
[**Download NSFW Filter**](https://github.com/navendu-pottekkat/nsfw-filter/archive/master.zip)

Supported browsers: [**Google Chrome**](#adding-to-chrome), [**Mozilla Firefox**](#adding-to-firefox).


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

