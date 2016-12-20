
import graphlib from 'graphlib'
import _ from 'lodash'

export function convertNode (graph, node) {
  return {
    id: node.v,
    labels: [{text: node.v, name: node.v}]
  }
}

export function convertNodes (_convertNode, graph, nodes) {
  return _.map(nodes, _.partial(_convertNode, graph, _))
}

export function convertEdge (graph, edge) {
  var sourceHierarchy = false
  var targetHierarchy = false
  if (graph.parent(edge.v) === edge.w) {
    sourceHierarchy = true
  } else if (graph.parent(edge.w) === edge.v) {
    targetHierarchy = true
  } else if (edge.v === edge.w) {
    sourceHierarchy = true
    targetHierarchy = true
  }
  return {
    id: edge.v + edge.w,
    source: edge.v,
    target: edge.w
  }
}

export function convertEdges (_convertEdge, graph, edges) {
  return _.map(edges, _.partial(_convertEdge, graph, _))
}

function combineNodes (graph, node, childMap, edgeMap, _convertEdge) {
  if (_.has(childMap, node.id)) {
    node.children = _.map(childMap[node.id], _.partial(combineNodes, graph, _, childMap, edgeMap))
  }
  if (_.has(edgeMap, node.id)) {
    node.edges = convertEdges(_convertEdge, graph, edgeMap[node.id])
  }
  return node
}

var edgeParent = function (graph, edge) {
  var outP = edge.v
  var inP = edge.w
  if (outP === inP) {
    return outP
  } else if (graph.parent(outP) === graph.parent(inP)) {
    return graph.parent(outP)
  } else if (graph.parent(outP) === inP) {
    return inP
  } else {
    return outP
  }
}

function setEdgeParent (edge, graph) {
  return _.merge({}, edge, {parent: edgeParent(graph, edge)})
}

export default function (graph, _convertNode = convertNode, _convertEdge = convertEdge) {
  var editGraph = graphlib.json.write(graph)
  var nodes = _(editGraph.nodes)
    .groupBy('parent')
    .mapValues(_.partial(convertNodes, _convertNode, graph))
    .value()
  var edges = _(editGraph.edges)
    .map(_.partial(setEdgeParent, _, graph))
    .groupBy('parent')
    .value()
  return {
    id: 'root',
    children: _.map(nodes[undefined], _.partial(combineNodes, graph, _, nodes, edges, _convertEdge)),
    edges: convertEdges(_convertEdge, graph, edges[undefined])
  }
}