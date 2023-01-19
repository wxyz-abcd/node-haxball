This is a half light-weight front-end Haxball(https://www.haxball.com) made using our node-haxball library.
For this project, you do not need a backend but you have to use our haxballOriginModifier browser extension.
If you don't want this, you need to modify the source codes to use our proxy server. (and it is not always available.)

- How to start:

    1. Clone this repo in your hard disk.
    2. Follow the instructions in `haxballOriginModifier/README.md` to use our browser extension.
    3. Serve the files at `examples_web/src` folder of this repo from a standard web server. If you don't know how to do this, you can try this:
        - Download node.js and npm from here: https://nodejs.org/en/download and install them if you don't have them.
        - Open a command prompt/terminal.
        - Execute this command to install a standard web server: `npm install --global serve`.
        - Go to examples_web folder of this repo : `cd MAIN_FOLDER/node-haxball/examples_web`. `MAIN_FOLDER` is where the `node-haxball` repo is located in your hard disk.
        - Run the web server with this command: `serve src`.

    4. Open your web browser and navigate to the address given by your web server. (If you followed the instructions, it should be something like `http://localhost:5000`.)

- How To Use:

  You can select one of the html files to open it directly, or you can directly use the file by writing it in the address bar. For example, you will write 
  `http://localhost:5000/roomList` to go to `roomList.html` page.

  There are 3 main files that you can directly start with:

    - `roomList.html`: This is the main interface, as it also is in the original Haxball webpage. It shows the list of rooms to join. You can create a new room, 
    join current rooms, or refresh the room list. All other pages are accessible from here. There are filters at the bottom of the page, you can experiment with 
    them to learn what they are. This page is almost completed. There is currently no parameter available for this page.

    - `joinRoom.html`: This is a page to adjust your settings before trying to join a room. It has its own instructions, you should follow them. There are some 
    more parameters for joining a room in our API, but this is enough for now. There is only the `id` parameter that you can add at the end of the link that 
    represents the room's id that you are trying to join. You can add it like this: `http://localhost:5000/joinRoom?id=nlhhGR9EoGA`.

    - `createRoom.html`: This is a page to adjust your settings before trying to create a room. It has its own instructions, you should follow them. There are some 
    more parameters for creating a room in our API, but this is enough for now. There is currently no parameter available for this page.

  There is also another main html file called `game.html`, but it's not for direct usage. It is opened automatically when you create or join a room with canvas 
  capabilities. Currently, `game.html` is only showing the game using a renderer. Input event handling, sounds, chat, etc are currently missing and will be 
  added soon.
