

export default class CommonTools {

    public static getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * format 00:00:00
     * @param timestamp 
     * @returns 
     */
    public static formatTimestamp(timestamp: number): string {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).length < 2 ? '0' + date.getHours() : String(date.getHours());
        const minutes = String(date.getMinutes()).length < 2 ? '0' + date.getMinutes() : String(date.getMinutes());
        const seconds = String(date.getSeconds()).length < 2 ? '0' + date.getSeconds() : String(date.getSeconds());
        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * format 00:00:00
     * @param seconds 
     * @returns 
     */
    public static formatSeconds(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
    
        const formattedHours = (hours < 10 ? '0' : '') + hours;
        const formattedMinutes = (minutes < 10 ? '0' : '') + minutes;
        const formattedSeconds = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
    
        return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
    }
}

