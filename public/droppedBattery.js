class DroppedBattery {
    constructor(pos) {
        this.pos = pos
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), BATTERY_SLOT_RADIUS)
    }

    render() {
        push()
            translate(this.pos)
            rotateX(PI)
            fill(255, 255, 0);
            strokeWeight(0.1);
            stroke(0);
            scale(0.16);
            translate(0, sin(frameCount / 20) * 10, 0)
            rotateY(frameCount / 20)
            model(DROPPED_BATTERY_OBJ)
        pop()
    }
}