/*
 * Copyright (C) 2016 Ericsson AB. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict'

var port = chrome.runtime.connect({
  name: `devtools-${chrome.devtools.inspectedWindow.tabId}`,
})

function log(content) {
  console.log(content)
  port.postMessage({type: 'devtoolsLog', content})
}

port.onMessage.addListener(message => {
  log('devtools got message: ' + JSON.stringify(message))

  let handler = logHandlers[message.type]
  if (handler) {
    handler(message.content)
  } else {
    log('got message with no handler:', message)
  }
})

function executeScript(scriptName) {
  let script = `
    if (window.__CCT_INSTANCES__) {
      let script = document.createElement('script')
      script.src = "${chrome.extension.getURL(scriptName)}"
      script.setAttribute('c3DevtoolsExtensionId', '${chrome.runtime.id}')
      console.log('injecting script', script)
      document.head.appendChild(script)
      script.parentNode.removeChild(script)
    }
  `

  return new Promise((resolve, reject) => {
    chrome.devtools.inspectedWindow.eval(script, (res, err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

var logHandlers = {
  show(info) {
    chrome.devtools.panels.create("C3 Web",
      "icons/icon128.png",
      "panel.html",
      panel => {
        log('showing panel')
        panel.onShown.addListener(function(window) {
          log('show panel')
        })
        panel.onHidden.addListener(function() {
          log('hide panel')
        })
      }
    )
  },
  init() {
    // delay until content is connected
    executeScript('build/inject.js').then(() => {
      log('injected script!')
    }).catch(error => {
      console.error(error)
      log(`failed to inject script :( ${error}`)
    })
  }
}
