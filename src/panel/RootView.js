
import React from 'react'
import TreeView from './TreeView'

let styles = {
  rootStyle: {
    background: '#f00',
    width: '100%',
    height: '100%',
    oveflow: 'scroll'
  }
}

class RootView extends React.Component {
  constructor() {
    super()
    this.state = {
      content: null,
    }
  }
  componentDidMount() {
    var port = chrome.runtime.connect({
      name: `panel-${chrome.devtools.inspectedWindow.tabId}`,
    })
    port.onMessage.addListener((event) => {
      this.setState({
        content: event.content || event,
      })
    })
  }
  componentWillUnmount() {
  }
  render() {
    let data = 'no data yet...'
    if (this.state.content) {
      data = <TreeView data={JSON.parse(this.state.content)} depth={0} />
    }
    return (
      <div style={styles.rootStyle}>
          <span>Hello react world!</span>
          {data}
      </div>
    )
  }
}

export default RootView
