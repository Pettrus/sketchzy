import React, { Component } from 'react';
import Immutable from 'immutable';
import { Socket } from 'dgram';

class DrawArea extends Component {
    constructor(props) {
        super(props);
  
        this.state = {
            lines: new Immutable.List(),
            isDrawing: false,
            socket: null
        };
  
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);

        props.socket.on('drawingCoordinates', (userAction) => {
            if(userAction.mouseDown) {
                this.handleMouseDown({button: 0}, true, userAction.point);
            }else if(userAction.mouseMove) {
                this.handleMouseMove({button: 0}, true, userAction.point);
            }else {
                this.handleMouseUp(true);
            }
        });
    }
  
    componentDidMount() {
        document.addEventListener("mouseup", this.handleMouseUp);
    }
  
    componentWillUnmount() {
        document.removeEventListener("mouseup", this.handleMouseUp);
    }
  
    handleMouseDown(mouseEvent, socketData, p) {
        if (mouseEvent.button != 0) {
            return;
        }
  
        const point = (p != null) ? p : this.relativeCoordinatesForEvent(mouseEvent);
  
        this.setState(prevState => ({
            lines: prevState.lines.push(new Immutable.List([point])),
            isDrawing: true
        }));

        if(socketData != true) {
            this.props.socket.emit('userDrawing', {mouseDown: true, point: point});
        }
    }
  
    handleMouseMove(mouseEvent, socketData, p) {
        if (!this.state.isDrawing) {
            return;
        }
  
        const point = (p != null) ? p : this.relativeCoordinatesForEvent(mouseEvent);
      
        this.setState(prevState =>  ({
            lines: prevState.lines.updateIn([prevState.lines.size - 1], line => line.push(point))
        }));

        if(socketData != true) {
            this.props.socket.emit('userDrawing', {mouseMove: true, point: point});
        }
    }
  
    handleMouseUp(socketData) {
        this.setState({ isDrawing: false });

        if(socketData != true) {
            this.props.socket.emit('userDrawing', {mouseUp: true});
        }
    }
  
    relativeCoordinatesForEvent(mouseEvent) {
        const boundingRect = this.refs.drawArea.getBoundingClientRect();
        return new Immutable.Map({
            x: mouseEvent.clientX - boundingRect.left,
            y: mouseEvent.clientY - boundingRect.top,
        });
    }
  
    render() {
        return (
            <div
                className="drawArea"
                ref="drawArea"
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}>
                <Drawing lines={this.state.lines} />
        </div>
      );
    }
}
  
function Drawing({ lines }) {
    return (
        <svg className="drawing">
            {lines.map((line, index) => (
                <DrawingLine key={index} line={line} />
            ))}
        </svg>
    );
}
  
function DrawingLine({ line }) {
    const pathData = "M " +
        line.map(p => {
            console.log(p.x);
            if(p.x != null) {
                return `${p.x} ${p.y}`;
            }else {
                return `${p.get('x')} ${p.get('y')}`;
            }
        }).join(" L ");
  
    return <path className="path" d={pathData} />;
}

export default DrawArea;