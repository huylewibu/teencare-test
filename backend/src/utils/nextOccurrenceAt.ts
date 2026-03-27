export function dayOfWeekToNumber(day: string) {
    const map: Record<string, number> = {
        Sun: 0,
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
    };

    return map[day];
}

export function getStartTimeFromSlot(timeSlot: string) {
    return timeSlot.split("-")[0].trim();
}

export function getNextOccurrence(
    dayOfWeek: string,
    timeSlot: string,
    from = new Date()
) {
    const targetDay = dayOfWeekToNumber(dayOfWeek);
    const [hour, minute] = getStartTimeFromSlot(timeSlot).split(":").map(Number);

    const base = new Date(from);
    const result = new Date(base);

    const currentDay = result.getDay();
    let diff = targetDay - currentDay;

    if (diff < 0) {
        diff += 7;
    }

    result.setDate(result.getDate() + diff);
    result.setHours(hour, minute, 0, 0);

    if (result <= base) {
        result.setDate(result.getDate() + 7);
    }

    return result;
}