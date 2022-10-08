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
            fill(0, 255, 0)
            box(BATTERY_SLOT_SIZE)
        pop()
    }
}