import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import DrawArea from '../components/DrawArea';

const socket = openSocket('http://localhost:8081');
const arr = document.URL.match(/\?room=(\w+)/);
const id = Math.round(Math.random());

class Room extends Component {

    state =  {
        users: null,
        room: null,
        nameSaved: false,
        nickname: ""
    }

    componentDidMount() {
        let room = null;

        if(arr != null && arr.length > 0) {
            room = arr[1];
        }else {
            room = Math.random().toString(36).substring(7);
        }

        socket.on('connect', () => {
            socket.emit('joinroom', room);
            this.setState({
                room: room
            });
        });

        socket.on('users', (users) => {
            console.log(users.length);
            
            this.setState({
                users: users.length
            });
        });
    }

    initCanvas = () => {
        const canvas = this.refs.canvas;
        const ctx = canvas.getContext("2d");

        ctx.fillStyle = "solid";
	    ctx.strokeStyle = "#bada55";
	    ctx.lineWidth = 5;
	    ctx.lineCap = "round";
    }

    updateNickName = (evt) => {
        this.setState({
            nickname: evt.target.value
        });
    }

    toRoom = () => {
        this.setState({
            nameSaved: true
        });
    }

    render() {
        return (
            <div>
                <div>
                    {(this.state.users == 1 || !this.state.nameSaved) &&
                        <div>
                            <div className="row">
                                <div className="col-md-4 mx-auto">
                                    <div className="card">
                                        <div className="card-body">
                                            {!this.state.nameSaved &&
                                                <div>
                                                    <div className="form-group">
                                                        <input type="text" maxLength="100" placeholder="What is your name?" className="form-control"
                                                            value={this.state.nickname} onChange={this.updateNickName} />
                                                    </div>

                                                    <div className="text-center">
                                                        <button type="button" className="btn btn-primary" onClick={this.toRoom}>
                                                            Next
                                                        </button>
                                                    </div>
                                                </div>
                                            }

                                            {this.state.nameSaved &&
                                                <div>
                                                    Share this link with your friends so you can play together!

                                                    <div className="input-group" style={{marginTop: '1em'}}>
                                                        <input type="text" className="form-control" 
                                                            value={'http://localhost:3000/?room=' + this.state.room} disabled />

                                                        <div className="input-group-append">
                                                            <CopyToClipboard text={'http://localhost:3000/?room=' + this.state.room}>
                                                                <button className="btn btn-light">Copy</button>
                                                            </CopyToClipboard>
                                                        </div>
                                                    </div>

                                                    <div style={{color: 'red'}}>
                                                        <small>*You need at least 2 people to play this game</small>
                                                    </div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    {this.state.users > 1 && this.state.nameSaved &&
                        <div>
                            canvas
                            <DrawArea socket={socket}></DrawArea>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Room;