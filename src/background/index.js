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

const portBundles = {}

chrome.runtime.onConnect.addListener(port => {
  let name = null
  let tab = null

  if (port.name.startsWith('devtools-')) {
    tab = +port.name.replace('devtools-', '')
    if (isNaN(tab)) {
      console.log(`[${tab}] got devtools port with invalid name: ${port.name}`)
      return
    }
    setupDevtoolsChannel(tab, port)
  } else if (port.name === 'content') {
    name = 'content'
    tab = port.sender.tab.id
    console.log(`[${tab}] got content script connection`)
  } else if (port.name.startsWith('panel-')) {
    name = 'panel'
    tab = +port.name.replace('panel-', '')
    console.log(`[${tab}] got panel connection`)
  } else {
    return console.error(`[${tab}] got connection with unknown name: ${port.name}`)
  }

  if (!portBundles[tab]) {
    port.disconnect()
  } else {
    portBundles[tab][name] = port
    if (portBundles[tab].content && portBundles[tab].panel) {
      doublePipe(tab)
    }
  }
})

function setupDevtoolsChannel(tab, port) {
  if (portBundles[tab]) {
    console.error(`[${tab}] got duplicate devtools connection`)
  } else {
    console.info(`[${tab}] got devtools connection`)
  }
  portBundles[tab] = {
    devtools: port,
    content: null,
    panel: null,
  }

  port.onMessage.addListener(message => {
    console.log(`[${tab}] background got message from devtools: ${JSON.stringify(message)}`)

    if (message.type === 'sdkFound') {
      console.log(`[${tab}] loading content script`)
      chrome.tabs.executeScript(tab, {
        file: 'build/content.js',
        runAt: 'document_end',
      }, () => {
        console.log(`[${tab}] content script execute result: `, arguments)
      })
    }
  })
  port.onDisconnect.addListener(() => {
    console.log(`[${tab}] devtools were disconnected`)
    let bundle = portBundles[tab]
    if (bundle && bundle.content) {
      bundle.content.disconnect()
    }
    delete portBundles[tab]
  })
  port.postMessage({type: 'start'})
}

chrome.tabs.onUpdated.addListener((tab, changeInfo) => {
  if (changeInfo.status === 'loading') {
    console.log(`[${tab}] loading started`)
    let bundle = portBundles[tab]
    if (bundle && bundle.devtools) {
      bundle.devtools.postMessage({type: 'stop'})
    }
  } else if (changeInfo.status === 'complete') {
    console.log(`[${tab}] loading completed`)
    let bundle = portBundles[tab]
    if (bundle && bundle.devtools) {
      bundle.devtools.postMessage({type: 'start'})
    }
  }
})

function doublePipe(tab) {
  let {content, panel} = portBundles[tab]
  function panelToContent(message) {
    console.log(`[${tab}] panel -> content`, message)
    content.postMessage(message)
  }
  function contentToPanel(message) {
    console.log(`[${tab}] content -> panel`, message)
    panel.postMessage(message)
  }
  panel.onMessage.addListener(panelToContent)
  content.onMessage.addListener(contentToPanel)

  content.onDisconnect.addListener(() => {
    console.log(`[${tab}] content script was disconnected`)
    panel.onMessage.removeListener(panelToContent)
    content.onMessage.removeListener(contentToPanel)
    content.disconnect()
    if (portBundles[tab]) {
      portBundles[tab].content = null

      if (portBundles[tab].panel) {
        portBundles[tab].panel.postMessage({type: 'clear'})
      }
    }
  })
}
