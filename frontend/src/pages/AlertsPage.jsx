import { useState, useEffect } from 'react'
import { getSecurityAlerts, acknowledgeAlert, getExternalData } from '../services/api'
import { AlertIcon, RefreshIcon, CheckIcon, ShieldIcon, KeyIcon } from '../components/Icons'

const SEVERITY_STYLE = {
    high: 'alert-high',
    medium: 'alert-medium',
    low: 'alert-low',
}

const SEVERITY_BADGE = {
    high: 'bg-red-900/40 text-red-300 border-red-500/30',
    medium: 'bg-amber-900/40 text-amber-300 border-amber-500/30',
    low: 'bg-blue-900/40 text-blue-300 border-blue-500/30',
}

export default function AlertsPage() {
    const [alerts, setAlerts] = useState([])
    const [loading, setLoading] = useState(true)
    const [externalResult, setExternalResult] = useState(null)
    const [apiKey, setApiKey] = useState('cs_traffic_sensor_key_7f8e9a')
    const [extLoading, setExtLoading] = useState(false)
    const [extError, setExtError] = useState('')

    const fetch = async () => {
        setLoading(true)
        try {
            const res = await getSecurityAlerts()
            setAlerts(res.data.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetch() }, [])

    const handleAck = async (alertId) => {
        try {
            await acknowledgeAlert(alertId)
            setAlerts(alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
        } catch (err) {
            console.error('Ack failed', err)
        }
    }

    const handleExternalTest = async () => {
        setExtLoading(true)
        setExtError('')
        setExternalResult(null)
        try {
            const res = await getExternalData(apiKey)
            setExternalResult(res.data)
        } catch (err) {
            setExtError(err.response?.data?.message || 'External API call failed.')
        } finally {
            setExtLoading(false)
        }
    }

    const activeAlerts = alerts.filter(a => !a.acknowledged)
    const ackedAlerts = alerts.filter(a => a.acknowledged)

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="section-header">Security Alerts</h1>
                    <p className="section-sub">Threat detection — insider threats, access violations, request surges</p>
                </div>
                <button onClick={fetch} className="btn-secondary">
                    <RefreshIcon /> Refresh
                </button>
            </div>

            {/* Active Alerts */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <AlertIcon className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-white">Active Threats</span>
                    {activeAlerts.length > 0 && (
                        <span className="badge bg-red-900/40 text-red-300 border-red-500/30 text-[10px]">
                            {activeAlerts.length} unresolved
                        </span>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-10 text-slate-500">
                        <svg className="w-5 h-5 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Loading alerts...
                    </div>
                ) : activeAlerts.length === 0 ? (
                    <div className="card text-center py-10">
                        <ShieldIcon className="w-10 h-10 text-emerald-500/30 mx-auto mb-2" />
                        <p className="text-emerald-400 text-sm font-medium">No active threats</p>
                        <p className="text-slate-600 text-xs mt-1">All security checks passing</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activeAlerts.map((alert) => (
                            <div key={alert.id} className={`card ${SEVERITY_STYLE[alert.severity]} group`}>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className={`badge text-[10px] ${SEVERITY_BADGE[alert.severity]}`}>
                                                {alert.severity?.toUpperCase()}
                                            </span>
                                            <span className="text-[10px] text-slate-500 font-mono">{alert.type}</span>
                                        </div>
                                        <p className="text-sm text-slate-200">{alert.message}</p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                            <span>Identifier: <span className="font-mono text-slate-400">{alert.identifier}</span></span>
                                            <span>Endpoint: <span className="font-mono text-slate-400">{alert.endpoint}</span></span>
                                            <span>{new Date(alert.timestamp).toLocaleTimeString('en-IN')}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAck(alert.id)}
                                        className="flex-shrink-0 btn-secondary text-emerald-400 border-emerald-500/20 hover:bg-emerald-900/20"
                                    >
                                        <CheckIcon />
                                        Acknowledge
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Acknowledged Alerts */}
            {ackedAlerts.length > 0 && (
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <CheckIcon className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-400">Acknowledged ({ackedAlerts.length})</span>
                    </div>
                    <div className="space-y-2">
                        {ackedAlerts.map((alert) => (
                            <div key={alert.id} className="card opacity-50 hover:opacity-70 transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-xs font-mono text-slate-400">{alert.type}</span>
                                        <p className="text-xs text-slate-500 mt-0.5">{alert.message}</p>
                                    </div>
                                    <span className="badge bg-emerald-900/20 text-emerald-600 border-emerald-500/10 text-[10px]">Acknowledged</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* External API Demo */}
            <div className="card border-shield-500/20">
                <div className="flex items-center gap-2 mb-4">
                    <KeyIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">External API Token Demo</span>
                    <span className="badge badge-external text-[10px]">M2M Auth</span>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                    Test machine-to-machine authentication via x-api-key header.
                    Simulates traffic sensors, water systems, and IoT devices accessing the gateway.
                </p>
                <div className="flex gap-2 flex-wrap mb-3">
                    {[
                        { label: 'Traffic Sensor', key: 'cs_traffic_sensor_key_7f8e9a' },
                        { label: 'Water System', key: 'cs_water_mgmt_key_2b3c4d' },
                        { label: 'CiviFlow', key: 'cs_civiflow_int_key_5e6f7a' },
                        { label: 'Revoked Key', key: 'cs_revoked_key_9x0y1z' },
                        { label: 'Invalid Key', key: 'invalid_key_test' },
                    ].map(({ label, key }) => (
                        <button
                            key={key}
                            onClick={() => { setApiKey(key); setExternalResult(null); setExtError('') }}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${apiKey === key
                                    ? 'bg-cyan-900/30 text-cyan-300 border-cyan-500/30'
                                    : 'bg-white/3 text-slate-400 border-white/5 hover:bg-white/6'
                                }`}
                        >{label}</button>
                    ))}
                </div>
                <div className="flex gap-2 items-center mb-3">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1">API Key</label>
                        <input value={apiKey} onChange={e => setApiKey(e.target.value)} className="input font-mono text-xs" />
                    </div>
                    <button onClick={handleExternalTest} disabled={extLoading} className="btn-primary mt-5 flex-shrink-0">
                        {extLoading ? 'Testing...' : 'Test External API'}
                    </button>
                </div>
                {extError && (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                        {extError}
                    </div>
                )}
                {externalResult && (
                    <div className="mt-3 bg-surface-800 rounded-lg border border-white/5 p-4">
                        <p className="text-xs text-slate-400 font-medium mb-2">Response from Gateway:</p>
                        <pre className="text-xs text-emerald-300 overflow-auto max-h-48 font-mono leading-relaxed">
                            {JSON.stringify(externalResult, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    )
}
