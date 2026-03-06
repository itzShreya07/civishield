import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getIssues, getSecurityAlerts, getAuditLogs, getHealth } from '../services/api'
import {
    ShieldIcon, AlertIcon, IssuesIcon, AuditIcon,
    ZoneIcon, ServerIcon, RefreshIcon, ClockIcon
} from '../components/Icons'

const STAT_COLORS = {
    Citizen: 'from-blue-600/20 to-blue-700/10 border-blue-500/20',
    FieldOfficer: 'from-emerald-600/20 to-emerald-700/10 border-emerald-500/20',
    DepartmentAdmin: 'from-amber-600/20 to-amber-700/10 border-amber-500/20',
    SuperAdmin: 'from-shield-600/20 to-shield-700/10 border-shield-500/20',
}

export default function DashboardPage() {
    const { user } = useAuth()
    const [issues, setIssues] = useState([])
    const [alerts, setAlerts] = useState([])
    const [logs, setLogs] = useState([])
    const [health, setHealth] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchData = async () => {
        setLoading(true)
        try {
            const [issuesRes, healthRes] = await Promise.all([
                getIssues(),
                getHealth(),
            ])
            setIssues(issuesRes.data.data)
            setHealth(healthRes.data)

            if (['DepartmentAdmin', 'SuperAdmin'].includes(user.role)) {
                const logsRes = await getAuditLogs({ limit: 5 })
                setLogs(logsRes.data.data)
            }

            if (user.role === 'SuperAdmin') {
                const alertsRes = await getSecurityAlerts()
                setAlerts(alertsRes.data.data.slice(0, 3))
            }
        } catch (err) {
            console.error('Dashboard load error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchData() }, [])

    const openIssues = issues.filter(i => i.status === 'open').length
    const inProgress = issues.filter(i => i.status === 'in_progress').length
    const resolved = issues.filter(i => i.status === 'resolved').length
    const activeAlerts = alerts.filter(a => !a.acknowledged).length

    const statusColor = (s) => ({
        open: 'status-open',
        in_progress: 'status-in_progress',
        resolved: 'status-resolved',
        closed: 'status-closed',
    }[s] || 'status-open')

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="section-header">
                        Welcome back, {user?.name?.split(' ')[0]}
                    </h1>
                    <p className="section-sub">
                        {user?.role === 'FieldOfficer'
                            ? `Monitoring zone: ${user.zone}`
                            : 'CiviShield Security Gateway — Operational'}
                    </p>
                </div>
                <button onClick={fetchData} className="btn-secondary">
                    <RefreshIcon />
                    Refresh
                </button>
            </div>

            {/* Gateway Status */}
            {health && (
                <div className="card flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-900/30 border border-emerald-500/20 flex items-center justify-center">
                        <ServerIcon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-white">{health.service}</span>
                            <span className="badge bg-emerald-900/40 text-emerald-400 border-emerald-500/20 text-[10px]">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-slow" />
                                OPERATIONAL
                            </span>
                            <span className="text-xs text-slate-500">v{health.version}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Uptime: {Math.floor(health.uptime)}s &nbsp;|&nbsp; Last check: {new Date(health.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Open Issues" value={openIssues}
                    icon={<IssuesIcon className="w-5 h-5 text-blue-400" />}
                    color="bg-blue-900/20 border-blue-500/20"
                />
                <StatCard
                    label="In Progress" value={inProgress}
                    icon={<ClockIcon className="w-5 h-5 text-amber-400" />}
                    color="bg-amber-900/20 border-amber-500/20"
                />
                <StatCard
                    label="Resolved" value={resolved}
                    icon={<ShieldIcon className="w-5 h-5 text-emerald-400" />}
                    color="bg-emerald-900/20 border-emerald-500/20"
                />
                <StatCard
                    label="Security Alerts" value={user.role === 'SuperAdmin' ? activeAlerts : '—'}
                    icon={<AlertIcon className="w-5 h-5 text-red-400" />}
                    color="bg-red-900/20 border-red-500/20"
                />
            </div>

            {/* Role Permissions Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="card">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldIcon className="w-4 h-4 text-shield-400" />
                        <span className="text-sm font-semibold text-white">Your Permissions</span>
                    </div>
                    <PermissionsBlock role={user?.role} zone={user?.zone} />
                </div>

                {user.role === 'SuperAdmin' && alerts.length > 0 && (
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <AlertIcon className="w-4 h-4 text-red-400" />
                                <span className="text-sm font-semibold text-white">Recent Alerts</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {alerts.map((alert) => (
                                <div key={alert.id} className={`rounded-lg px-3 py-2.5 ${alert.severity === 'high' ? 'alert-high' : 'alert-medium'}`}>
                                    <div className="text-xs font-semibold text-slate-200">{alert.type.replace(/_/g, ' ')}</div>
                                    <div className="text-xs text-slate-400 mt-0.5 line-clamp-2">{alert.message}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {(['DepartmentAdmin', 'SuperAdmin'].includes(user.role)) && logs.length > 0 && (
                    <div className="card">
                        <div className="flex items-center gap-2 mb-4">
                            <AuditIcon className="w-4 h-4 text-shield-400" />
                            <span className="text-sm font-semibold text-white">Recent Audit Logs</span>
                        </div>
                        <div className="space-y-1.5">
                            {logs.map((log) => (
                                <div key={log.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/3 hover:bg-white/5 transition">
                                    <div>
                                        <span className="text-xs font-medium text-slate-300">{log.method} {log.endpoint}</span>
                                        <span className="ml-2 text-xs text-slate-500">by {log.role}</span>
                                    </div>
                                    <span className={`badge text-[10px] ${log.status === 'success' ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20' : 'bg-red-900/30 text-red-400 border-red-500/20'}`}>
                                        {log.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className={`card border ${color} rounded-xl`}>
            <div className="flex items-start justify-between">
                <div>
                    <div className="text-3xl font-bold text-white">{value}</div>
                    <div className="text-xs text-slate-500 mt-1 font-medium">{label}</div>
                </div>
                <div className="p-2 rounded-lg bg-white/5">{icon}</div>
            </div>
        </div>
    )
}

function PermissionsBlock({ role, zone }) {
    const permsMap = {
        Citizen: ['view_own_issues', 'create_issue'],
        FieldOfficer: ['view_zone_issues', 'update_zone_issues'],
        DepartmentAdmin: ['assign_officers', 'view_all_issues', 'view_audit_logs', 'view_users'],
        SuperAdmin: ['full_access — all permissions granted'],
    }
    const perms = permsMap[role] || []
    return (
        <div>
            {zone && (
                <div className="flex items-center gap-2 mb-3 text-xs text-emerald-400">
                    <ZoneIcon className="w-3.5 h-3.5" />
                    Restricted to zone: <strong>{zone}</strong>
                </div>
            )}
            <ul className="space-y-1.5">
                {perms.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-xs text-slate-400">
                        <span className="w-1.5 h-1.5 bg-shield-400 rounded-full flex-shrink-0" />
                        {p}
                    </li>
                ))}
            </ul>
        </div>
    )
}
