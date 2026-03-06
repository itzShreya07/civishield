import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getIssues, createIssue, updateIssueStatus } from '../services/api'
import { PlusIcon, RefreshIcon, ZoneIcon, IssuesIcon, XIcon } from '../components/Icons'

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'closed']
const ZONES = ['Ward 5', 'Ward 9', 'Ward 3', 'Ward 12']

const statusBadge = (s) => ({
    open: 'status-open',
    in_progress: 'status-in_progress',
    resolved: 'status-resolved',
    closed: 'status-closed',
}[s] || 'status-open')

const statusLabel = (s) => ({
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
}[s] || s)

export default function IssuesPage() {
    const { user } = useAuth()
    const [issues, setIssues] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [error, setError] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: 'General',
        zone: user.zone || 'Ward 5',
    })

    const canCreate = ['Citizen', 'DepartmentAdmin', 'SuperAdmin'].includes(user.role)
    const canUpdateStatus = ['FieldOfficer', 'DepartmentAdmin', 'SuperAdmin'].includes(user.role)

    const fetchIssues = async () => {
        setLoading(true)
        try {
            const res = await getIssues()
            setIssues(res.data.data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load issues.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchIssues() }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        try {
            await createIssue(form)
            setShowCreate(false)
            setForm({ title: '', description: '', category: 'General', zone: user.zone || 'Ward 5' })
            fetchIssues()
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create issue.')
        }
    }

    const handleStatusUpdate = async (issueId, newStatus) => {
        try {
            await updateIssueStatus(issueId, newStatus)
            setIssues(issues.map(i => i.id === issueId ? { ...i, status: newStatus } : i))
        } catch (err) {
            setError(err.response?.data?.message || 'Cannot update issue status.')
        }
    }

    const filtered = statusFilter === 'all'
        ? issues
        : issues.filter(i => i.status === statusFilter)

    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="section-header">City Issues</h1>
                    <p className="section-sub">
                        {user.role === 'FieldOfficer'
                            ? `Showing issues in your zone: ${user.zone}`
                            : user.role === 'Citizen'
                                ? 'Your submitted issues'
                                : `All issues — ${issues.length} total`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchIssues} className="btn-secondary">
                        <RefreshIcon />
                    </button>
                    {canCreate && (
                        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
                            <PlusIcon className="w-4 h-4" />
                            New Issue
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm flex items-center justify-between">
                    {error}
                    <button onClick={() => setError('')}><XIcon /></button>
                </div>
            )}

            {/* Create Form */}
            {showCreate && (
                <div className="card-glow animate-fade-in">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                        <IssuesIcon className="w-4 h-4 text-shield-400" />
                        Report New Issue
                    </h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-400 mb-1.5">Title</label>
                            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                                className="input" placeholder="Brief issue title" required />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs text-slate-400 mb-1.5">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                className="input resize-none" rows={3} placeholder="Describe the issue in detail" required />
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input">
                                {['General', 'Infrastructure', 'Sanitation', 'Water', 'Roads', 'Electricity'].map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5">Zone</label>
                            <select value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} className="input"
                                disabled={user.role === 'FieldOfficer'}>
                                {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2 flex gap-3 justify-end">
                            <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">Cancel</button>
                            <button type="submit" className="btn-primary">Submit Issue</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
                {['all', ...STATUS_OPTIONS].map(s => (
                    <button key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${statusFilter === s
                                ? 'bg-shield-600/30 text-shield-300 border-shield-500/40'
                                : 'bg-white/3 text-slate-400 border-white/5 hover:bg-white/6 hover:text-slate-300'
                            }`}>
                        {s === 'all' ? 'All' : statusLabel(s)}
                    </button>
                ))}
            </div>

            {/* Issue Cards */}
            {loading ? (
                <div className="flex items-center justify-center py-16 text-slate-500">
                    <svg className="w-6 h-6 animate-spin mr-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Loading issues...
                </div>
            ) : filtered.length === 0 ? (
                <div className="card text-center py-12">
                    <IssuesIcon className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No issues found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {filtered.map((issue) => (
                        <div key={issue.id} className="card hover:border-white/10 transition-all duration-200 group">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                                        <span className={`badge ${statusBadge(issue.status)} text-[11px]`}>
                                            {statusLabel(issue.status)}
                                        </span>
                                        <span className="badge bg-slate-800/80 text-slate-400 border-slate-700/50 text-[11px]">
                                            {issue.category}
                                        </span>
                                        <span className="flex items-center gap-1 text-xs text-slate-500">
                                            <ZoneIcon className="w-3 h-3" /> {issue.zone}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-semibold text-white">{issue.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{issue.description}</p>
                                    <p className="text-xs text-slate-600 mt-2">
                                        {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                                            day: '2-digit', month: 'short', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {/* Status Update */}
                                {canUpdateStatus && (
                                    <div className="flex-shrink-0">
                                        <select
                                            value={issue.status}
                                            onChange={(e) => handleStatusUpdate(issue.id, e.target.value)}
                                            className="text-xs bg-surface-800 border border-white/10 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-shield-500 cursor-pointer hover:border-white/20 transition"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s}>{statusLabel(s)}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
