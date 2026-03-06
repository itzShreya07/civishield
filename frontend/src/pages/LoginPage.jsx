import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as loginApi } from '../services/api'
import { ShieldIcon, LockIcon, UserIcon } from '../components/Icons'

const DEMO_USERS = [
    { label: 'Citizen', email: 'alice@civishield.io', password: 'citizen123', role: 'Citizen' },
    { label: 'Field Officer – Ward 5', email: 'raj@civishield.io', password: 'officer123', role: 'FieldOfficer' },
    { label: 'Field Officer – Ward 9', email: 'priya@civishield.io', password: 'officer123', role: 'FieldOfficer' },
    { label: 'Department Admin', email: 'kumar@civishield.io', password: 'admin123', role: 'DepartmentAdmin' },
    { label: 'Super Admin', email: 'superadmin@civishield.io', password: 'super123', role: 'SuperAdmin' },
]

export default function LoginPage() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await loginApi(email, password)
            login(res.data.user, res.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Check credentials.')
        } finally {
            setLoading(false)
        }
    }

    const autofill = (user) => {
        setEmail(user.email)
        setPassword(user.password)
        setError('')
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            {/* Background glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-shield-600/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-shield-600/20 border border-shield-500/30 mb-4">
                        <ShieldIcon className="w-8 h-8 text-shield-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CiviShield</h1>
                    <p className="text-slate-400 mt-1 text-sm">Security Gateway — Smart City Infrastructure</p>
                </div>

                {/* Login Card */}
                <div className="card-glow">
                    <h2 className="text-lg font-semibold text-white mb-5">Sign In</h2>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Email Address</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@civishield.io"
                                    className="input pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs text-slate-400 mb-1.5 font-medium">Password</label>
                            <div className="relative">
                                <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="input pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-900/30 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : (
                                <>
                                    <ShieldIcon className="w-4 h-4" />
                                    Authenticate
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo Credentials */}
                    <div className="mt-6 pt-5 border-t border-white/5">
                        <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Demo Accounts</p>
                        <div className="grid grid-cols-1 gap-2">
                            {DEMO_USERS.map((u) => (
                                <button
                                    key={u.email}
                                    onClick={() => autofill(u)}
                                    className="text-left px-3 py-2.5 rounded-lg bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all duration-150 group"
                                >
                                    <div className="text-sm text-slate-300 group-hover:text-white font-medium">{u.label}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-slate-600 text-xs mt-6">
                    CiviShield v1.0 — Integration-ready with CiviFlow
                </p>
            </div>
        </div>
    )
}
