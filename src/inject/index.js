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

import CircularJSON from 'circular-json'

const DATA_POLL_INTERVAL = 5 * 1000
var dataPollIntervalId = 0

function sendMessage(type, content) {
  window.postMessage({source: 'c3-devtools-page', type, content}, '*')
}

function messageListener(event) {
  if (event.source !== window) {
    return
  }

  let message = event.data
  if (typeof(message) === 'object') {
    if (message.source === 'c3-devtools-bridge') {
      let handler = messageHandlers[message.type]
      if (handler) {
        handler(message.content)
      } else {
        console.error('got message with no handler:', message)
      }
    }
  }
}

window.addEventListener('message', messageListener)
dataPollIntervalId = setInterval(() => {
  sendMessage('c3-data', CircularJSON.stringify(window.__C3_SDK_INSTANCES__.deviceSource))
}, DATA_POLL_INTERVAL)

const messageHandlers = {
  nuke() {
    clearInterval(dataPollIntervalId)
    dataPollIntervalId = 0
    window.removeEventListener('message', messageListener)
  },
  devtoolsLog(text) {
    console.log(`%cDEVTOOLS%c: ${text}`, 'color: #80f', 'color:')
  },
}
