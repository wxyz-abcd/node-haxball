This is a browser extension project aimed at changing all origin headers for Haxball(https://www.haxball.com). 
This extension was tested in Google Chrome, Microsoft Edge and Brave Browser. Mozilla Firefox port is on its way.

- Instructions:

1. Open your browser in development mode.
2. Open extensions page in your browser.
3. Click on "Load Unpackaged".
4. Select the src folder of this project.

- How To Use:

The extension should not require any input from the user. As long as this extension is active, all requests from your browser that has "haxball.com" inside its url should change their origin to "www.haxball.com" regardless of which website the request originates from. This should possibly solve most kinds of cross-origin problems, which in turn enables us to use our bot api in a browser directly without the need for a proxy server.

NOTE: This project is currently experimental and not working for all domains yet. For now, you may have to change the "domains" variable manually inside the file "background.js" if you want to run it inside your own website.
