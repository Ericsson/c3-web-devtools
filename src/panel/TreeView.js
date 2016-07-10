
import React from 'react'

let styles = {
  rootStyle: {
    paddingLeft: '2px',
    cursor: 'pointer'
  },
  toggler: {
    fontWeight: 'bold',
  }
}

class TreeView extends React.Component {
  constructor() {
    super()
    this.state = {
      active: false
    }

    this.clickHandler = this.clickHandler.bind(this)
  }
  clickHandler(event) {
    event.preventDefault()
    event.stopPropagation()
    this.setState({active : !this.state.active})
  }
  render() {
    let depth = this.props.depth + 1
    let data = ''
    let props = this.props
    styles.rootStyle.paddingLeft = (depth * 2) + 'px'
    if (this.props.data && props.active || this.state.active) {
      let obj = this.props.data
      if (typeof obj === 'object') {
        data = Object.keys(obj).map((key) =>
          <TreeView data={obj[key]} depth={depth} label={key}/>
        )
      } else if (typeof obj === 'array') {
          styles.rootStyle.paddingLeft = ((depth + 1) * 2) + 'px'
        data = obj.map((key) =>
          <div style={styles.rootStyle}>{obj[key]}</div>
        )
      } else {
        styles.rootStyle.paddingLeft = ((depth + 1) * 2) + 'px'
        data = <div style={styles.rootStyle}>{this.props.data}</div>
      }
    }

    return (
      <div style={styles.rootStyle} >
        <span style={styles.toggler} onClick={this.clickHandler}>{this.state.active ? 'less ' : 'more '}</span>
        {props.label}
        {data}
      </div>
    )
  }
}

export default TreeView
