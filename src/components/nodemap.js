import React, { Component } from 'react';
import { Tooltip, OverlayTrigger } from 'react-bootstrap';

class NodeMap extends Component {
  constructor(props){
    super(props);
    this.state = {
      linking: false
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

startLinking = ( event ) => {

}

addLink = ( event ) => {
  console.log(event.target.dataset.id)
}

mapLinks = ( nodeID ) => {
  let links = {};
  this.props.graph.forEachLinkedNode( nodeID, (linkedNode, link) => {
    console.log(link)
  });
}

imageNodeGraph = (node, i, k) => (
  <OverlayTrigger
    overlay={ 
      <Tooltip id={node.id} className={this.props.graphMode ? null : 'hidden'}>
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
      className={`tile imageTile ${this.props.graphMode ? 'highlightable' : 'linkOrigin'}`}
      data-id={node.id}
      onDragStart={this.startLinking}
      onDragEnter={this.addLink}
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
  <img
    className={`tile imageTile ${this.props.graphMode ? 'highlightable' : 'linkOrigin'}`}
    data-id={node.id}
    key={node.id}
    onDragStart={this.startLinking}
    onDragEnter={this.addLink}
    src={node.data.image}
    style={{
      gridArea: `${k} / ${i} / span 1 / span 1`,
      borderLeft: ``,
      borderRight: ``,
      borderTop: ``,
      borderBottom: ``
    }}
  />
  )

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
          let edges = this.mapLinks( nodeID );
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