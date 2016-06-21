
import React from 'react'

let styles = {
  rootStyle: {
    background: '#f00',
    width: '100%',
    height: '100%',
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
    return (
      <div style={styles.rootStyle}>
        <span>Hello react world!</span>
        {this.state.content}
      </div>
    )
  }
}

export default RootView
