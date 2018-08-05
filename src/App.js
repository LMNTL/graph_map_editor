import React, { Component } from 'react';
import Slider from 'react-rangeslider';
import NodeMap from './components/nodemap.js';
import { Button, Modal, FormGroup, ControlLabel, FormControl, Well, Image } from 'react-bootstrap';
import './App.css';
const createGraph = require('ngraph.graph');
const downloadFile = require('js-file-download');
const serialize = require('serialize-javascript');

class App extends Component {
  constructor(){
    super();
    this.state = {
      zoom: 5,
      name: "",
      x: 0,
      y: 0,
      z: 0,
      graph: null,
      graphMode: true,
      nodes: [],
      nodeTypes: [],
      showModal: false,
      draggingNode: false,
      modalTitle: 'big test',
      modalBody: 'test',
      uploadedImage: '',
      newNodeType: '',
      fileNameStatus: null,
      newPropertyValue: 0
    }
    this.uploadNodeTypesRef = React.createRef();
  }

  componentDidMount = () => {
    const persistedState = window.localStorage.getItem('rootState');
    if (persistedState) {
      try {
        this.setState(JSON.parse(persistedState));
      } catch (e) {
        this.makeGraph();
      }
    }
    this.setState({
      draggingNode: false,
      x: 0,
      y: 0
    });
    if( !this.state.graph ){
      this.makeGraph();
    }
    window.addEventListener( 'keydown', this.handleKeyInput );
    window.setInterval(this.updateStorage, 10000)
  }

  updateStorage = () => {
    window.localStorage.setItem('rootState', JSON.stringify(this.state));
  }

  makeGraph = () => {
    this.setState({
      graph: createGraph()
    });
  }

  changeZoom = ( value ) => {
    this.setState({ zoom: value });
  }

  newFile = ( event ) => {
    this.name = "";
    this.setState({
      name: '',
      graph: createGraph()
    });
  }

  openFile = ( event ) => {

  }

  updateName = ( event ) => {
    this.setState({
      name: event.target.value
    });
  }

  newNode = ( event ) => {
    this.setState({
      showModal: true,
      modalTitle: 'Add new node type...',
      modalBody: "test"
    });
  }

  handleClose = ( event ) => {
    this.setState({
      showModal: false,
      uploadedImage: ''
    })
  }

  handleKeyInput = ( event ) => {
    let [newY] = [this.state.y];
    let [newX] = [this.state.x];
    switch(event.keyCode){
      case 37: //left
        newX += 1;
        break;
      case 38: //up
        newY += 1;
        break;
      case 39: //right
        newX -= 1;
        break;
      case 40: //down
        newY -= 1;
      default:
        break;
    }
    this.setState({
      x: newX,
      y: newY
    });
  }

  changeUploadedImage = ( event ) => {
    this.setState({ uploadedImage: event.target.files[0].name })
  }

  changeNodeType = ( event ) => {
    this.setState({ newNodeType: event.target.value });
  }

  changePropertyValue = ( event ) => {
    this.setState({ newPropertyValue: event.target.value });
  }

  getValidationState = () => {
    if( this.state.uploadedImage != '' && this.state.newNodeType != '' && !isNaN(this.state.newPropertyValue) && !this.state.nodeTypes.find(el => el.type == this.state.newNodeType) )
      return 'success';
    else
      return 'error';
  }

  addNodeType = ( event ) => {
    event.preventDefault();
    event.stopPropagation();
    if( this.getValidationState() == "success" ){
      let nodeType = {
        image: this.state.uploadedImage,
        type: this.state.newNodeType,
        propertyValue: this.state.newPropertyValue
      };
      this.setState({
        nodeTypes: this.state.nodeTypes.concat( nodeType ),
        showModal: false
      });
    }
  }

  saveFile = ( event ) => {
    if( this.state.name != '' ){
      let jsonString = serialize( this.state.graph, {isJSON: true} );
      downloadFile( jsonString, this.state.name + '.json' );
      this.setState({
        fileNameStatus: null
      });
      } else {
      this.setState({
        fileNameStatus: 'error'
      });
    }
  }

  toggleGraphMode = ( event ) => {
    this.setState({ graphMode: !this.state.graphMode });
  }

  saveNodeTypes = ( event ) => {
    let jsonString = JSON.stringify( this.state.nodeTypes );
    downloadFile( jsonString, 'nodeTypes.json' );
  }

