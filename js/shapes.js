class AbstractBlockShape {
    constructor(colorSelector) {
        if (new.target === AbstractBlockShape) {
            throw new Error("Cannot instantiate AbstractBlockShape");
        }
        if (colorSelector instanceof RandomItemSelector === false) {
            throw new Error("Invlid RandomItemSelector");
        }
        this.color = colorSelector.getRandomItem();
    }

    getColor() {
        return this.color;
    }

    getPlacement(id) {
        throw new Error("getGrid() must be overridden by a subclass");
    }
}

class SquareBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class LineBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0]
        ];
    }
}

class SBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, id, id, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class ZBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class LBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class JBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, 0, 0, 0, 0, 0]
        ];
    }
}

class TBlock extends AbstractBlockShape {
    constructor(colorSelector) {
        super(colorSelector);
    }

    getPlacement(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, id, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0]
        ];
    }
}
