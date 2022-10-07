class SphereCollider {
    constructor(pos, size) {
        this.pos = pos
        this.size = size
    }

    isColliding(other) {
        if (other instanceof SphereCollider) {
            let dist = this.pos.dist(other.pos)
            return dist <= this.size + other.size
        }
        return false
    }
}