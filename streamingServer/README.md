This is a side project aimed at streaming online games inside Haxball while they are being played using a WebSocket server.

- How to use:

Option 1: After you cloned this repo, open the console and go to the folder where you cloned it, run `npm install` and then run `npm start`.
Option 2: Copy index.js contents into your own backend project(maybe where you start your haxball room as well) and also install the "ws" package using `npm install ws`; and you are almost ready to go.

You also need to run the `startStreaming` function inside `src/roomScript.js` file when you want to start streaming using this example server project.

- How others can watch your stream:

You need to host `../examples_web/src/streamWatcher.html` and `../examples_web/src/streamWatcher.js` files along with all their dependencies on a hosting server.
And you will need to open your TCP port(`1935` by default) and share your room's ip address for the others to be able to watch your room's stream.

NOTE: The `streamWatcher` project was not tested enough, is currently experimental and buggy. I only shared these because there was a lot of interest and I have other things to do, even more important than this one, so, sorry for the inconvenience for now. Those bugs will hopefully be fixed later.