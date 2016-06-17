
import React from 'react'

let styles = {
  rootStyle: {
    background: '#f00',
    width: '100%',
    height: '100%',
  }
}

const RootView = () => (
  <div style={styles.rootStyle}>
    <span>Hello react world!</span>
  </div>
)

export default RootView
