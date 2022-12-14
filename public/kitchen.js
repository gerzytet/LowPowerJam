/*
@file kitchen.js
@author Craig
@date 10/7/2022
@brief Defines kitchen objects
*/

const KITCHEN_RADIUS = 120
const KITCHEN_SIZE = 30

class Kitchen {
    constructor(pos, batterySlot, team) {
        this.pos = pos
        this.batterySlot = batterySlot
        this.team = team;
    }

    render() {
        this.batterySlot.render()
        push();
            translate(this.pos.x, this.pos.y - 50, this.pos.z);
            if(this.team == 0){
            fill(255, 0, 0);
            }
            else if(this.team == 1){
            fill(0, 0, 255);
            }
            else{
            fill(this.team * 25);
            }
            sphere(5);
        pop();
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
    constructor(pos, batterySlot, team) {
        super(pos, batterySlot, team)
    }

    render() {
        push()
            super.render()
            translate(this.pos)
            rotateX(PI)
            if (!this.isOn()) {
                tint(128)
            } else {
                translate(0, sin(frameCount / 20) * 10, 0)
                rotateY(frameCount / 20)
            }
            fill(255, 128, 128)
            scale(KITCHEN_SIZE / 100)
            model(HEALTH_OBJ)
        pop()
    }

    regeneratePlayer(player) {
        player.heal(0.5)
    }
}

class TomatoKitchen extends Kitchen {
    constructor(pos, batterySlot, team) {
        super(pos, batterySlot, team)
    }

    render() {
        push()
            super.render()
            translate(this.pos)
            rotateX(PI)
            if (!this.isOn()) {
                tint(128)
            } else {
                translate(0, sin(frameCount / 20) * 10, 0)
                rotateY(frameCount / 20)
            }
            scale(KITCHEN_SIZE / 100)
            texture(TOMATO_PNG)
            model(TOMATO_OBJ)
        pop()
    }

    regeneratePlayer(player) {
        player.addAmmo(0.03)
    }
}