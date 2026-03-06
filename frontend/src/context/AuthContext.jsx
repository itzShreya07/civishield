import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('cs_user')
        const storedToken = localStorage.getItem('cs_token')
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser))
            setToken(storedToken)
        }
    }, [])

    const login = (userData, jwtToken) => {
        setUser(userData)
        setToken(jwtToken)
        localStorage.setItem('cs_user', JSON.stringify(userData))
        localStorage.setItem('cs_token', jwtToken)
    }

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('cs_user')
        localStorage.removeItem('cs_token')
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
