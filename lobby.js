/*
@file lobby.js
@author entire team
@date 10/7/2022
@brief SERVER lobby
*/

const LOBBY_OPEN = 0
const LOBBY_STARTED = 1

const MODE_FFA = 0
const MODE_CTF = 1

class Lobby {
    constructor(players, status, teams, names, gameMode = MODE_FFA) {
        this.status = status
        this.players = players
        this.gameMode = gameMode
        this.teams = teams
        this.names = names
    }
}

module.exports = {Lobby, LOBBY_OPEN, LOBBY_STARTED, MODE_FFA, MODE_CTF};