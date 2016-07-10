
import React from 'react'

let styles = {
  rootStyle: {
    paddingLeft: '2px'
  }
}

class TreeView extends React.Component {
  constructor() {
    super()
  }
  render() {
    let depth = this.props.depth + 1
    let data = 'no data yet... in a tree node!'
    if (this.props.data) {
      let obj = this.props.data
      if (typeof obj === 'object') {
        data = Object.keys(obj).map((key) =>
          <TreeView data={obj[key]} depth={depth}/>
        )
      } else if (typeof obj === 'array') {
        data = obj.map((key) =>
          <div>{obj[key]}</div>
        )
      } else {
        data = <div>{this.props.data}</div>
      }
    }

    styles.rootStyle.paddingLeft = (depth * 2) + 'px'

    return (
      <div style={styles.rootStyle}>
        {data}
      </div>
    )
  }
}

export default TreeView
