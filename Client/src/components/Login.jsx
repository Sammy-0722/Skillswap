import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser, userLogin, getOwnProfile } from '../services/api'

import './Login.css'
const Login = () => {
    const [isRegister, setIsRegister] = useState(true);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isloading, setLoading] = useState(false);
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")
        if (!email || !password) {
            setError("please fill in all fields.")
            return
        }
        setLoading(true)
        try {
            if (isRegister) {
                await registerUser(name, email, password)
                navigate('/setupprofile')
                setSuccess('Registered! You can now login.')
                setIsRegister(false)
            } else {
                await userLogin(email, password)
                try {
                    await getOwnProfile()
                    navigate('/dashboard')
                } catch (err) {
                    navigate('/setupprofile')
                }

            }
        } catch (err) {
            setError(err.response?.data?.message || "Login Error")
        } finally {
            setLoading(false)
        }
    }
    return (
        <>
            <div className="card-container">
                <div className="left">

                    <div className="auth-brand">
                        <div className="auth-logo">SkillSwap</div>
                        <div className="auth-headline">Trade what you know, learn what you don't.</div>
                        <div className="auth-subtext">Join thousands already swapping skills — no money changes hands, only knowledge.</div>
                        <div class="auth-features">
                            <div className="auth-feature"><span className="auth-feature-icon">✓</span> AI-matched skill partners</div>
                            <div className="auth-feature"><span className="auth-feature-icon">✓</span> Real-time chat with your matches</div>
                            <div className="auth-feature"><span className="auth-feature-icon">✓</span> Book and pay for sessions securely</div>
                        </div>
                    </div>

                </div>



                <div className="card">
                    <div className="cardadjustment">
                        <div className="loginbadge">{isRegister ? "Create Account " : "Welcome Back"}</div>
                        <div className="loginbadgepara">{isRegister ? "Join Thousand already swapping skiils " : "Login to your SkillSwap account"}</div>
                        <form onSubmit={handleSubmit}>

                            {isRegister ? <label className="Login-label">Full {<span>Name</span>}</label> : null}
                            {isRegister ? <input
                                className="login-input"
                                type="text"
                                placeholder="Enter your name...."
                                value={name}
                                onChange={(e) => setName(e.target.value)} /> : null}
                            <label className="Login-label">Em{<span>ail</span>}</label>
                            <input
                                className="login-input"
                                type="email"
                                placeholder="user@gamil.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                            <label className="Login-label">Pas{<span>swo</span>}rd</label>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="********"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} />


                            <button type="submit" disabled={isloading} className="loginbtns">{isRegister ? "Create Account" : "Login"}</button>
                            <div className="loginbtnpara">{isRegister ? "no account" : "login for free"} </div>
                            <section className="line"></section>
                            < p className="login-toggle">
                                {isRegister ? "Already havve an account ?" : "  Dont have an account "}
                                <span onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }} className="logininfo">
                                    {isRegister ? '  signin  ' : "   Register  "}
                                </span>
                            </p>
                        </form>
                    </div>

                </div>
            </div>
        </>
    )
}
export default Login