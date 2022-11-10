This is a side project aimed at generating room tokens for Haxball(https://www.haxball.com). 

This project uses NW.js. (https://nwjs.io/)

- Instructions:

1. Go to https://nwjs.io/ and download NORMAL or SDK version of NW.js for your platform.
2. Extract NW.js files into a folder. (folderA)
3. Copy the files inside tokenGenerator/src into a folder. (folderB)
4. Open a command prompt.
5. Run executable "folderA/nw" with folderB's full path as its only command-line parameter. 
(You might create a shortcut or a batch file for this.)

- How To Use:

The project can run on two modes: Host and client. The "toggle mode" button toggles between these modes.
The "reset" button restarts the logic in case something goes wrong. You are supposed to solve a recaptcha
and submit it to get your token.

Client mode also requires a room id as input. For example, LQFqUutgk6E is your room id if your room link 
is https://www.haxball.com/play?c=LQFqUutgk6E.

Host token may be used to host a room using Haxball.createRoom, and client token may be used to join a 
recaptcha-protected room using Haxball.joinRoom in our "node-haxball" npm package. 

- Future plans:

It is possible to integrate an automatic recaptcha solver into this project. After a non-blocking way is
found for this operation, this project will become a server to solve recaptcha and have 2 GET endpoints to
generate host and client tokens. generateHostToken will not require any parameters, and generateClientToken
will require a roomId parameter. Both endpoints will try to solve recaptcha and return the resulting token
back to the requester, or the encountered error. 
