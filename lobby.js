const LOBBY_OPEN = 0
const LOBBY_STARTED = 1

class Lobby {
    constructor(players, status) {
        this.status = status
        this.players = players
    }
}

module.exports = {Lobby, LOBBY_OPEN, LOBBY_STARTED};