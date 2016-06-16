console.log('ASDASDASD')

chrome.devtools.panels.create("C3 Web",
    "icons/icon128.png",
    "Panel.html",
    function(panel) {
      console.log('ASDASD DERP')
      // code invoked on panel creation
    }
);
