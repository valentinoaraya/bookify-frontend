import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { Dayjs } from "dayjs"
import {
    getCompanyHistory,
    type HistoryQuery,
} from "@/shared/api/appointments"
import type { Appointment } from "@/types"

export type HistoryStatistics = {
    totalAppointments: number
    mostPopularService: string
    totalIncome: number
    finishedAppointmentsPercentage: number
}

const emptyStats: HistoryStatistics = {
    totalAppointments: 0,
    mostPopularService: "N/A",
    totalIncome: 0,
    finishedAppointmentsPercentage: 0,
}

type HistoryPage = {
    appointments: Appointment[]
    pendingAppointments: Appointment[]
    hasMore: boolean
    stats: HistoryStatistics
}

async function fetchHistoryPage(
    companyId: string,
    page: number,
    filters: Omit<HistoryQuery, "page" | "limit">
): Promise<HistoryPage> {
    const response = await getCompanyHistory(companyId, {
        page,
        limit: 10,
        ...filters,
    })

    if (response.code === "SESSION_EXPIRED") {
        window.location.href = "/login/company"
        throw new Error("SESSION_EXPIRED")
    }

    if (response.error || !response.data) {
        throw new Error(response.error || "Error al cargar historial")
    }

    const payload = response.data as {
        data?: Appointment[]
        pendingAppointments?: Appointment[]
        hasMore?: boolean
        stats?: HistoryStatistics
    }

    return {
        appointments: payload.data || [],
        pendingAppointments: payload.pendingAppointments ?? [],
        hasMore: Boolean(payload.hasMore),
        stats: payload.stats || emptyStats,
    }
}

export function useCompanyHistory(companyId: string) {
    const [searchTerm, setSearchTerm] = useState("")
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
    const [selectedService, setSelectedService] = useState("all")
    const [dateRange, setDateRange] = useState<
        [Dayjs | null, Dayjs | null] | null
    >(null)
    const [isFilterPendingAppointments, setIsFilterPendingAppointments] =
        useState(false)
    const [localAppointments, setLocalAppointments] = useState<Appointment[]>(
        []
    )
    const [hasLocalAppointments, setHasLocalAppointments] = useState(false)
    const [localPending, setLocalPending] = useState<Appointment[]>([])
    const [hasLocalPending, setHasLocalPending] = useState(false)
    const [localStats, setLocalStats] = useState<HistoryStatistics | null>(null)

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 400)
        return () => clearTimeout(id)
    }, [searchTerm])

    const filters = useMemo(
        () => ({
            ...(debouncedSearchTerm ? { q: debouncedSearchTerm } : {}),
            ...(selectedService !== "all" ? { serviceId: selectedService } : {}),
            ...(dateRange?.[0]
                ? { from: dateRange[0].format("YYYY-MM-DD") }
                : {}),
            ...(dateRange?.[1] ? { to: dateRange[1].format("YYYY-MM-DD") } : {}),
        }),
        [debouncedSearchTerm, selectedService, dateRange]
    )

    const query = useInfiniteQuery({
        queryKey: ["company-history", companyId, filters],
        queryFn: ({ pageParam }) =>
            fetchHistoryPage(companyId, pageParam, filters),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _pages, lastPageParam) =>
            lastPage.hasMore ? lastPageParam + 1 : undefined,
    })

    useEffect(() => {
        setIsFilterPendingAppointments(false)
        setHasLocalAppointments(false)
        setHasLocalPending(false)
        setLocalStats(null)
        setLocalAppointments([])
        setLocalPending([])
    }, [companyId, filters])

    const queryAppointments =
        query.data?.pages.flatMap((p) => p.appointments) ?? []
    const backendAppointments = hasLocalAppointments
        ? localAppointments
        : queryAppointments
    const pendingAppointments = hasLocalPending
        ? localPending
        : (query.data?.pages[0]?.pendingAppointments ?? [])
    const lastPage = query.data?.pages[query.data.pages.length - 1]
    const statistics = localStats ?? lastPage?.stats ?? emptyStats

    const filteredAppointments = isFilterPendingAppointments
        ? pendingAppointments
        : backendAppointments

    const setFilteredAppointments: Dispatch<SetStateAction<Appointment[]>> = (
        value
    ) => {
        setHasLocalAppointments(true)
        setLocalAppointments(value)
    }

    const setPendingAppointments: Dispatch<SetStateAction<Appointment[]>> = (
        value
    ) => {
        setHasLocalPending(true)
        setLocalPending(value)
    }

    const setStatistics: Dispatch<SetStateAction<HistoryStatistics>> = (
        value
    ) => {
        setLocalStats((prev) => {
            const current = prev ?? emptyStats
            return typeof value === "function" ? value(current) : value
        })
    }

    const resetFilters = () => {
        setSearchTerm("")
        setSelectedService("all")
        setDateRange(null)
        setIsFilterPendingAppointments(false)
    }

    return {
        searchTerm,
        setSearchTerm,
        selectedService,
        setSelectedService,
        dateRange,
        setDateRange,
        isFilterPendingAppointments,
        setIsFilterPendingAppointments,
        loading: query.isFetching,
        hasMore: Boolean(query.hasNextPage),
        handleLoadMore: () => query.fetchNextPage(),
        backendAppointments,
        pendingAppointments,
        filteredAppointments,
        statistics,
        setStatistics,
        setFilteredAppointments,
        setCopyOfFilteredAppointments: setFilteredAppointments,
        setPendingAppointments,
        resetFilters,
        refetch: query.refetch,
    }
}
