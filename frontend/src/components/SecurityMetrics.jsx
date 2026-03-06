import { useState, useEffect } from 'react'
import { getAuditLogs } from '../services/api'
import { ShieldIcon, AlertIcon, LockIcon, ClockIcon, RefreshIcon } from './Icons'

const METRIC_DEFS = [
    {
        key: 'failedLogins',
        label: 'Failed Logins',
        icon: LockIcon,
        color: 'text-red-400',
        bg: 'bg-red-900/20 border-red-500/20',
        description: 'Authentication failures',
    },
    {
        key: 'blockedRequests',
        label: 'Blocked Requests',
        icon: ShieldIcon,
        color: 'text-amber-400',
        bg: 'bg-amber-900/20 border-amber-500/20',
        description: 'Access denied responses',
    },
    {
        key: 'rateLimitViolations',
        label: 'Rate Limit Hits',
        icon: ClockIcon,
        color: 'text-orange-400',
        bg: 'bg-orange-900/20 border-orange-500/20',
        description: '429 threshold exceeded',
    },
]

function deriveMetricsFromLogs(logs) {
    const failedLogins = logs.filter(
        (l) => l.status === 'denied' && l.endpoint?.includes('/auth/login')
    ).length

    const blockedRequests = logs.filter(
        (l) => l.status === 'denied' && !l.endpoint?.includes('/auth/login')
    ).length

    const rateLimitViolations = logs.filter(
        (l) =>
            l.reason?.toLowerCase().includes('rate') ||
            l.reason?.toLowerCase().includes('429') ||
            l.reason?.toLowerCase().includes('limit')
    ).length

    return { failedLogins, blockedRequests, rateLimitViolations }
}

export default function SecurityMetrics() {
    const [metrics, setMetrics] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchMetrics = async () => {
        setLoading(true)
        try {
            // Derive metrics from audit logs (no extra backend permission needed)
            const res = await getAuditLogs({ limit: 500 })
            const derived = deriveMetricsFromLogs(res.data.data)
            setMetrics(derived)
        } catch (err) {
            // Fallback to zero values if logs not accessible for this role
            setMetrics({ failedLogins: 0, blockedRequests: 0, rateLimitViolations: 0 })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMetrics() }, [])

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-shield-600/20 border border-shield-500/30 flex items-center justify-center">
                        <AlertIcon className="w-3.5 h-3.5 text-shield-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Security Overview</span>
                </div>
                <button
                    onClick={fetchMetrics}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition"
                    title="Refresh metrics"
                >
                    <RefreshIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            {loading ? (
                <div className="grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="rounded-lg bg-white/3 border border-white/5 p-3 animate-pulse">
                            <div className="h-3 bg-white/10 rounded mb-2 w-3/4" />
                            <div className="h-6 bg-white/10 rounded w-1/3" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-3">
                    {METRIC_DEFS.map(({ key, label, icon: Icon, color, bg, description }) => (
                        <div
                            key={key}
                            className={`rounded-xl border ${bg} px-3 py-3 flex flex-col gap-1.5`}
                        >
                            <div className="flex items-center gap-1.5">
                                <Icon className={`w-3.5 h-3.5 ${color}`} />
                                <span className="text-[11px] font-medium text-slate-400">{label}</span>
                            </div>
                            <div className={`text-2xl font-bold ${color}`}>
                                {metrics?.[key] ?? 0}
                            </div>
                            <div className="text-[10px] text-slate-600 leading-tight">{description}</div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow" />
                <span className="text-[10px] text-slate-500">Live metrics derived from audit log</span>
            </div>
        </div>
    )
}
