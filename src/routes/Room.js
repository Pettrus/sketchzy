import React, { Component } from 'react';
import openSocket from 'socket.io-client';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import DrawArea from '../components/DrawArea';

const socket = openSocket('http://localhost:8081');
const arr = document.URL.match(/\?room=(\w+)/);
const id = Math.round(Math.random());

class Room extends Component {

    state =  {
        me: {},
        users: [],
        room: null,
        nameSaved: false,
        nickname: "",
        playerTurn: false,
        drawing: null,
        waiting: [],
        doneDrawing: [],
        itemName: null,
        correctAnswer: false,
        guesses: []
    }

    componentDidMount() {
        let room = null;

        if(arr != null && arr.length > 0) {
            room = arr[1];
        }else {
            room = Math.random().toString(36).substring(7);
        }

        this.setState({
            room: room
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
        const id = Math.random().toString(36);
        this.setState({
            me: {
                id: id,
                nickname: this.state.nickname
            }
        });

        socket.emit('joinroom', {
            room: this.state.room,
            nickname: this.state.nickname,
            id: id
        });

        socket.on('users', (users) => {
            this.setState({
                users: users
            });
        });

        socket.on('playerTurn', (playerTurn) => {
            let myTurn = false;

            if(playerTurn.user.id == this.state.me.id) {
                myTurn = true;
            }

            this.setState({
                waiting: this.state.users,
                drawing: playerTurn.user,
                playerTurn: myTurn,
                itemName: playerTurn.itemName
            });
        });

        socket.on('guess', (guess) => {
            if(guess.name !== this.state.me.nickname) {
                this.setState(prevState => ({
                    guesses: [...prevState.guesses, guess]
                }));
            }
        });

        this.setState({
            nameSaved: true
        });
    }

    sendGuess = (evt) => {
        evt.preventDefault();

        console.log(this.input.value);

        if(this.state.itemName.toLowerCase() === this.input.value.toLowerCase()) {
            this.setState({
                correctAnswer: true
            });
        }else {
            const guess = {
                name: this.state.me.nickname,
                guess: this.input.value
            };

            this.setState(prevState => ({
                guesses: [...prevState.guesses, guess]
            }));

            socket.emit('guess', guess, this.state.room);
        }

        this.input.value = "";
    }

    render() {
        return (
            <div className="container">
                <div>
                    {this.state.playerTurn && this.state.itemName != null &&
                        <div className="alert alert-primary text-center" role="alert">
                            Draw a {this.state.itemName}
                        </div>
                    }
                    {(this.state.users.length == 1 || !this.state.nameSaved) &&
                        <div>
                            <div className="row">
                                <div className="col-md-5 mx-auto">
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

                    {this.state.users.length > 1 && this.state.nameSaved &&
                        <div>
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="list-group">
                                        {this.state.users.map(user => (
                                            <div key={user.id} className="list-group-item list-group-item-action flex-column align-items-start">
                                                <div className="d-flex w-100 justify-content-between">
                                                    <h5 className="mb-1">{user.nickname}</h5>
                                                    <small>1 turn</small>
                                                </div>
                                                
                                                <small>100 points</small>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="col-md-9">
                                    <DrawArea socket={socket} playerTurn={this.state.playerTurn} room={this.state.room}></DrawArea>
                                </div>
                            </div>

                            <div className="row">
                                <div className="col-md-9 offset-md-3">
                                    <div className="guesses">
                                        {this.state.guesses.map((guess, i) => (
                                            <div key={i}>{guess.name}: {guess.guess}</div>
                                        ))}
                                    </div>

                                    <div className="form-group">
                                        <form onSubmit={this.sendGuess}>
                                            <input id="guess" name="guess" type="text" className="form-control" maxLength="100" placeholder="Take a guess"
                                                ref={(input) => this.input = input}
                                                disabled={this.state.correctAnswer} />
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}

export default Room;