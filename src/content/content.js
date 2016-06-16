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
})
port.onMessage.addListener(message => {
  console.log('content got message! :D', message)
  handleMessage(message)
})

function handleMessage(message) {
  let handler = logHandlers[message.type]
  if (handler) {
    handler(message.content)
  } else {
    console.error('got message with no handler:', message)
  }
}

var logHandlers = {
  devtoolsLog(text) {
    console.log(`%cDEVTOOLS%c: ${text}`, 'color: #80f', 'color:')
  },
}
