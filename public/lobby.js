/*
@file lobby.js
@author entire team
@date 10/7/2022
@brief CLIENT lobby
*/

const LOBBY_OPEN = 0
const LOBBY_STARTED = 1

class Lobby {
    constructor(players, status) {
        this.status = status
        this.players = players
    }
}