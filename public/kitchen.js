/*
@file kitchen.js
@author Craig
@date 10/7/2022
@brief Defines kitchen objects
*/

const KITCHEN_RADIUS = 120
const KITCHEN_SIZE = 30

class Kitchen {
    constructor(pos) {
        this.pos = pos
    }

    render() {
        
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), KITCHEN_RADIUS)
    }
}

class HealthKitchen extends Kitchen {
    constructor(pos) {
        super(pos)
    }

    render() {
        push()
            translate(this.pos)
            fill(255, 120, 120)
            box(KITCHEN_SIZE)
        pop()
    }

    regeneratePlayer(player) {
        player.heal(0.5)
    }
}

class TomatoKitchen extends Kitchen {
    constructor(pos) {
        super(pos)
    }

    render() {
        push()
            translate(this.pos)
            fill(255, 0, 0)
            box(KITCHEN_SIZE)
        pop()
    }

    regeneratePlayer(player) {
        player.addAmmo(0.03)
    }
}