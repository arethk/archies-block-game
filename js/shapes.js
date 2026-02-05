class AbstractBlockShape {
    constructor(colors) {
        if (new.target === AbstractBlockShape) {
            throw new Error("Cannot instantiate AbstractBlockShape");
        }
        if (Array.isArray(colors) === false || colors.length === 0) {
            throw new Error("Colors must be an array with at least one string");
        }
        this.color = new RandomItemSelector(colors, false).getRandomItem();
    }

    getColor() {
        return this.color;
    }

    getPlacement(id) {
        throw new Error("getGrid() must be overridden by a subclass");
    }
}

class SquareBlock extends AbstractBlockShape {
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
    constructor(colors) {
        super(colors);
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
