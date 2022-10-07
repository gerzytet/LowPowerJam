const projectileSize = 10

class Projectile {
    constructor (pos, vel, owner) {
        this.pos = pos
        this.vel = vel
        this.owner = owner
    }

    render() {
        push()
            translate(this.pos)
            fill(255, 0, 0)
            sphere(projectileSize)
        pop()
    }

    move() {
        this.pos.add(this.vel)
    }

    getCollider() {
        return new SphereCollider(this.pos.copy(), projectileSize)
    }
}