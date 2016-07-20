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


console.info('Injecting C3 SDK web tools script')

var scriptTag = document.createElement('script')
scriptTag.src = chrome.extension.getURL('build/inject.js')
document.head.appendChild(scriptTag)
document.head.removeChild(scriptTag)
scriptTag = null

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
  console.log(`C3 devtools: got '${type}' message, forwarding to page`);
  window.postMessage({source: 'c3-devtools-bridge', type, content}, '*')
})

function messageListener(event) {
  if (event.source !== window) {
    return
  }

  let message = event.data
  if (typeof(message) !== 'object') {
    return
  }

  if (message.source === 'c3-devtools-page') {
    if (port) {
      let {type, content} = message
      console.log(`C3 devtools: got '${type}' message, forwarding to background`);
      port.postMessage({type, content})
    }
  }
}

window.addEventListener('message', messageListener)
