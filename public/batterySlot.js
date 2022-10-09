/*
@file batterySlot.js
@author Craig
@date 10/7/2022
@brief Battery mechanics
*/

const BATTERY_SLOT_SIZE = 10
const BATTERY_SLOT_RADIUS = 50

class BatterySlot {
    constructor(pos, hasBattery) {
        this.pos = pos
        this.hasBattery = hasBattery
    }

    render() {
        push()
            translate(this.pos.x, this.pos.y+21, this.pos.z);
            fill(0, 0, 0)
            strokeWeight(0.1);
            stroke(255);
            rotateZ(PI);
            scale(0.3);
            model(BATTERY_SLOT_OBJ);
        pop()
        if (this.hasBattery) {
            push()
                translate(this.pos.x, this.pos.y+13, this.pos.z);
                fill(255, 255, 0);
                strokeWeight(0.1);
                stroke(0);
                rotateZ(PI);
                rotateY(frameCount / 20)
                scale(0.16);
                model(DROPPED_BATTERY_OBJ);
            pop();
        }
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), BATTERY_SLOT_RADIUS)
    }
}