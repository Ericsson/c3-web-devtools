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

const POLL_INTERVAL = 1000

const port = chrome.runtime.connect({
  name: `devtools-${chrome.devtools.inspectedWindow.tabId}`,
})

function log(content) {
  console.log(content)
  port.postMessage({type: 'devtoolsLog', content})
}

port.onMessage.addListener(message => {
  log('devtools got message: ' + JSON.stringify(message))

  let handler = messageHandlers[message.type]
  if (handler) {
    handler(message.content)
  } else {
    log('got message with no handler:', message)
  }
})

const messageHandlers = {
  show(info) {
    chrome.devtools.panels.create("C3 Web",
      "icons/icon128.png",
      "panel.html",
      panel => {
        log('showing panel')
        panel.onShown.addListener(function(window) {
          log('show panel')
          requestData()
        })
        panel.onHidden.addListener(function() {
          log('hide panel')
        })
      }
    )
  },
  init() {
    log('Starting C3 SDK poll')
    startSdkPoll()
    // TODO: cleanup panel
  }
}

var sdkPollIntervalId

function startSdkPoll() {
  if (sdkPollIntervalId) {
    clearInterval(sdkPollIntervalId)
  }
  sdkPollIntervalId = setInterval(() => {
    chrome.devtools.inspectedWindow.eval('!!window.__C3_SDK_INSTANCES__', (present, err) => {
      if (err) {
        console.warn('Failed to poll C3 SDK presence: ' + err)
      } else {
        console.log('C3 SDK present: ' + present) // TODO: nope
        if (present) {
          clearInterval(sdkPollIntervalId)
          onC3Found()
        }
      }
    })
  }, POLL_INTERVAL)
}

function onC3Found() {
}
