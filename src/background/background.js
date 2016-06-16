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

const ports = {}

chrome.runtime.onConnect.addListener(port => {
  let name = null
  let tab = null

  if (port.name.startsWith('devtools-')) {
    name = 'devtools'
    tab = +port.name.replace('devtools-', '')

    console.log(`telling ${tab} to load content script ` + new Date().toISOString())
    chrome.tabs.executeScript(tab, {file: '/src/content/content.js'}, () => {})
  } else if (port.name === 'content') {
    name = 'content'
    tab = port.sender.tab.id
    console.log(`got connection: ${tab}`)
  } else {
    return console.error(`Got connection with unknown name: ${port.name}`)
  }

  if (!ports[tab]) {
    ports[tab] = {
      content: 0,
      devtools: 0,
    }
  }
  ports[tab][name] = port

  if (ports[tab].content && ports[tab].devtools) {
    doublePipe(ports[tab].content, ports[tab].devtools)
    ports[tab].devtools.postMessage({type: 'show'})
  }
})

function doublePipe(content, devtools) {
  function devtoolsToContent(message) {
    console.log('devtools -> content', message)
    content.postMessage(message)
  }
  function contentToDevtools(message) {
    console.log('content -> devtools', message)
    devtools.postMessage(message)
  }
  devtools.onMessage.addListener(devtoolsToContent)
  content.onMessage.addListener(contentToDevtools)
  function shutdown() {
    devtools.onMessage.removeListener(devtoolsToContent)
    content.onMessage.removeListener(contentToDevtools)
    devtools.disconnect()
    content.disconnect()
  }
  devtools.onDisconnect.addListener(shutdown)
  content.onDisconnect.addListener(shutdown)
}
