class TimeConvert {
    msToSecond(ms: number): number {
        return Math.floor(ms / 1000);
    }
    
    msToMinute(ms: number): number {
        return Math.floor(ms / 1000 / 60);
    }
    
    msToHour(ms: number): number {
        return Math.floor(ms / 1000 / 60 / 60);
    }
    
    msToDay(ms: number): number {
        return Math.floor(ms / 1000 / 60 / 60 / 24);
    }
    
    msToWeek(ms: number): number {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7);
    }
    
    msToMonth(ms: number): number {
        return Math.floor(ms / 1000  / 60 / 60 / 24 / 7 / 4);
    }
    
    msToYear(ms: number): number {
        return Math.floor(ms / 1000 / 60 / 60 / 24 / 7 / 4 / 12);
    }
}