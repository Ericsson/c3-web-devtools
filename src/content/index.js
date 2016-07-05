/*
 * Copyright (C) 2016 Ericsson AB. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
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
  name: 'content',
})

port.onDisconnect.addListener(() => {
  console.log('content disconnected!')
  port = null
  window.postMessage({type: 'nuke'}, '*')
  window.removeEventListener('message', messageListener)
})

port.onMessage.addListener(({type, content}) => {
  console.log('content got message! :D', type, content);
  sendMessage(type, content)
})

function sendMessage(type, content) {
  window.postMessage({source: 'c3-devtools-bridge', type, content}, '*')
}

function messageListener(event) {
  if (event.source !== window) {
    return
  }

  let message = event.data
  if (typeof(message) !== 'object') {
    return
  }

  if (message.source === 'c3-devtools-page') {
    console.log('got window message: ', event.data)
    if (port) {
      port.postMessage(message)
    }
  }
}

window.addEventListener('message', messageListener)
port.postMessage({type: 'init'})
