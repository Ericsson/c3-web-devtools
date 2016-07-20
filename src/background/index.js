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
    if (isNaN(tab)) {
      console.log(`got devtools port with invalid name: ${port.name}`)
      return
    }

    console.log(`telling ${tab} to load content script ` + new Date().toISOString())
    chrome.tabs.executeScript(tab, {file: 'build/content.js'}, () => {})
  } else if (port.name === 'content') {
    name = 'content'
    tab = port.sender.tab.id
    console.log(`got connection: ${tab}`)
  } else if (port.name.startsWith('panel-')) {
    name = 'panel'
    tab = +port.name.replace('panel-', '')
    console.log(`connected to panel: ${tab}`)
  } else {
    return console.error(`Got connection with unknown name: ${port.name}`)
  }

  if (!ports[tab]) {
    ports[tab] = {
      content: 0,
      devtools: 0,
      panel: 0,
    }
  }
  ports[tab][name] = port
  if (ports[tab].content && ports[tab].devtools && ports[tab].panel) {
    extendPipe(tab)
  } else
  if (ports[tab].content && ports[tab].devtools) {
    doublePipe(tab)
  }
})

function doublePipe(tab) {
  let {content, devtools} = ports[tab]
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
    delete ports[tab]
  }
  devtools.onDisconnect.addListener(shutdown)
  content.onDisconnect.addListener(shutdown)
}

function extendPipe(tab) {
  let {panel, content, devtools} = ports[tab]
  function devtoolsToPanel(message) {
    console.log('devtools -> panel', message)
    // turning it off because we don't want to propagate certain events
    //panel.postMessage(message)
  }
  function contentToPanel(message) {
    console.log('content -> panel', message)
    panel.postMessage(message)
  }
  function allToPanel(message) {
    console.log('content -> panel', message)
    panel.postMessage(message)
  }

  devtools.onMessage.addListener(devtoolsToPanel)
  content.onMessage.addListener(contentToPanel)
  function shutdown() {
    devtools.onMessage.removeListener(devtoolsToPanel)
    content.onMessage.removeListener(contentToPanel)
    panel.disconnect()
  }
  devtools.onDisconnect.addListener(shutdown)
  content.onDisconnect.addListener(shutdown)
  panel.onDisconnect.addListener(shutdown)
}
