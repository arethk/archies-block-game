class RandomItemSelector {
    constructor(items) {
        if (Array.isArray(items) === false || items.length === 0) {
            throw new Error("Items must be an array with at least 1 item");
        }
        this.items = items;
    }

    getRandomItem() {
        this.shuffle();
        return this.items[0];
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