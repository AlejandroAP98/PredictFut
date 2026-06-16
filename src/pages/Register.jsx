import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from '../assets/Logo.svg'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error } = await signUp(email, password, name)
      if (error) throw error
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(125% 125% at 50% 90%, #f5f5f5 20%, #10b981 100%)',
            backgroundSize: '100% 100%',
          }}
        />
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-xl animate-slideUp">
        <div className="text-center mb-4 animate-fadeIn">
          <img src={Logo} alt="Logo" className="w-20 sm:w-36 h-20 sm:h-36 mx-auto mb-4" />
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">PredicFut</h1>
        </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                placeholder="Tu nombre"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all"
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-200"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-6 text-center text-gray-500">
            <span>Ya tienes cuenta?</span>{' '}
            <Link to="/login" className="text-emerald-600 hover:text-emerald-500 font-medium transition-colors">
              Ingresa
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