  loadNodeTypesDialog = ( event ) => {
    const refNode = this.uploadNodeTypesRef.current;
    refNode.click();
  }

  loadNodeTypes = ( event ) => {
    const scope = this;
    const fr = new FileReader();
    fr.onload = function() {
        scope.setState({
          nodeTypes: JSON.parse(this.result)
        })
    };
    fr.readAsText(event.target.files[0])
  }

  startDraggingNode = ( event ) => {
    event.dataTransfer.setData('node', serialize(this.state.nodeTypes[event.target.dataset.index], {isJSON: true} ) );
    this.setState({
      draggingNode: true
    });
  }

  nodeTypeModal = () => (
    <form onSubmit={this.addNodeType}>
    <FormGroup
      controlId="formBasicText"
      validationState={this.getValidationState()}
    >
      <ControlLabel>Image:</ControlLabel>
      <FormControl
        componentClass="input"
        type="file"
        accept="image/*"
        value={this.uploadedImage}
        onChange={this.changeUploadedImage}
      />
      { this.state.uploadedImage != '' ? <img className='uploadedImage' src={this.state.uploadedImage}/> : null }
      <br></br>
      <FormControl.Feedback />
      <ControlLabel>Type:</ControlLabel>
      <FormControl
        componentClass="input"
        type="text"
        value={this.newNodeType}
        placeholder="example: asphalt, bougieDoor"
        onChange={this.changeNodeType}
      />
      <FormControl.Feedback />
      <ControlLabel>Property Value:</ControlLabel>
      <FormControl
        componentClass="input"
        type="number"
        value={this.newPropertyValue}
        placeholder="Make sure it's a number"
        onChange={this.changePropertyValue}
      />
      <FormControl.Feedback />
    </FormGroup>
  </form>
  );

  render() {
    let { zoom } = this.state;
    return (
      <div className="app">
        <div className="static-modal">
          <Modal show={this.state.showModal} onHide={this.handleClose}>
            <Modal.Header>
              <Modal.Title>{this.state.modalTitle}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.nodeTypeModal()}
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={this.handleClose}>Cancel</Button>
              <Button onClick={this.addNodeType} bsStyle="primary">Add</Button>
            </Modal.Footer>
          </Modal>
        </div>
        <div className='topbar'>
          <Button
            onClick={this.newFile}
            block
          >
            New file
          </Button>
          <Button
            onClick={this.openFile}
            block
          >
            Open file
          </Button>
          <Button
            onClick={this.saveFile}
            block
          >
            Save file
          </Button>
          <Button
            onClick={this.newNode}
            block
          >
            Create node
          </Button>
          <FormGroup controlId="nameForm" validationState={this.state.fileNameStatus}>
            <FormControl
              className="nameInput"
              componentClass="input"
              type="text"
              value={this.name}
              placeholder={'structure name'}
              onChange={this.updateName}
            />
          </FormGroup>
        </div>
        <NodeMap
          zoom={this.state.zoom}
          graph={this.state.graph}
          dragging={this.state.draggingNode}
          graphMode={this.state.graphMode}
          x={this.state.x}
          y={this.state.y}
          z={this.state.z}
        />
        <Well id='toolPalette'>
          <Image
            onClick={this.toggleGraphMode}
            className="changeView"
            src={this.state.graphMode ? "gridView.png" : "edgeView.png"}
            circle
          />
          <div className="toolLabel">
            <p>Zoom</p>
            <Slider
              className='zoomSlider'
              value={zoom}
              orientation='vertical'
              onChange={this.changeZoom}
              toolTip={'zoom'}
              min={3}
              max={30}
            />
          </div>
        </Well>
        <div className='nodePalette'>
          <Button
            onClick={this.newNode}
          >
            +
          </Button>
          <Button
            onClick={this.saveNodeTypes}
          >
            Save<br></br>
            Node<br></br>
            Types
          </Button>
          <input ref={this.uploadNodeTypesRef} onChange={this.loadNodeTypes} className="hidden" type="file" accept=".json"/>
          <Button
            onClick={this.loadNodeTypesDialog}
          >
            Load<br></br>
            Node<br></br>
            Types
          </Button>
          {this.state.nodeTypes.map( ( el,ind ) => {
            return (
              <Image
                key={el.type}
                data-index={ind}
                src={el.image}
                onDragStart={this.startDraggingNode}
              responsive />
            );
          })}
        </div>
      </div>
    );
  }
}

export default App;
