
import React from 'react'
import CircularJSON from 'circular-json'
import TreeView from './TreeView'
import Graph from './Graph'

let styles = {
  rootStyle: {
    background: '#fff',
    width: '100%',
    height: '100%',
    oveflow: 'scroll'
  },
  treeStyle: {
    paddingLeft: '2px',
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
    port.onMessage.addListener(event => {
      var str = CircularJSON.parse(event.content);
      chrome.devtools.inspectedWindow.eval('console.log(' + str + ');');
      console.log('Got dem data', event);
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
      // data = <TreeView data={CircularJSON.parse(this.state.content)} depth={1} active={true} label={'root'} />
      data = <Graph  />
    }
    return (
      <div style={styles.rootStyle}>
          <div style={styles.treeStyle}>{data}</div>
      </div>
    )
  }
}

export default RootView
