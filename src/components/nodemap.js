import React, { Component } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

class NodeMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      linking: false,
      lastClicked: ''
    };
  }

  
dragStart = ( event ) => {
  const nodeData = event.dataTransfer.getData("node");
  if( !isNaN( nodeData ) ){
    event.preventDefault();
    event.dataTransfer.setData("destination", nodeData)
  }
}

dragEnd = ( event ) => {
  const nodeData = event.dataTransfer.getData("node");
  if( nodeData ){
    event.preventDefault();
    this.props.graph.addNode( event.target.dataset.id, JSON.parse(nodeData));
    this.forceUpdate();
  }
}

isAdjacent = ( node1, node2 ) => {
  const node1arr = node1.split(',');
  const node2arr = node2.split(',');
  let componentDistance = 0;
  node1arr.forEach( (el, index) => {
    componentDistance += Math.abs( el - node2arr[index] );
  });
  return ( componentDistance == 1 );
}

getLinkDirection = ( link ) => {
  const coordsFrom = link.fromId.split(',');
  const coordsTo = link.toId.split(',');
  for(let i = 0; i < Math.min( coordsFrom.length, coordsTo.length ); i++ ){
    if( coordsFrom[i] != coordsTo[i] ){
      const diff = coordsTo[i] - coordsFrom[i];
      if( diff == 1 ){
        switch(i){
          case 0: //west
            return '270deg';
          case 1: //north
            return '0';
          case 3: //up
            return '0';
        }
      } else {
        switch(i){
          case 0: //east
            return '90deg';
          case 1: //south
            return '180deg';
          case 3: //down
            return '0';
        }
      }
    }
  }
  return '';
}

addLink = ( event ) => {
  const last = this.state.lastClicked;
  const current = event.target.dataset.id;
  if( last != '' ) {
    if( last != current && this.isAdjacent( last, current ) && !this.props.graph.getLink( last, current ) ){
      this.props.graph.addLink( current, last, { weight: this.props.linkWeight } );
    }
    this.setState({ lastClicked: '' });
  }
  else {
    this.setState({ lastClicked: current });
  }
}

mapLinks = ( nodeID ) => {
  let links = [];
  this.props.graph.forEachLinkedNode( nodeID, (linkedNode, link) => {
    let linkDirection = this.getLinkDirection( link );
    links.push(
      <div
        key={link.id}
        data-id={link.id}
        className={`nodeLink verticalLink interactable`}
        style={{
          transform: `rotateZ(${linkDirection}) translateY(${30 / this.props.zoom}vw)`
        }}
      />
    );
  }, true);
  return links;
}

imageNodeGraph = (node, i, k) => (
  <OverlayTrigger
    overlay={ 
      <Tooltip id={node.id}>
        <h4>{node.data.type}</h4>
        <h4>{node.id}</h4>
        <h4>${node.data.propertyValue}</h4>
      </Tooltip>
    }
    delayHide={0}
    key={node.id}
    placement={ k > this.props.zoom / 2 ? "top" : "bottom" }
    delayShow={300}
  >
    <img
      className='tile highlightable'
      data-id={node.id}
      src={node.data.image}
      style={{
        gridArea: `${k} / ${i} / span 1 / span 1`,
        borderLeft: ``,
        borderRight: ``,
        borderTop: ``,
        borderBottom: ``
      }}
    />
  </OverlayTrigger>
);

imageNodeLink = ( node, i, k ) => (
  <div
    className='tile passthru'
    key={node.id}
    draggable='false'
    style={{
      gridArea: `${k} / ${i} / span 1 / span 1`,
      borderLeft: ``,
      borderRight: ``,
      borderTop: ``,
      borderBottom: ``
    }}
  >
    <div
      className={`nodeCenter interactable ${node.id == this.state.lastClicked ? 'nodeCenterHilit' : ''}`}
      onClick={this.addLink}
      style={{
        width: `${50 / this.props.zoom}vw`,
        height: `${50 / this.props.zoom}vw`
      }}
      data-id={node.id}
    />
    {this.mapLinks(node.id)}
    <img className='tile translucent passthru' draggable='false' src={node.data.image}/>
  </div>
);

emptyNode = (nodeID, i, k) => (
  <div
    className={`tile ${this.props.graphMode ? 'dashedBorder' : ''}`}
    key={nodeID}
    data-id={nodeID}
    onDragEnter={this.dragStart}
    onDragOver={this.dragStart}
    onDrop={this.dragEnd}
    style={{
      gridArea: `${k} / ${i} / span 1 / span 1`
    }}
  />
);

mapNodes = ( props ) => {
    let nodeList = [];
    const zoom = props.zoom;
    for( let i = 0; i < zoom; i++ ){
      for( let k = 0; k < zoom; k++ ){
        const nodeID = `${props.x + i},${props.y + k},${props.z}`;
        const node = props.graph.getNode( nodeID );
        if( node != undefined && node.data.image ){
          let newNode = props.graphMode ? this.imageNodeGraph( node, i, k, props) : this.imageNodeLink( node, i, k );
          nodeList.push( newNode );
        }
        else {
          nodeList.push( this.emptyNode(nodeID, i, k ) );
        }
      }
    }
    return nodeList;
}

  render = () => (
    <div className='map'
      style={{
        gridTemplateColumns: `repeat(${this.props.zoom}, 1fr)`,
        gridTemplateRows: `repeat(${this.props.zoom}, 1fr)`
      }}
    >
      {this.props.graph ? this.mapNodes(this.props) : null}
    </div>
  )
};

export default NodeMap;