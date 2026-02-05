class RandomItemSelector {
    constructor(items, allowRepeats) {
        if (Array.isArray(items) === false || items.length === 0) {
            throw new Error("Items must be an array with at least 1 item");
        }
        this.items = items;
        this.allowRepeats = allowRepeats === true;
        this.last = null;
    }

    getItems() {
        return this.items;
    }

    getRandomItem() {
        this.shuffle();
        const selection = this.items[0];
        if (this.allowRepeats === true) {
            return selection;
        } else {
            if (selection === this.last) {
                return this.getRandomItem();
            } else {
                this.last = selection;
                return selection;
            }
        }
    }

    shuffle() {
        let currentIndex = this.items.length;
        let randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [this.items[currentIndex], this.items[randomIndex]] = [this.items[randomIndex], this.items[currentIndex]];
        }
    }
}