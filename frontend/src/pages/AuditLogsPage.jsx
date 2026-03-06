import { useState, useEffect } from 'react'
import { getAuditLogs } from '../services/api'
import { AuditIcon, RefreshIcon, ClockIcon } from '../components/Icons'

export default function AuditLogsPage() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    const fetch = async () => {
        setLoading(true)
        try {
            const res = await getAuditLogs({ limit: 100 })
            setLogs(res.data.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetch() }, [])

    const filtered = filter === 'all' ? logs : logs.filter(l => l.status === filter)

    return (
        <div className="space-y-5 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="section-header">Audit Logs</h1>
                    <p className="section-sub">Every API request, access denial, and security event</p>
                </div>
                <button onClick={fetch} className="btn-secondary">
                    <RefreshIcon /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'success', 'denied'].map(f => (
                    <button key={f}
                        onClick={() => setFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${filter === f
                                ? 'bg-shield-600/30 text-shield-300 border-shield-500/40'
                                : 'bg-white/3 text-slate-400 border-white/5 hover:bg-white/6'
                            }`}>
                        {f === 'all' ? 'All' : f === 'success' ? 'Success' : 'Denied'}
                    </button>
                ))}
                <span className="ml-auto text-xs text-slate-500 flex items-center gap-1.5">
                    <ClockIcon className="w-3.5 h-3.5" />
                    {filtered.length} entries
                </span>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-500">
                    <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading logs...
                </div>
            ) : (
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/2">
                                    {['Timestamp', 'User ID', 'Role', 'Method', 'Endpoint', 'Status', 'Reason'].map(h => (
                                        <th key={h} className="text-left px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide text-[10px] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="text-center py-10 text-slate-500">
                                            <AuditIcon className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                                            No logs found
                                        </td>
                                    </tr>
                                ) : filtered.map((log) => (
                                    <tr key={log.id} className="border-b border-white/3 hover:bg-white/2 transition">
                                        <td className="px-4 py-3 text-slate-400 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleTimeString('en-IN', {
                                                hour: '2-digit', minute: '2-digit', second: '2-digit'
                                            })}
                                            <span className="block text-slate-600 text-[10px]">
                                                {new Date(log.timestamp).toLocaleDateString('en-IN')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 font-mono">{log.userId}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge text-[10px] ${log.role === 'SuperAdmin' ? 'badge-super' :
                                                    log.role === 'DepartmentAdmin' ? 'badge-admin' :
                                                        log.role === 'FieldOfficer' ? 'badge-officer' :
                                                            log.role === 'Citizen' ? 'badge-citizen' :
                                                                'badge-external'
                                                }`}>{log.role}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${log.method === 'GET' ? 'bg-blue-900/30 text-blue-300' :
                                                    log.method === 'POST' ? 'bg-green-900/30 text-green-300' :
                                                        log.method === 'PATCH' ? 'bg-amber-900/30 text-amber-300' :
                                                            'bg-slate-800 text-slate-400'
                                                }`}>{log.method}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 font-mono max-w-xs truncate">{log.endpoint}</td>
                                        <td className="px-4 py-3">
                                            <span className={`badge text-[10px] ${log.status === 'success'
                                                    ? 'bg-emerald-900/30 text-emerald-400 border-emerald-500/20'
                                                    : 'bg-red-900/30 text-red-400 border-red-500/20'
                                                }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500 max-w-xs truncate">{log.reason || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
