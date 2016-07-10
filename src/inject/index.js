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

;(() => {
  function sendMessage(type, content) {
    window.postMessage({source: 'c3-devtools-page', type, content}, '*')
  }

  function serialize(obj) {
    let cache = []
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          return
        }
        cache.push(value)
      }
      return value
    })
    cache = null
  }

  function messageListener(event) {
    if (event.source !== window) {
      return
    }

    if (event.data.type === 'nuke') {
      window.removeEventListener('message', messageListener)
    }

    let message = event.data
    if (typeof(message) === 'object') {
      if (message.source === 'c3-devtools-bridge') {
        let handler = logHandlers[message.type]
        if (handler) {
          handler(message.content)
        } else {
          console.error('got message with no handler:', message)
        }
      }
    }
  }
  window.addEventListener('message', messageListener)

  var logHandlers = {
    devtoolsLog(text) {
      console.log(`%cDEVTOOLS%c: ${text}`, 'color: #80f', 'color:')
    },
    devtoolsRequestData() {
      sendMessage('c3-data', serialize(window.__CCT_INSTANCES__[0]))
    }
  }
  sendMessage('show', serialize(window.__CCT_INSTANCES__[0]))
})()
