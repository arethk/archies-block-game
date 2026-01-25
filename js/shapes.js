class AbstractBlockShape {
    constructor() {
        if (new.target === AbstractBlockShape) {
            throw new Error("Cannot instantiate AbstractBlockShape");
        }
    }

    getRowsDefinition(id) {
        throw new Error("getGrid() must be overridden by a subclass");
    }
}

class SquareBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class LineBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0]
        ];
    }
}

class SBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, id, id, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class ZBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class LBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, id, 0, 0, 0, 0]
        ];
    }
}

class JBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, 0, 0, 0, 0, 0]
        ];
    }
}

class TBlock extends AbstractBlockShape {
    constructor() {
        super();
    }

    getRowsDefinition(id) {
        return [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, id, id, id, 0, 0, 0, 0],
            [0, 0, 0, 0, id, 0, 0, 0, 0, 0]
        ];
    }
}
