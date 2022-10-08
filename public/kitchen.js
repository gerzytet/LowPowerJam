/*
@file kitchen.js
@author Craig
@date 10/7/2022
@brief Defines kitchen objects
*/

const KITCHEN_RADIUS = 120
const KITCHEN_SIZE = 30

class Kitchen {
    constructor(pos, batterySlot) {
        this.pos = pos
        this.batterySlot = batterySlot
    }

    render() {
        this.batterySlot.render()
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), KITCHEN_RADIUS)
    }

    isOn() {
        return !this.hasBatterySlot() || this.batterySlot.hasBattery
    }

    hasBatterySlot() {
        return this.batterySlot !== undefined
    }
}

class HealthKitchen extends Kitchen {
    constructor(pos, batterySlot) {
        super(pos, batterySlot)
    }

    render() {
        push()
            super.render()
            translate(this.pos)
            if (this.isOn()) {
                fill(255, 120, 120)
            } else {
                fill(255 / 2, 120 / 2, 120 / 2)
            }
            box(KITCHEN_SIZE)
        pop()
    }

    regeneratePlayer(player) {
        player.heal(0.5)
    }
}

class TomatoKitchen extends Kitchen {
    constructor(pos, batterySlot) {
        super(pos, batterySlot)
    }

    render() {
        push()
            super.render()
            translate(this.pos)
            if (this.isOn()) {
                fill(255, 0, 0)
            } else {
                fill (255 / 2, 0, 0)
            }
            box(KITCHEN_SIZE)
        pop()
    }

    regeneratePlayer(player) {
        player.addAmmo(0.03)
    }
}