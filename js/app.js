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
        this.blocks = new RandomItemSelector([
            new SquareBlock(this.Constants.blocks.colors),
            new LineBlock(this.Constants.blocks.colors),
            new SBlock(this.Constants.blocks.colors),
            new ZBlock(this.Constants.blocks.colors),
            new LBlock(this.Constants.blocks.colors),
            new JBlock(this.Constants.blocks.colors),
            new TBlock(this.Constants.blocks.colors)
        ], true);
        this.buildHTML();
        this.reset();
    }

    reset() {
        this.clearTimer();
        this.count = 0;
        this.score = 0;
        this.buildStartingGrid();
        this.printGrid();
        this.setNewBlock();
        this.printGrid();
        this.drawGrid();
        // this.startGame();
    }

    setNewBlock() {
        this.block = this.blocks.getRandomItem();
        const placement = this.block.getPlacement(++this.count);
        this.grid[10] = placement[0];
        this.grid[11] = placement[1];
        this.grid[12] = placement[2];
        this.grid[13] = placement[3];
    }

    startGame() {
        this.interval = setInterval(() => {
            // find head
            const headLocation = this.findGridItemByValue(this.Constants.gridValues.head);
            const newHeadLocation = this.calculateNewPosition(headLocation.row, headLocation.column);
            const eggLocation = this.findGridItemByValue(this.Constants.gridValues.egg);
            const bodyLocations = this.getBodyLocations();

            if (eggLocation && newHeadLocation.row === eggLocation.row && newHeadLocation.column === eggLocation.column) {
                // handle got egg
                this.score++;
                for (let i = 0; i < bodyLocations.length; i++) {
                    const bodyLocation = bodyLocations[i];
                    this.grid[bodyLocation.row][bodyLocation.column]++;
                }
                this.grid[newHeadLocation.row][newHeadLocation.column] = this.Constants.gridValues.head;
                if (this.isGameWinner() === true) {
                    // handle win
                    this.clearTimer();
                    setTimeout(() => {
                        this.showPopup(this.popupWin, this.score);
                    }, this.Constants.default.popupTimeout);
                    this.winSounds.play();
                } else {
                    this.placeRandomEgg();
                    this.eggSounds.play();
                }
            } else {
                // handle movement
                for (let i = 0; i < bodyLocations.length; i++) {
                    const bodyLocation = bodyLocations[i];
                    const isTail = i === bodyLocations.length - 1;
                    if (isTail === false) {
                        // handle body movement
                        this.grid[bodyLocation.row][bodyLocation.column]++;
                    } else {
                        // handle tail
                        this.grid[bodyLocation.row][bodyLocation.column] = this.Constants.gridValues.empty;
                    }
                }
                if (!Number.isInteger(this.grid[newHeadLocation.row][newHeadLocation.column]) || this.grid[newHeadLocation.row][newHeadLocation.column] > 0) {
                    // handle hitting border or self
                    this.clearTimer();
                    this.grid[newHeadLocation.row][newHeadLocation.column] = this.Constants.gridValues.collision;
                    setTimeout(() => {
                        this.showPopup(this.popupGameover, this.score);
                    }, this.Constants.default.popupTimeout);
                    this.gameOverSounds.play();
                } else {
                    // handle setting new head
                    this.grid[newHeadLocation.row][newHeadLocation.column] = this.Constants.gridValues.head;
                }
            }
            this.drawGrid();
        }, this.Constants.default.timeout)
    }

    calculateNewPosition(row, column) {
        const pos = {
            row: row,
            column: column
        };
        switch (this.direction) {
            case this.Constants.directions.up:
                pos.row = row - 1;
                pos.column = column;
                break;
            case this.Constants.directions.down:
                pos.row = row + 1;
                pos.column = column;
                break;
            case this.Constants.directions.left:
                pos.row = row;
                pos.column = column - 1;
                break;
            case this.Constants.directions.right:
                pos.row = row;
                pos.column = column + 1;
                break;
            default:
                console.log(`Invalid direction ${this.direction}`);
                break;
        }
        return pos;
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
        scoreSpan.innerText = "0";
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
        turnLeftButton.onclick = () => { console.log(this.Constants.labels.turnLeft); };
        const turnRightButton = document.createElement("button");
        turnRightButton.innerText = this.Constants.labels.turnRight;
        turnRightButton.onclick = () => { console.log(this.Constants.labels.turnRight); };
        const moveLeftButton = document.createElement("button");
        moveLeftButton.innerText = this.Constants.labels.moveLeft;
        moveLeftButton.onclick = () => { app.moveBlockLeft(); };
        const moveRightButton = document.createElement("button");
        moveRightButton.innerText = this.Constants.labels.moveRight;
        moveRightButton.onclick = () => { app.moveBlockRight(); };
        const downButton = document.createElement("button");
        downButton.innerText = this.Constants.labels.moveDown;
        downButton.onclick = () => { console.log(this.Constants.labels.moveDown); };
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

        // TODO: wire this up
        window.onkeydown = (event) => {
            switch (event.code) {
                case "ArrowUp":
                    console.log(event.code);
                    break;
                case "ArrowDown":
                    console.log(event.code);
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

    moveBlockLeft() {
        const blockPositions = this.findGridItemsByValue(this.count);
        let canMove = true;
        for (let i = 0; i < blockPositions.length; i++) {
            const pos = blockPositions[i];
            if (pos.column - 1 === -1) {
                canMove = false;
                break;
            }
        }
        if (canMove === true) {
            for (let i = 0; i < blockPositions.length; i++) {
                const pos = blockPositions[i];
                this.grid[pos.row][pos.column] = this.Constants.gridValues.empty;
            }
            for (let i = 0; i < blockPositions.length; i++) {
                const pos = blockPositions[i];
                this.grid[pos.row][pos.column - 1] = this.count;
            }
            this.drawGrid();
        }
    }

    moveBlockRight() {
        const blockPositions = this.findGridItemsByValue(this.count);
        let canMove = true;
        for (let i = 0; i < blockPositions.length; i++) {
            const pos = blockPositions[i];
            if (pos.column + 1 === this.Constants.default.columns) {
                canMove = false;
                break;
            }
        }
        if (canMove === true) {
            for (let i = 0; i < blockPositions.length; i++) {
                const pos = blockPositions[i];
                this.grid[pos.row][pos.column] = this.Constants.gridValues.empty;
            }
            for (let i = 0; i < blockPositions.length; i++) {
                const pos = blockPositions[i];
                this.grid[pos.row][pos.column + 1] = this.count;
            }
            this.drawGrid();
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