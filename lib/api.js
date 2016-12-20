'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.convertNode = convertNode;
exports.convertNodes = convertNodes;
exports.convertEdge = convertEdge;
exports.convertEdges = convertEdges;

exports.default = function (graph) {
  var _convertNode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : convertNode;

  var _convertEdge = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : convertEdge;

  var editGraph = _graphlib2.default.json.write(graph);
  var nodes = (0, _lodash2.default)(editGraph.nodes).groupBy('parent').mapValues(_lodash2.default.partial(convertNodes, _convertNode, graph)).value();
  var edges = (0, _lodash2.default)(editGraph.edges).map(_lodash2.default.partial(setEdgeParent, _lodash2.default, graph)).groupBy('parent').value();
  return {
    id: 'root',
    children: _lodash2.default.map(nodes[undefined], _lodash2.default.partial(combineNodes, graph, _lodash2.default, nodes, edges, _convertEdge)),
    edges: convertEdges(_convertEdge, graph, edges[undefined])
  };
};

var _graphlib = require('graphlib');

var _graphlib2 = _interopRequireDefault(_graphlib);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function convertNode(graph, node) {
  return {
    id: node.v,
    labels: [{ text: node.v, name: node.v }]
  };
}

function convertNodes(_convertNode, graph, nodes) {
  return _lodash2.default.map(nodes, _lodash2.default.partial(_convertNode, graph, _lodash2.default));
}

function convertEdge(graph, edge) {
  var sourceHierarchy = false;
  var targetHierarchy = false;
  if (graph.parent(edge.v) === edge.w) {
    sourceHierarchy = true;
  } else if (graph.parent(edge.w) === edge.v) {
    targetHierarchy = true;
  } else if (edge.v === edge.w) {
    sourceHierarchy = true;
    targetHierarchy = true;
  }
  return {
    id: edge.v + edge.w,
    source: edge.v,
    target: edge.w
  };
}

function convertEdges(_convertEdge, graph, edges) {
  return _lodash2.default.map(edges, _lodash2.default.partial(_convertEdge, graph, _lodash2.default));
}

function combineNodes(graph, node, childMap, edgeMap, _convertEdge) {
  if (_lodash2.default.has(childMap, node.id)) {
    node.children = _lodash2.default.map(childMap[node.id], _lodash2.default.partial(combineNodes, graph, _lodash2.default, childMap, edgeMap));
  }
  if (_lodash2.default.has(edgeMap, node.id)) {
    node.edges = convertEdges(_convertEdge, graph, edgeMap[node.id]);
  }
  return node;
}

var edgeParent = function edgeParent(graph, edge) {
  var outP = edge.v;
  var inP = edge.w;
  if (outP === inP) {
    return outP;
  } else if (graph.parent(outP) === graph.parent(inP)) {
    return graph.parent(outP);
  } else if (graph.parent(outP) === inP) {
    return inP;
  } else {
    return outP;
  }
};

function setEdgeParent(edge, graph) {
  return _lodash2.default.merge({}, edge, { parent: edgeParent(graph, edge) });
}