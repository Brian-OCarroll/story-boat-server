module.exports = class Main {
    //dont know if need to pass in socket server object
    constructor(io) {
        // this.host = 'host';
        this.totalGameCount = 0,
        this.gameList = []
        this.loopLimit = 0;
        this.io = io;
        this.initiateIO();
        this.numUsers = 0;
    }

    initiateIO() {
        this.io.on('connection', function (socket) {
            let addedUser = false;

            // when the client emits 'new message', this listens and executes
            socket.on('new message', function (data) {
                // we tell the client to execute 'new message'
                socket.broadcast.emit('new message', {
                    username: socket.username,
                    message: data
                });
            });

            // when the client emits 'add user', this listens and executes
            socket.on('add user', function (username) {
                if (addedUser) return;

                // we store the username in the socket session for this client
                socket.username = username;
                ++this.numUsers;
                addedUser = true;
                socket.emit('login', {
                    numUsers: this.numUsers
                });
                // echo globally (all clients) that a person has connected
                socket.broadcast.emit('user joined', {
                    username: socket.username,
                    numUsers: this.numUsers
                });
            });

            // when the client emits 'typing', we broadcast it to others
            socket.on('typing', function () {
                socket.broadcast.emit('typing', {
                    username: socket.username
                });
            });

            // when the client emits 'stop typing', we broadcast it to others
            socket.on('stop typing', function () {
                socket.broadcast.emit('stop typing', {
                    username: socket.username
                });
            });

            // when the user disconnects.. perform this
            socket.on('disconnect', function () {
                if (addedUser) {
                    --this.numUsers;
                    killGame(socket);

                    // echo globally that this client has left
                    socket.broadcast.emit('user left', {
                        username: socket.username,
                        numUsers: numUsers
                    });
                }
            });


            socket.on('joinGame', function () {
                console.log(socket.username + " wants to join a game");

                let alreadyInGame = false;

                for (let i = 0; i < this.totalGameCount; i++) {
                    let plyr1Tmp = this.gameList[i]['gameObject']['playerOne'];
                    let plyr2Tmp = this.gameList[i]['gameObject']['playerTwo'];
                    if (plyr1Tmp == socket.username || plyr2Tmp == socket.username) {
                        alreadyInGame = true;
                        console.log(socket.username + " already has a Game!");

                        socket.emit('alreadyJoined', {
                            gameId: this.gameList[i]['gameObject']['id']
                        });

                    }

                }
                if (alreadyInGame == false) {


                    this.gameSeeker(socket);

                }

            });


            socket.on('leaveGame', function () {


                if (this.totalGameCount == 0) {
                    socket.emit('notInGame');

                }

                else {
                    killGame(socket);
                }

            });
        });
    }

    buildGame(socket) {


        let gameObject = {};
        gameObject.id = (Math.random() + 1).toString(36).slice(2, 18);
        gameObject.playerOne = socket.username;
        gameObject.playerTwo = null;
        gameObject.playerThree = null;
        gameObject.playerFour = null;
        gameObject.playerFive = null;
        this.totalGameCount++;
        this.gameList.push({ gameObject });

        console.log("Game Created by " + socket.username + " w/ " + gameObject.id);
        io.emit('gameCreated', {
            username: socket.username,
            gameId: gameObject.id
        });


    }
    killGame(socket) {

        let notInGame = true;
        for (let i = 0; i < this.totalGameCount; i++) {

            let gameId = this.gameList[i]['gameObject']['id']
            let plyr1Tmp = this.gameList[i]['gameObject']['playerOne'];
            let plyr2Tmp = this.gameList[i]['gameObject']['playerTwo'];
            let plyr3Tmp = this.gameList[i]['gameObject']['playerThree'];
            let plyr4Tmp = this.gameList[i]['gameObject']['playerFour'];
            let plyr5Tmp = this.gameList[i]['gameObject']['playerFive'];
            if (plyr1Tmp == socket.username) {
                --this.totalGameCount;
                console.log("Destroy Game " + gameId + "!");
                this.gameList.splice(i, 1);
                console.log(this.gameList);
                socket.emit('leftGame', { gameId: gameId });
                io.emit('gameDestroyed', { gameId: gameId, gameOwner: socket.username });
                notInGame = false;
            }
            else if (plyr2Tmp == socket.username) {
                this.gameList[i]['gameObject']['playerTwo'] = null;
                console.log(socket.username + " has left " + gameId);
                socket.emit('leftGame', { gameId: gameId });
                console.log(this.gameList[i]['gameObject']);
                notInGame = false;
            }
            else if (plyr3Tmp == socket.username) {
                this.gameList[i]['gameObject']['playerThree'] = null;
                console.log(socket.username + " has left " + gameId);
                socket.emit('leftGame', { gameId: gameId });
                console.log(this.gameList[i]['gameObject']);
                notInGame = false;
            }
            else if (plyr4Tmp == socket.username) {
                this.gameList[i]['gameObject']['playerFour'] = null;
                console.log(socket.username + " has left " + gameId);
                socket.emit('leftGame', { gameId: gameId });
                console.log(this.gameList[i]['gameObject']);
                notInGame = false;
            }
            else if (plyr5Tmp == socket.username) {
                this.gameList[i]['gameObject']['playerFive'] = null;
                console.log(socket.username + " has left " + gameId);
                socket.emit('leftGame', { gameId: gameId });
                console.log(this.gameList[i]['gameObject']);
                notInGame = false;
            }

        }

        if (notInGame == true) {
            socket.emit('notInGame');
        }

    }

    gameSeeker(socket) {
        ++this.loopLimit;
        if ((this.totalGameCount == 0) || (this.loopLimit >= 20)) {

            this.buildGame(socket);
            this.loopLimit = 0;

        } else {
            let rndPick = Math.floor(Math.random() * this.totalGameCount);
            if (this.gameList[rndPick]['gameObject']['playerTwo'] == null) {
                this.gameList[rndPick]['gameObject']['playerTwo'] = socket.username;
                socket.emit('joinSuccess', {
                    gameId: this.gameList[rndPick]['gameObject']['id']
                });

                console.log(socket.username + " has been added to: " + this.gameList[rndPick]['gameObject']['id']);

            } else if (this.gameList[rndPick]['gameObject']['playerThree'] == null){
                this.gameList[rndPick]['gameObject']['playerThree'] = socket.username;
                socket.emit('joinSuccess', {
                    gameId: this.gameList[rndPick]['gameObject']['id']
                });

                console.log(socket.username + " has been added to: " + this.gameList[rndPick]['gameObject']['id']);
            } else if (this.gameList[rndPick]['gameObject']['playerFour'] == null){
                this.gameList[rndPick]['gameObject']['playerFour'] = socket.username;
                socket.emit('joinSuccess', {
                    gameId: this.gameList[rndPick]['gameObject']['id']
                });

                console.log(socket.username + " has been added to: " + this.gameList[rndPick]['gameObject']['id']);
            } else if (this.gameList[rndPick]['gameObject']['playerFive'] == null){
                this.gameList[rndPick]['gameObject']['playerFive'] = socket.username;
                socket.emit('joinSuccess', {
                    gameId: this.gameList[rndPick]['gameObject']['id']
                });

                console.log(socket.username + " has been added to: " + this.gameList[rndPick]['gameObject']['id']);
            }
            else {
                //recursive run if all slots are filled
                this.gameSeeker(socket);
            }
        }
    }

}

