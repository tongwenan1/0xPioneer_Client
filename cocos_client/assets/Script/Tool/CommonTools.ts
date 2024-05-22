export default class CommonTools {
    public static getOneDecimalNum(num: number): number {
        return Math.floor(num * 10) / 10;
    }

    public static getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    public static getRandomNumberWithOneDecimal(min: number, max: number): number {
        const randomNumber = Math.floor(Math.random() * (max * 10 - min * 10 + 1) + min * 10) / 10;
        return randomNumber;
    }
    public static getRandomItem<T>(items: T[]): T | undefined {
        if (items.length === 0) return undefined;
        const randomIndex = Math.floor(Math.random() * items.length);
        return items[randomIndex];
    }
    public static getRandomItemByWeights<T>(elements: T[], weights: number[]): T {
        if (elements.length !== weights.length) {
            return null;
        }

        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < weights.length; i++) {
            if (random < weights[i]) {
                return elements[i];
            }
            random -= weights[i];
        }
        return null;
    }

    //------------------------------------------- time
    public static getNextDayAMTimestamp(hour: number): number {
        // current date
        const now = new Date();

        // next day hour date
        const nextDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1,
            hour, //
            0, //
            0, //
            0 //
        );
        return nextDay.getTime();
    }
    public static getDayAMTimestamp(hour: number): number {
        // current date
        const now = new Date();

        // next day hour date
        const nextDay = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            hour, //
            0, //
            0, //
            0 //
        );
        return nextDay.getTime();
    }

    public static getDayOfWeek(): number {
        const today = new Date().getDay();
        return today === 0 ? 7 : today;
    }

    /**
     * @param timestamp
     * @param format HH:MM:SS   HHH MMM
     * @returns
     */
    public static formatTimestamp(timestamp: number, format: string = "HH:MM:SS"): string {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).length < 2 ? "0" + date.getHours() : String(date.getHours());
        const minutes = String(date.getMinutes()).length < 2 ? "0" + date.getMinutes() : String(date.getMinutes());
        const seconds = String(date.getSeconds()).length < 2 ? "0" + date.getSeconds() : String(date.getSeconds());
        return format.replace(/HH/g, hours).replace(/MM/g, minutes).replace(/SS/g, seconds).replace(/H/g, hours).replace(/M/g, minutes).replace(/S/g, seconds);
    }

    /**
     * @param seconds
     * @param format HH:MM:SS（00:00:00）   HHh MMm(00h 00m)
     * @returns
     */
    public static formatSeconds(seconds: number, format: string = "HH:MM:SS"): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedHours = (hours < 10 ? "0" : "") + hours;
        const formattedMinutes = (minutes < 10 ? "0" : "") + minutes;
        const formattedSeconds = (remainingSeconds < 10 ? "0" : "") + remainingSeconds;

        return format
            .replace(/HH/g, formattedHours)
            .replace(/MM/g, formattedMinutes)
            .replace(/SS/g, formattedSeconds)
            .replace(/H/g, formattedHours)
            .replace(/M/g, formattedMinutes)
            .replace(/S/g, formattedSeconds);
    }

    public static weightedRandomValue<T>(values: T[], weights: number[]): T {
        const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
        const random = Math.random() * totalWeight;

        let cumulativeWeight = 0;
        for (let i = 0; i < values.length; i++) {
            cumulativeWeight += weights[i];
            if (random < cumulativeWeight) {
                return values[i];
            }
        }

        return values[values.length - 1];
    }

    /**
     * format: (12, 34)
     * @param p
     */
    public static formatMapPosition(p: { x: number; y: number }): string {
        return `(${p.x}, ${p.y})`;
    }

    /**
     * format: 2024/1/17 01:18:30
     */
    public static formatDateTime(timestamp: number): string {
        const date = new Date(timestamp);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();

        return `${year}/${month}/${day} ${this.formatTimestamp(timestamp)}`;
    }

    public static mapsAreEqual<K, V>(map1: Map<K, V>, map2: Map<K, V>): boolean {
        if (map1.size !== map2.size) {
            return false;
        }
    
        // 遍历第一个 Map 的每个键值对
        for (let [key, value] of map1) {
            if (!map2.has(key)) {
                return false;
            }
    
            if (map2.get(key) !== value) {
                return false;
            }
        }
    
        return true;
    }

    public static generateUUID() {
        var uuid = "",
            i,
            random;
        for (i = 0; i < 16; i++) {
            random = (Math.random() * 16) | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += "-";
            }
            uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
        }
        return uuid.substring(0, 16);
    }
}
