import React, { Component } from 'react'
let d3 = require('d3')

let graph =
{
  "nodes": [
    {"id": "MediaNode", "group": 1},
    {"id": "HtmlSink", "group": 2},
    {"id": "COOLNODE", "group": 3}
  ],
  "links": [
    {"source": "MediaNode", "target": "HtmlSink", "value": 1},
    {"source": "HtmlSink", "target": "COOLNODE", "value": 18},
    {"source": "COOLNODE", "target": "MediaNode", "value": 10}
  ]
}

class Graph extends Component {
  componentDidMount() {

    //let graph = this.props.graph

    window.d3 = d3

    let width = 400,
    height = 400

    let svg = d3.select('.Graph').append('svg')
    .attr('width', width)
    .attr('height', height)

    let color = d3.scaleOrdinal(d3.schemeCategory20)

    let simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(function(d) { return d.id }))
        .force('charge', d3.forceManyBody())
        .force('center', d3.forceCenter(width / 2, height / 2))

    console.debug(graph)

    // TODO: Create several lines types in json

    let link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graph.links)
      .enter().append('line')
        .attr('stroke-width', function(d) { return Math.sqrt(d.value) })

    // TODO: Create several node types in json
    let node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graph.nodes)
      .enter().append('circle')
        .attr('r', 15)
        .attr('fill', function(d) { return color(d.group) })
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))

    node.append('title')
        .text(function(d) { return d.id })

    simulation
        .nodes(graph.nodes)
        .on('tick', ticked)

    simulation.force('link')
        .links(graph.links)

    function ticked() {
      link
          .attr('x1', function(d) { return d.source.x })
          .attr('y1', function(d) { return d.source.y })
          .attr('x2', function(d) { return d.target.x })
          .attr('y2', function(d) { return d.target.y })

      node
          .attr('cx', function(d) { return d.x })
          .attr('cy', function(d) { return d.y })
    }

    function dragstarted(d) {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x
      d.fy = d.y
    }

    function dragged(d) {
      d.fx = d3.event.x
      d.fy = d3.event.y
    }

    function dragended(d) {
      if (!d3.event.active) simulation.alphaTarget(0)
      d.fx = null
      d.fy = null
    }
  }
  render() {
    return (
      <div className='Graph'>
      </div>
    )
  }
}

export default Graph
