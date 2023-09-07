chrome.declarativeNetRequest.updateDynamicRules(
  {
	removeRuleIds: [1], 
    addRules: [
      {
        id: 1,
        priority: 1,
        action: {
          type: "modifyHeaders",
          requestHeaders: [{ 
            "header": "Origin", 
            "operation": "set", 
            "value": "https://www.haxball.com" 
          }, {
            "header": "Referer", 
            "operation": "set", 
            "value": "https://www.haxball.com/" 
          }],
          responseHeaders: [{
            "header": "Access-Control-Allow-Origin", 
            "operation": "set", 
            "value": "*" 
          }]
        },
        condition: {
          urlFilter: '*://*.haxball.com/*',
          domains: ["haxball.com", "glitch.me", "localhost", "infinityfreeapp.com"]
        }
      }
    ]
  }
);
