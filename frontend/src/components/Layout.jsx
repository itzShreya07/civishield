import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    ShieldIcon, DashboardIcon, IssuesIcon,
    AuditIcon, AlertIcon, LogoutIcon, ZoneIcon
} from './Icons'

export default function Layout() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const isActive = (path) => location.pathname === path

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const roleBadgeClass = {
        Citizen: 'badge-citizen',
        FieldOfficer: 'badge-officer',
        DepartmentAdmin: 'badge-admin',
        SuperAdmin: 'badge-super',
    }[user?.role] || 'badge-citizen'

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: DashboardIcon },
        { path: '/issues', label: 'Issues', icon: IssuesIcon },
        ...((['DepartmentAdmin', 'SuperAdmin'].includes(user?.role)) ? [
            { path: '/audit', label: 'Audit Logs', icon: AuditIcon },
        ] : []),
        ...(user?.role === 'SuperAdmin' ? [
            { path: '/alerts', label: 'Security Alerts', icon: AlertIcon },
        ] : []),
    ]

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-surface-900 border-r border-white/5 flex flex-col">
                {/* Logo */}
                <div className="px-4 pt-6 pb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-shield-600/20 border border-shield-500/30 flex items-center justify-center">
                        <ShieldIcon className="w-5 h-5 text-shield-400" />
                    </div>
                    <div>
                        <div className="text-white font-bold text-base leading-tight">CiviShield</div>
                        <div className="text-slate-500 text-xs font-medium">Security Gateway</div>
                    </div>
                </div>

                {/* User Info */}
                <div className="mx-3 mb-4 px-3 py-3 bg-surface-800 rounded-lg border border-white/5">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="text-white text-sm font-semibold truncate">{user?.name}</div>
                            <div className="text-slate-500 text-xs mt-0.5 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                        <span className={`badge ${roleBadgeClass} text-[11px]`}>{user?.role}</span>
                        {user?.zone && (
                            <span className="badge bg-emerald-900/30 text-emerald-400 border-emerald-500/20 text-[11px] flex items-center gap-1">
                                <ZoneIcon className="w-2.5 h-2.5" />
                                {user.zone}
                            </span>
                        )}
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 space-y-1">
                    <div className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest px-2 mb-2">Navigation</div>
                    {navItems.map(({ path, label, icon: Icon }) => (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`nav-link w-full text-left ${isActive(path) ? 'active' : ''}`}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </button>
                    ))}
                </nav>

                {/* Bottom Actions */}
                <div className="px-3 pb-5 pt-2 border-t border-white/5 mt-2">
                    <button onClick={handleLogout} className="nav-link w-full text-left text-red-500 hover:text-red-400 hover:bg-red-900/10">
                        <LogoutIcon className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 animate-fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
