import dayjs, { Dayjs, ConfigType } from "dayjs"
import "dayjs/locale/es"
import isBetween from "dayjs/plugin/isBetween"
import localizedFormat from "dayjs/plugin/localizedFormat"
import customParseFormat from "dayjs/plugin/customParseFormat"
import isSameOrBefore from "dayjs/plugin/isSameOrBefore"
import isSameOrAfter from "dayjs/plugin/isSameOrAfter"

dayjs.extend(isBetween)
dayjs.extend(localizedFormat)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrBefore)
dayjs.extend(isSameOrAfter)
dayjs.locale("es")

export { dayjs }
export type { Dayjs }

export const parseDate = (value?: ConfigType, format?: string): Dayjs =>
    format ? dayjs(value, format) : dayjs(value)

export const isSameDay = (a: ConfigType, b: ConfigType = dayjs()): boolean =>
    dayjs(a).isSame(dayjs(b), "day")

export const isSameWeek = (a: ConfigType, b: ConfigType = dayjs()): boolean =>
    dayjs(a).isSame(dayjs(b), "week")

export const isSameMonth = (a: ConfigType, b: ConfigType = dayjs()): boolean =>
    dayjs(a).isSame(dayjs(b), "month")

export const sortByDateAsc = <T>(items: T[], getDate: (item: T) => ConfigType): T[] =>
    [...items].sort(
        (a, b) => dayjs(getDate(a)).valueOf() - dayjs(getDate(b)).valueOf()
    )

export type DayAgendaLabel = {
    primary: string
    secondary: string
}

export const formatDayAgendaLabel = (value: ConfigType): DayAgendaLabel => {
    const d = dayjs(value)
    const datePart = d.format("D [de] MMMM")

    if (d.isSame(dayjs(), "day")) {
        return { primary: "Hoy", secondary: datePart }
    }
    if (d.isSame(dayjs().add(1, "day"), "day")) {
        return { primary: "Mañana", secondary: datePart }
    }

    const weekday = d.format("dddd")
    return {
        primary: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        secondary: datePart,
    }
}

export const groupByDay = <T>(
    items: T[],
    getDate: (item: T) => ConfigType
): { key: string; label: DayAgendaLabel; items: T[] }[] => {
    const map = new Map<string, T[]>()

    for (const item of items) {
        const key = dayjs(getDate(item)).format("YYYY-MM-DD")
        const bucket = map.get(key)
        if (bucket) bucket.push(item)
        else map.set(key, [item])
    }

    return Array.from(map.entries()).map(([key, groupItems]) => ({
        key,
        label: formatDayAgendaLabel(key),
        items: groupItems,
    }))
}
