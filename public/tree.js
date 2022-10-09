const TREE_SIZE = 300

class Tree {
    constructor(pos) {
        this.pos = pos
    }

    render() {
        push()
            translate(this.pos)
            translate(0, -TREE_SIZE, 0)
            translate(0, -GROUND, 0)
            rotateX(PI)
            scale(TREE_SIZE / 100)
            texture(TREE_PNG)
            model(TREE_OBJ)
        pop()
    }
}