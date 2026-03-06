/**
 * CiviShield – RBAC Permission Matrix Page
 *
 * Visual representation of role permissions read from the system.
 * Read-only — does not affect backend logic.
 */

import { ShieldIcon, CheckIcon, XIcon } from '../components/Icons'

// Permission matrix data — mirrors policies/permissions.js
const MATRIX = [
    {
        role: 'Citizen',
        badgeClass: 'badge-citizen',
        viewIssues: true,
        createIssue: true,
        updateIssues: false,
        viewZoneIssues: false,
        viewLogs: false,
        adminAccess: false,
        externalAPI: false,
        fullAccess: false,
    },
    {
        role: 'FieldOfficer',
        badgeClass: 'badge-officer',
        viewIssues: true,
        createIssue: false,
        updateIssues: true,
        viewZoneIssues: true,
        viewLogs: false,
        adminAccess: false,
        externalAPI: false,
        fullAccess: false,
    },
    {
        role: 'DepartmentAdmin',
        badgeClass: 'badge-admin',
        viewIssues: true,
        createIssue: false,
        updateIssues: false,
        viewZoneIssues: true,
        viewLogs: true,
        adminAccess: true,
        externalAPI: false,
        fullAccess: false,
    },
    {
        role: 'SuperAdmin',
        badgeClass: 'badge-super',
        viewIssues: true,
        createIssue: true,
        updateIssues: true,
        viewZoneIssues: true,
        viewLogs: true,
        adminAccess: true,
        externalAPI: true,
        fullAccess: true,
    },
    {
        role: 'ExternalSystem',
        badgeClass: 'badge-external',
        viewIssues: false,
        createIssue: false,
        updateIssues: false,
        viewZoneIssues: false,
        viewLogs: false,
        adminAccess: false,
        externalAPI: true,
        fullAccess: false,
    },
]

const COLUMNS = [
    { key: 'viewIssues', label: 'View Issues', desc: 'view_own_issues / view_all_issues' },
    { key: 'createIssue', label: 'Create Issue', desc: 'create_issue' },
    { key: 'updateIssues', label: 'Update Status', desc: 'update_zone_issues' },
    { key: 'viewZoneIssues', label: 'Zone Issues', desc: 'view_zone_issues' },
    { key: 'viewLogs', label: 'Audit Logs', desc: 'view_audit_logs' },
    { key: 'adminAccess', label: 'Admin Panel', desc: 'view_users / assign_officers' },
    { key: 'externalAPI', label: 'External API', desc: 'x-api-key auth' },
    { key: 'fullAccess', label: 'Full Access', desc: 'full_access override' },
]

function Cell({ value }) {
    return (
        <td className="px-4 py-3 text-center">
            {value ? (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-900/40 border border-emerald-500/20">
                    <CheckIcon className="w-3 h-3 text-emerald-400" />
                </span>
            ) : (
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-800/60 border border-white/5">
                    <XIcon className="w-3 h-3 text-slate-600" />
                </span>
            )}
        </td>
    )
}

export default function PermissionsPage() {
    return (
        <div className="space-y-5 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="section-header">Permission Matrix</h1>
                <p className="section-sub">
                    Role-based access control policy — read from{' '}
                    <code className="text-shield-400 text-xs bg-shield-900/30 px-1.5 py-0.5 rounded">
                        policies/permissions.js
                    </code>
                </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-5 px-1">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-900/40 border border-emerald-500/20">
                        <CheckIcon className="w-2.5 h-2.5 text-emerald-400" />
                    </span>
                    Permitted
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-800/60 border border-white/5">
                        <XIcon className="w-2.5 h-2.5 text-slate-600" />
                    </span>
                    Denied
                </div>
            </div>

            {/* Matrix Table */}
            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/2">
                                <th className="text-left px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide text-[10px] whitespace-nowrap w-40">
                                    Role
                                </th>
                                {COLUMNS.map((col) => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 text-slate-400 font-semibold uppercase tracking-wide text-center text-[10px] whitespace-nowrap"
                                        title={col.desc}
                                    >
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {MATRIX.map((row, i) => (
                                <tr
                                    key={row.role}
                                    className={`border-b border-white/3 hover:bg-white/2 transition ${row.fullAccess ? 'bg-shield-900/10' : ''
                                        }`}
                                >
                                    <td className="px-4 py-3">
                                        <span className={`badge ${row.badgeClass} text-[11px]`}>
                                            {row.role}
                                        </span>
                                    </td>
                                    {COLUMNS.map((col) => (
                                        <Cell key={col.key} value={row[col.key]} />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Gateway Architecture Note */}
            <div className="card border-shield-500/20 bg-shield-900/10">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-shield-600/20 border border-shield-500/30 flex-shrink-0 flex items-center justify-center mt-0.5">
                        <ShieldIcon className="w-4 h-4 text-shield-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-white mb-1">Security Gateway Middleware Stack</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Every API request passes through the unified <code className="text-shield-400 bg-shield-900/30 px-1 rounded">securityGateway</code> middleware bundle:
                        </p>
                        <div className="flex items-center gap-2 mt-3 flex-wrap text-[10px]">
                            {[
                                'rateLimitMiddleware',
                                'authMiddleware',
                                'roleMiddleware',
                                'zoneMiddleware',
                            ].map((m, i, arr) => (
                                <span key={m} className="flex items-center gap-2">
                                    <code className="bg-surface-800 border border-white/10 text-slate-300 px-2 py-1 rounded font-mono">
                                        {m}
                                    </code>
                                    {i < arr.length - 1 && (
                                        <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
