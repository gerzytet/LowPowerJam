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
            scale(BATTERY_SLOT_SIZE / 100)
            model(DROPPED_BATTERY_OBJ)
        pop()
    }
}