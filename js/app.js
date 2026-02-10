class ArchiesBlockGame {
    constructor(container) {
        // singelton
        if (ArchiesBlockGame.instance) {
            return ArchiesBlockGame.instance;
        }
        ArchiesBlockGame.instance = this;

        // construct
        this.container = container;

        // constants
        this.Constants = {};
        this.Constants.default = {};
        this.Constants.default.rows = 24; // there are 24 rows but only 20 are visible
        this.Constants.default.nonVisibleRows = 4;
        this.Constants.default.columns = 10; // there are 10 columns but the ui needs to draw a left and right border also
        this.Constants.default.columnBorders = 2;
        this.Constants.default.timeout = 500;
        this.Constants.labels = {};
        this.Constants.labels.turnLeft = "Turn Left";
        this.Constants.labels.turnRight = "Turn Right";
        this.Constants.labels.moveLeft = "<";
        this.Constants.labels.moveRight = ">";
        this.Constants.labels.moveDown = "^"; // its flipped with css
        this.Constants.layout = {};
        this.Constants.layout.header = "header";
        this.Constants.layout.headerGameOver = "header-game-over";
        this.Constants.layout.score = "score";
        this.Constants.layout.footer = "footer";
        this.Constants.layout.leftrightcontainer = "left-right-container";
        this.Constants.layout.flip = "flip";
        this.Constants.layout.hide = "hide";
        this.Constants.gridValues = {};
        this.Constants.gridValues.empty = 0;
        this.Constants.gridCssClass = {};
        this.Constants.gridCssClass.border = "border";
        this.Constants.gridCssClass.setBlock = "set-block";
        this.Constants.gridCssClass.empty = "";
        this.Constants.blocks = {};
        this.Constants.blocks.colors = [
            "red",
            "green",
            "blue",
            "purple",
            "orange",
            "pink"
        ];

        // action
        this.interval = null;
        const colorSelector = new RandomItemSelector(this.Constants.blocks.colors, false);
        this.blocks = new RandomItemSelector([
            new SquareBlock(colorSelector),
            new LineBlock(colorSelector),
            new SBlock(colorSelector),
            new ZBlock(colorSelector),
            new LBlock(colorSelector),
            new JBlock(colorSelector),
            new TBlock(colorSelector)
        ], true);
        this.buildHTML();
        this.reset();
    }

    reset() {
        this.clearTimer();
        this.isGameOverFlag = false;
        this.count = 0;
        this.buildStartingGrid();
        this.setNewBlock();
        setTimeout(this.moveBlockDown, 0);
    }

    setNewBlock() {
        this.block = this.blocks.getRandomItem();
        const placement = this.block.getPlacement(++this.count);
        this.grid[0] = placement[0];
        this.grid[1] = placement[1];
        this.grid[2] = placement[2];
        this.grid[3] = placement[3];
        this.drawGrid();
    }

    drawGrid() {
        const gridCssClasses = [
            this.Constants.gridCssClass.setBlock
        ];
        // add colors
        this.Constants.blocks.colors.forEach(element => {
            gridCssClasses.push(element);
        });
        for (let i = 0; i < this.grid.length; i++) {
            // skip top 4 rows
            if ([0, 1, 2, 3].includes(i)) {
                continue;
            }
            const row = this.grid[i];
            for (let j = 0; j < row.length; j++) {
                const item = row[j];
                const cell = document.querySelector(`.${ArchiesBlockGame.generateCellName(i, j)}`);
                gridCssClasses.forEach(c => {
                    cell.classList.remove(c);
                });
                switch (item) {
                    case this.Constants.gridValues.empty:
                        // don't do anything if empty
                        break;
                    default:
                        if (Number.isInteger(item)) {
                            if (item === this.count) {
                                cell.classList.add(this.block.getColor());
                            } else {
                                cell.classList.add(this.Constants.gridCssClass.setBlock);
                            }
                        } else {
                            console.log(`Invalid grid value ${item}`);
                        }
                        break;
                }
            }
        }
    }

    buildStartingGrid() {
        this.grid = [];
        for (let i = 0; i < this.Constants.default.rows; i++) {
            const row = [];
            for (let j = 0; j < this.Constants.default.columns; j++) {
                row.push(this.Constants.gridValues.empty);
            }
            this.grid.push(row);
        }
    }

    buildHTML() {
        if (!this.container || this.container instanceof HTMLElement === false) {
            throw new Error("Invalid container");
        }
        // set css grid rows and columns
        this.container.style.gridTemplateRows = `minmax(50px, 2fr) repeat(${this.Constants.default.rows - this.Constants.default.nonVisibleRows}, minmax(10px, 1fr)) minmax(50px, 1fr) minmax(150px, 4fr)`;
        this.container.style.gridTemplateColumns = `repeat(${this.Constants.default.columns + this.Constants.default.columnBorders}, minmax(30px, 1fr))`;

        // create header area
        const headerDiv = document.createElement("div");
        headerDiv.classList.add(this.Constants.layout.header);
        headerDiv.style.gridArea = this.Constants.layout.header;
        this.container.appendChild(headerDiv);

        // create header grid area
        const headerGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns + this.Constants.default.columnBorders; i++) {
            headerGridNameList.push(this.Constants.layout.header);
        }
        this.container.style.gridTemplateAreas = `"${headerGridNameList.join(" ")}"`;

        // create game area
        for (let i = this.Constants.default.nonVisibleRows; i < this.Constants.default.rows; i++) {
            const gameGridNameList = [];
            let cellClass = null;
            let cellGridName = null;
            for (let j = 0; j < this.Constants.default.columns + this.Constants.default.columnBorders; j++) {
                switch (j) {
                    case 0:
                    case 11:
                        cellClass = this.Constants.gridCssClass.border;
                        cellGridName = cellClass + ArchiesBlockGame.generateCellName(i, j);
                        break;
                    default:
                        cellClass = ArchiesBlockGame.generateCellName(i, j - 1);
                        cellGridName = cellClass;
                        break;
                }
                gameGridNameList.push(cellGridName);
                const div = document.createElement("div");
                div.classList.add(cellClass);
                div.style.gridArea = cellGridName;
                this.container.appendChild(div);
            }
            this.container.style.gridTemplateAreas += `"${gameGridNameList.join(" ")}"`;
        }

        // create score area
        const scoreDiv = document.createElement("div");
        scoreDiv.classList.add(this.Constants.layout.score);
        scoreDiv.style.gridArea = this.Constants.layout.score;
        scoreDiv.innerHTML = "Score:&nbsp;";
        const scoreSpan = document.createElement("span");
        scoreSpan.id = "score";
        scoreSpan.innerText = "0000";
        scoreDiv.appendChild(scoreSpan);
        this.container.appendChild(scoreDiv);

        // create score grid area
        const scoreGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns + this.Constants.default.columnBorders; i++) {
            scoreGridNameList.push(this.Constants.layout.score);
        }
        this.container.style.gridTemplateAreas += `"${scoreGridNameList.join(" ")}"`;

        // create footer area
        const footerDiv = document.createElement("div");
        footerDiv.classList.add(this.Constants.layout.footer);
        footerDiv.style.gridArea = this.Constants.layout.footer;

        // create control buttons
        const turnLeftButton = document.createElement("button");
        turnLeftButton.innerText = this.Constants.labels.turnLeft;
        turnLeftButton.onclick = () => { app.turnBlockLeft(); };
        const turnRightButton = document.createElement("button");
        turnRightButton.innerText = this.Constants.labels.turnRight;
        turnRightButton.onclick = () => { app.turnBlockRight(); };
        const moveLeftButton = document.createElement("button");
        moveLeftButton.innerText = this.Constants.labels.moveLeft;
        moveLeftButton.onclick = () => { app.moveBlockLeft(); };
        const moveRightButton = document.createElement("button");
        moveRightButton.innerText = this.Constants.labels.moveRight;
        moveRightButton.onclick = () => { app.moveBlockRight(); };
        const downButton = document.createElement("button");
        downButton.innerText = this.Constants.labels.moveDown;
        downButton.onclick = () => { app.moveBlockDown(); };
        downButton.classList.add(this.Constants.layout.flip);
        const turnLeftRightDiv = document.createElement("div");
        turnLeftRightDiv.classList.add(this.Constants.layout.leftrightcontainer);
        turnLeftRightDiv.appendChild(turnLeftButton);
        turnLeftRightDiv.appendChild(turnRightButton);
        const moveLeftRightDiv = document.createElement("div");
        moveLeftRightDiv.classList.add(this.Constants.layout.leftrightcontainer);
        moveLeftRightDiv.appendChild(moveLeftButton);
        moveLeftRightDiv.appendChild(moveRightButton);
        footerDiv.appendChild(turnLeftRightDiv);
        footerDiv.appendChild(moveLeftRightDiv);
        footerDiv.appendChild(downButton);
        this.container.appendChild(footerDiv);

        // create header grid area
        const footerGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns + this.Constants.default.columnBorders; i++) {
            footerGridNameList.push(this.Constants.layout.footer);
        }
        this.container.style.gridTemplateAreas += `"${footerGridNameList.join(" ")}"`;

        window.onkeydown = (event) => {
            switch (event.code) {
                case "ArrowUp":
                    app.turnBlockRight();
                    break;
                case "ArrowDown":
                    app.moveBlockDown();
                    break;
                case "ArrowLeft":
                    app.moveBlockLeft();
                    break;
                case "ArrowRight":
                    app.moveBlockRight();
                    break;
                default:
                    break;
            }
        }
    }

    findGridItemsByValue(value) {
        const items = [];
        for (let i = 0; i < this.grid.length; i++) {
            const row = this.grid[i];
            for (let j = 0; j < row.length; j++) {
                const item = row[j];
                if (item === value) {
                    items.push({
                        row: i,
                        column: j
                    });
                }
            }
        }
        if (items.length === 0) {
            console.log(`Invalid grid item value ${value}`);
        }
        return items;
    }

    removeItemsFromGrid(items) {
        this.updateItems(items, this.Constants.gridValues.empty);
    }

    isGameOver() {
        const invisibleTopItems = [];
        for (let i = 0; i < this.Constants.default.nonVisibleRows; i++) {
            for (let j = 0; j < this.Constants.default.columns; j++) {
                invisibleTopItems.push({
                    row: i,
                    column: j
                });
            }
        }
        return this.isItemsEmpty(invisibleTopItems) === false;
    }

    isItemsEmpty(items) {
        if (Array.isArray(items) === false) {
            throw new Error("Items must be an array");
        }
        let result = true;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (this.grid[item.row][item.column] !== this.Constants.gridValues.empty) {
                result = false;
                break;
            }
        }
        return result;
    }

    updateItems(items, value) {
        if (Array.isArray(items) === false) {
            throw new Error("Items must be an array");
        }
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            this.grid[item.row][item.column] = value;
        }
    }

    attemptMove(blockPositions, moves) {
        if (Array.isArray(blockPositions) === false) {
            throw new Error("BlockPositions must be an array");
        }
        if (Array.isArray(moves) === false) {
            throw new Error("Moves must be an array");
        }
        this.removeItemsFromGrid(blockPositions);
        if (this.isItemsEmpty(moves) === true) {
            this.updateItems(moves, this.count);
            this.drawGrid();
            return true;
        } else {
            // console.log("Cannot turn due to a blockage");
            this.updateItems(blockPositions, this.count);
            return false;
        }
    }

    turnBlockLeft() {
        if (this.isGameOverFlag === true) {
            return;
        }
        const blockPositions = this.findGridItemsByValue(this.count);
        switch (this.block.constructor) {
            case SquareBlock:
                // do nothing
                break;
            case LineBlock:
            case SBlock:
            case ZBlock:
                this.turnBlockRight();
                break;
            case LBlock:
                if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[2].column && blockPositions[3].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[0].column > 0) {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column - 2 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column + 1 }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[3];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 2, column: piece.column },
                            { row: piece.row - 2, column: piece.column - 1 }
                        ]
                    );
                } else if (blockPositions[1].column === blockPositions[2].column && blockPositions[1].column === blockPositions[3].column && blockPositions[3].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[3].column < 9) {
                        const piece = blockPositions[0];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row + 1, column: piece.column + 1 },
                                { row: piece.row + 1, column: piece.column },
                                { row: piece.row + 2, column: piece.column },
                                { row: piece.row + 1, column: piece.column + 2 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[0];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row + 1, column: piece.column + 1 },
                                { row: piece.row + 2, column: piece.column - 1 },
                                { row: piece.row + 1, column: piece.column - 1 },
                                { row: piece.row + 1, column: piece.column }
                            ]
                        );
                    }
                } else if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[3];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row - 2, column: piece.column }
                        ]
                    );
                }
                break;
            case JBlock:
                if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[3].column && blockPositions[0].column === (blockPositions[2].column + 1)) {
                    if (blockPositions[2].column > 0) {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row - 1, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column - 2 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column - 1 }
                            ]
                        );
                    }
                } else if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[1];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column + 1 },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row + 1, column: piece.column }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[2].column && blockPositions[0].column === blockPositions[3].column && blockPositions[1].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[1].column < 9) {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column + 2 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[3];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[1];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row - 1, column: piece.column + 1 },
                            { row: piece.row - 2, column: piece.column + 1 }
                        ]
                    );
                }
                break;
            case TBlock:
                if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[1];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row + 1, column: piece.column },
                            { row: piece.row - 1, column: piece.column }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[3].column && blockPositions[2].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[0].column > 0) {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column - 1 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[1].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[2];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row, column: piece.column - 1 },
                            { row: piece.row + 1, column: piece.column }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[2].column && blockPositions[0].column === blockPositions[3].column && blockPositions[0].column === (blockPositions[1].column + 1)) {
                    if (blockPositions[0].column < 9) {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row + 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row + 1, column: piece.column },
                                { row: piece.row, column: piece.column - 1 }
                            ]
                        );
                    }
                }
                break;
            default:
                console.log(`Invalid block ${this.block.constructor.name}`);
                break;
        }
    }

    turnBlockRight() {
        if (this.isGameOverFlag === true) {
            return;
        }
        const blockPositions = this.findGridItemsByValue(this.count);
        switch (this.block.constructor) {
            case SquareBlock:
                // do nothing
                break;
            case LineBlock:
                if (blockPositions[0].column === blockPositions[1].column) {
                    const piece = blockPositions[2];
                    if (piece.column > 1 && piece.column < 8) {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column - 2 },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column + 1 }
                            ]
                        );
                    } else {
                        if (piece.column < 2) {
                            if (piece.column === 0) {
                                this.attemptMove(
                                    blockPositions,
                                    [
                                        { row: piece.row, column: piece.column },
                                        { row: piece.row, column: piece.column + 1 },
                                        { row: piece.row, column: piece.column + 2 },
                                        { row: piece.row, column: piece.column + 3 }
                                    ]
                                );
                            } else if (piece.column === 1) {
                                this.attemptMove(
                                    blockPositions,
                                    [
                                        { row: piece.row, column: piece.column - 1 },
                                        { row: piece.row, column: piece.column },
                                        { row: piece.row, column: piece.column + 1 },
                                        { row: piece.row, column: piece.column + 2 }
                                    ]
                                );
                            } else {
                                console.log("Invalid Case");
                            }
                        } else {
                            if (piece.column === 9) {
                                this.attemptMove(
                                    blockPositions,
                                    [
                                        { row: piece.row, column: piece.column },
                                        { row: piece.row, column: piece.column - 1 },
                                        { row: piece.row, column: piece.column - 2 },
                                        { row: piece.row, column: piece.column - 3 }
                                    ]
                                );
                            } else if (piece.column === 8) {
                                this.attemptMove(
                                    blockPositions,
                                    [
                                        { row: piece.row, column: piece.column + 1 },
                                        { row: piece.row, column: piece.column },
                                        { row: piece.row, column: piece.column - 1 },
                                        { row: piece.row, column: piece.column - 2 }
                                    ]
                                );
                            } else {
                                console.log("Invalid Case");
                            }
                        }
                    }
                } else {
                    const piece = blockPositions[2];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row + 1, column: piece.column },
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 2, column: piece.column }
                        ]
                    );
                }
                break;
            case SBlock:
                if (blockPositions[0].row === blockPositions[1].row) {
                    const piece = blockPositions[3];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 1, column: piece.column - 1 },
                            { row: piece.row - 2, column: piece.column - 1 }
                        ]
                    );
                } else {
                    const piece = blockPositions[3];
                    if (piece.column < 9) {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column + 1 }
                            ]
                        );
                    } else {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column - 2 },
                                { row: piece.row - 1, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column }
                            ]
                        );
                    }
                }
                break;
            case ZBlock:
                if (blockPositions[0].row === blockPositions[1].row) {
                    const piece = blockPositions[2];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 1, column: piece.column + 1 },
                            { row: piece.row - 2, column: piece.column + 1 }
                        ]
                    );
                } else {
                    const piece = blockPositions[3];
                    if (piece.column > 0) {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column - 1 }
                            ]
                        );
                    } else {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row - 1, column: piece.column + 1 },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column + 2 }
                            ]
                        );
                    }
                }
                break;
            case LBlock:
                if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[2].column && blockPositions[3].column === (blockPositions[0].column + 1)) {
                    const piece = blockPositions[2];
                    if (piece.column < 8) {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row - 1, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column + 2 }
                            ]
                        );
                    } else {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column + 1 }
                            ]
                        );
                    }
                } else if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[3];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row - 1, column: piece.column + 1 },
                            { row: piece.row - 2, column: piece.column + 1 },
                            { row: piece.row - 2, column: piece.column }
                        ]
                    );
                } else if (blockPositions[1].column === blockPositions[2].column && blockPositions[1].column === blockPositions[3].column && blockPositions[1].column === (blockPositions[0].column + 1)) {
                    const piece = blockPositions[3];
                    if (piece.column > 1) {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column - 2 }
                            ]
                        );
                    } else {
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column + 1 }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[1].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[2];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 2, column: piece.column }
                        ]
                    );
                }
                break;
            case JBlock:
                if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[3].column && blockPositions[0].column === (blockPositions[2].column + 1)) {
                    if (blockPositions[0].column < 9) {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column + 2 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column - 1 }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[1].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[1];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row - 2, column: piece.column },
                            { row: piece.row - 2, column: piece.column + 1 }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[2].column && blockPositions[0].column === blockPositions[3].column && blockPositions[1].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[0].column < 8) {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row + 1, column: piece.column - 1 },
                                { row: piece.row + 2, column: piece.column + 1 },
                                { row: piece.row + 1, column: piece.column + 1 },
                                { row: piece.row + 1, column: piece.column }
                            ]
                        );
                    } else {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row + 1, column: piece.column - 1 },
                                { row: piece.row + 1, column: piece.column },
                                { row: piece.row + 2, column: piece.column },
                                { row: piece.row + 1, column: piece.column - 2 }
                            ]
                        );
                    }
                } else if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[3];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row - 1, column: piece.column - 1 },
                            { row: piece.row, column: piece.column - 2 },
                            { row: piece.row, column: piece.column - 1 },
                            { row: piece.row - 2, column: piece.column - 1 }
                        ]
                    );
                }
                break;
            case TBlock:
                if (blockPositions[0].row === blockPositions[1].row && blockPositions[0].row === blockPositions[2].row && blockPositions[3].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[1];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row, column: piece.column - 1 },
                            { row: piece.row + 1, column: piece.column },
                            { row: piece.row - 1, column: piece.column }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[2].column && blockPositions[0].column === blockPositions[3].column && blockPositions[0].column === (blockPositions[1].column + 1)) {
                    if (blockPositions[0].column < 9) {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row - 1, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row - 1, column: piece.column }
                            ]
                        );
                    }
                } else if (blockPositions[1].row === blockPositions[2].row && blockPositions[1].row === blockPositions[3].row && blockPositions[1].row === (blockPositions[0].row + 1)) {
                    const piece = blockPositions[2];
                    this.attemptMove(
                        blockPositions,
                        [
                            { row: piece.row, column: piece.column },
                            { row: piece.row - 1, column: piece.column },
                            { row: piece.row, column: piece.column + 1 },
                            { row: piece.row + 1, column: piece.column }
                        ]
                    );
                } else if (blockPositions[0].column === blockPositions[1].column && blockPositions[0].column === blockPositions[3].column && blockPositions[2].column === (blockPositions[0].column + 1)) {
                    if (blockPositions[0].column > 0) {
                        const piece = blockPositions[1];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row + 1, column: piece.column },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row, column: piece.column - 1 }
                            ]
                        );
                    } else {
                        const piece = blockPositions[2];
                        this.attemptMove(
                            blockPositions,
                            [
                                { row: piece.row, column: piece.column },
                                { row: piece.row, column: piece.column - 1 },
                                { row: piece.row, column: piece.column + 1 },
                                { row: piece.row + 1, column: piece.column }
                            ]
                        );
                    }
                }
                break;
            default:
                console.log(`Invalid block ${this.block.constructor.name}`);
                break;
        }
    }

    moveBlockLeft() {
        if (this.isGameOverFlag === true) {
            return;
        }
        const blockPositions = this.findGridItemsByValue(this.count);
        const moves = [];
        for (let i = 0; i < blockPositions.length; i++) {
            const pos = blockPositions[i];
            moves.push({
                row: pos.row,
                column: pos.column - 1
            });
        }
        this.attemptMove(blockPositions, moves);
    }

    moveBlockRight() {
        if (this.isGameOverFlag === true) {
            return;
        }
        const blockPositions = this.findGridItemsByValue(this.count);
        const moves = [];
        for (let i = 0; i < blockPositions.length; i++) {
            const pos = blockPositions[i];
            moves.push({
                row: pos.row,
                column: pos.column + 1
            });
        }
        this.attemptMove(blockPositions, moves);
    }

    moveBlockDown() {
        const self = app;
        if (self.isGameOver === true) {
            return;
        }
        self.clearTimer();
        self.interval = setTimeout(self.moveBlockDown, self.Constants.default.timeout);
        const blockPositions = self.findGridItemsByValue(self.count);
        const moves = [];
        let atBottom = false;
        for (let i = 0; i < blockPositions.length; i++) {
            const pos = blockPositions[i];
            const nextRow = pos.row + 1;
            moves.push({
                row: nextRow,
                column: pos.column
            });
            if (nextRow === self.Constants.default.rows) {
                atBottom = true;
            }
        }
        if (atBottom === false) {
            if (self.attemptMove(blockPositions, moves) === false) {
                self.processTurn();
            }
        } else {
            self.processTurn();
        }
    }

    processTurn() {
        let rowsWithLines = [];
        for (let i = 0; i < this.Constants.default.rows; i++) {
            let count = 0;
            for (let j = 0; j < this.Constants.default.columns; j++) {
                if (this.grid[i][j] !== this.Constants.gridValues.empty) {
                    ++count;
                }
            }
            if (count === this.Constants.default.columns) {
                rowsWithLines.push(i);
            }
        }
        for (let i = 0; i < rowsWithLines.length; i++) {
            const row = rowsWithLines[i];
            this.grid.splice(row, 1);
            this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
        }
        if (rowsWithLines.length > 0) {
            this.drawGrid();
            const scoreElement = document.querySelector("#score");
            let score = parseInt(scoreElement.innerText);
            score = score + ((rowsWithLines.length * 10) * rowsWithLines.length);
            scoreElement.innerText = (score + "").padStart(4, "0");
            if (this.Constants.default.timeout > 100) {
                --this.Constants.default.timeout;
            }
        }
        if (this.isGameOver() === true) {
            this.isGameOverFlag = true;
            this.clearTimer();
            const header = document.querySelector(`.${this.Constants.layout.header}`);
            if (header) {
                header.classList.remove(this.Constants.layout.header);
                header.classList.add(this.Constants.layout.headerGameOver);
            }
        } else {
            this.setNewBlock();
        }
    }

    clearTimer() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    printGrid() {
        let output = "";
        for (let i = 0; i < this.grid.length; i++) {
            const row = this.grid[i];
            output += `${row.join("  ")}\n`;
        }
        console.log(output.trim());
    }

    static generateCellName(row, column) {
        return `cellR${row}C${column}`;
    }

    destroy() {
        this.clearTimer();
    }
}

let app = null;
window.onload = function () {
    const container = document.querySelector(".container");
    app = new ArchiesBlockGame(container);
}

window.onbeforeunload = function () {
    if (app) {
        app.destroy();
    }
}