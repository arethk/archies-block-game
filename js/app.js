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
        this.Constants.default.rows = 20; // only 20 visible but 23 total rows in the game plus one horizontal border at the bottom
        this.Constants.default.columns = 12; // 10 playable area plus vertical borders
        this.Constants.default.timeout = 500;
        this.Constants.layout = {};
        this.Constants.layout.header = "header";
        this.Constants.layout.score = "score";
        this.Constants.layout.footer = "footer";
        this.Constants.layout.leftrightcontainer = "left-right-container";
        this.Constants.layout.flip = "flip";
        this.Constants.layout.hide = "hide";
        this.Constants.gridValues = {};
        this.Constants.gridValues.border = "B"; //TODO: change or delete
        this.Constants.gridValues.empty = 0;
        this.Constants.gridCssClass = {};
        this.Constants.gridCssClass.border = "border";
        this.Constants.gridCssClass.empty = "";
        this.Constants.directions = {}; // TODO: needed?
        this.Constants.directions.up = "up";
        this.Constants.directions.down = "down";
        this.Constants.directions.left = "left";
        this.Constants.directions.right = "right";
        this.Constants.buttons = {};
        this.Constants.buttons.up = "^";
        this.Constants.buttons.down = "^";
        this.Constants.buttons.left = "<";
        this.Constants.buttons.right = ">";


        // action
        this.interval = null;
        this.buildHTML();
        this.reset();
    }

    reset() {
        this.clearTimer();
        this.score = 0;
        this.direction = this.Constants.directions.up;
        this.nextDirection = this.direction; // to stop ui bug when changing direction in an invalid way caused by the timer delay
        this.buildStartingGrid();
        this.printGrid();
        // this.drawGrid();
        // this.startGame();
    }

    startGame() {
        this.interval = setInterval(() => {
            // handle direction change, stops weird timer bug
            if (
                (this.direction === this.Constants.directions.up && this.nextDirection !== this.Constants.directions.down) ||
                (this.direction === this.Constants.directions.down && this.nextDirection !== this.Constants.directions.up) ||
                (this.direction === this.Constants.directions.left && this.nextDirection !== this.Constants.directions.right) ||
                (this.direction === this.Constants.directions.right && this.nextDirection !== this.Constants.directions.left)
            ) {
                this.direction = this.nextDirection;
            }
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
            //this.Constants.gridCssClass.border,
            //this.Constants.gridCssClass.empty,
            this.Constants.gridCssClass.headUp,
            this.Constants.gridCssClass.headDown,
            this.Constants.gridCssClass.headLeft,
            this.Constants.gridCssClass.headRight,
            this.Constants.gridCssClass.tailUp,
            this.Constants.gridCssClass.tailDown,
            this.Constants.gridCssClass.tailLeft,
            this.Constants.gridCssClass.tailRight,
            this.Constants.gridCssClass.body,
            this.Constants.gridCssClass.egg,
            this.Constants.gridCssClass.collision
        ];
        for (let i = 0; i < this.grid.length; i++) {
            const row = this.grid[i];
            for (let j = 0; j < row.length; j++) {
                const item = row[j];
                const cell = document.querySelector(`.${ArtysSnakeGame.generateCellName(i, j)}`);
                gridCssClasses.forEach(c => {
                    cell.classList.remove(c);
                });
                switch (item) {
                    case this.Constants.gridValues.border:
                        cell.classList.add(this.Constants.gridCssClass.border);
                        break;
                    case this.Constants.gridValues.empty:
                        //cell.classList.add(this.Constants.gridCssClass.empty);
                        break;
                    case this.Constants.gridValues.head:
                        switch (this.direction) {
                            case this.Constants.directions.up:
                                cell.classList.add(this.Constants.gridCssClass.headUp);
                                break;
                            case this.Constants.directions.down:
                                cell.classList.add(this.Constants.gridCssClass.headDown);
                                break;
                            case this.Constants.directions.left:
                                cell.classList.add(this.Constants.gridCssClass.headLeft);
                                break;
                            case this.Constants.directions.right:
                                cell.classList.add(this.Constants.gridCssClass.headRight);
                                break;
                            default:
                                console.log(`Invalid direction ${this.direction}`);
                                break;
                        }
                        break;
                    case this.Constants.gridValues.egg:
                        cell.classList.add(this.Constants.gridCssClass.egg);
                        break;
                    case this.Constants.gridValues.collision:
                        cell.classList.add(this.Constants.gridCssClass.collision);
                        break;
                    default:
                        if (Number.isInteger(item)) {
                            const bodyLocations = this.getBodyLocations();
                            const beforeItem = bodyLocations[bodyLocations.length - 2];
                            const tail = bodyLocations[bodyLocations.length - 1];
                            if (item === tail.value) {
                                // handle tail
                                if (beforeItem.column === tail.column) {
                                    if (beforeItem.row < tail.row) {
                                        cell.classList.add(this.Constants.gridCssClass.tailDown);
                                    } else {
                                        cell.classList.add(this.Constants.gridCssClass.tailUp);
                                    }
                                } else {
                                    if (beforeItem.column < tail.column) {
                                        cell.classList.add(this.Constants.gridCssClass.tailRight);
                                    } else {
                                        cell.classList.add(this.Constants.gridCssClass.tailLeft);
                                    }
                                }
                            } else {
                                cell.classList.add(this.Constants.gridCssClass.body);
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
        for (let i = 0; i < this.Constants.default.rows + 2; i++) {
            const row = [];
            for (let j = 0; j < this.Constants.default.columns - 2; j++) {
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
        this.container.style.gridTemplateRows = `minmax(50px, 2fr) repeat(${this.Constants.default.rows}, minmax(10px, 1fr)) minmax(50px, 1fr) minmax(150px, 4fr)`;
        this.container.style.gridTemplateColumns = `repeat(${this.Constants.default.columns}, minmax(30px, 1fr))`;

        // create header area
        const headerDiv = document.createElement("div");
        headerDiv.classList.add(this.Constants.layout.header);
        headerDiv.style.gridArea = this.Constants.layout.header;
        this.container.appendChild(headerDiv);

        // create header grid area
        const headerGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns; i++) {
            headerGridNameList.push(this.Constants.layout.header);
        }
        this.container.style.gridTemplateAreas = `"${headerGridNameList.join(" ")}"`;

        // create game area
        for (let i = 0; i < this.Constants.default.rows; i++) {
            const gameGridNameList = [];
            let cellClass = null;
            let cellGridName = null;
            for (let j = 0; j < this.Constants.default.columns; j++) {
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
        this.container.appendChild(scoreDiv);

        // create score grid area
        const scoreGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns; i++) {
            scoreGridNameList.push(this.Constants.layout.score);
        }
        this.container.style.gridTemplateAreas += `"${scoreGridNameList.join(" ")}"`;

        // create footer area
        const footerDiv = document.createElement("div");
        footerDiv.classList.add(this.Constants.layout.footer);
        footerDiv.style.gridArea = this.Constants.layout.footer;

        // create control buttons
        const playPauseButton = document.createElement("button");
        playPauseButton.id = this.Constants.directions.up;
        playPauseButton.innerText = "►";
        playPauseButton.onclick = () => {
            // TODO: add play/pause functionality
            // TODO: use constants
            if (playPauseButton.innerText === "►") {
                playPauseButton.innerText = "| |";
            } else {
                playPauseButton.innerText = "►";
            }

        };
        const leftButton = document.createElement("button");
        leftButton.id = this.Constants.directions.left;
        leftButton.innerText = this.Constants.buttons.left;
        leftButton.onclick = () => { app.nextDirection = app.Constants.directions.left; };
        const rightButton = document.createElement("button");
        rightButton.id = this.Constants.directions.right;
        rightButton.innerText = this.Constants.buttons.right;
        rightButton.onclick = () => { app.nextDirection = app.Constants.directions.right; };
        const downButton = document.createElement("button");
        downButton.id = this.Constants.directions.down;
        downButton.classList.add(this.Constants.layout.flip);
        downButton.innerText = this.Constants.buttons.down;
        downButton.onclick = () => { app.nextDirection = app.Constants.directions.down; };
        const leftRightDiv = document.createElement("div");
        leftRightDiv.classList.add(this.Constants.layout.leftrightcontainer);
        leftRightDiv.appendChild(leftButton);
        leftRightDiv.appendChild(rightButton);
        footerDiv.appendChild(playPauseButton);
        footerDiv.appendChild(leftRightDiv);
        footerDiv.appendChild(downButton);
        this.container.appendChild(footerDiv);

        // create header grid area
        const footerGridNameList = [];
        for (let i = 0; i < this.Constants.default.columns; i++) {
            footerGridNameList.push(this.Constants.layout.footer);
        }
        this.container.style.gridTemplateAreas += `"${footerGridNameList.join(" ")}"`;

        window.onkeydown = (event) => {
            switch (event.code) {
                case "ArrowUp":
                    app.nextDirection = app.Constants.directions.up;
                    break;
                case "ArrowDown":
                    app.nextDirection = app.Constants.directions.down;
                    break;
                case "ArrowLeft":
                    app.nextDirection = app.Constants.directions.left;
                    break;
                case "ArrowRight":
                    app.nextDirection = app.Constants.directions.right;
                    break;
                default:
                    break;
            }
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