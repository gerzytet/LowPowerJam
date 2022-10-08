/*
@file batterySlot.js
@author Craig
@date 10/7/2022
@brief Battery mechanics
*/

const BATTERY_SLOT_SIZE = 10
const BATTERY_SLOT_RADIUS = 20

class BatterySlot {
    constructor(pos, hasBattery) {
        this.pos = pos
        this.hasBattery = hasBattery
    }

    render() {
        push()
            translate(this.pos)
            if (this.hasBattery) {
                fill(0, 255, 0)
            } else {
                fill(0, 0, 0)
            }
            box(BATTERY_SLOT_SIZE)
        pop()
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), BATTERY_SLOT_RADIUS)
    }
}