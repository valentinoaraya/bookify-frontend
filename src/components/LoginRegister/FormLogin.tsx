import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./LoginRegister.css"

const FormLogin = ({ loginTo }: { loginTo: "users" | "companies" }) => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const navigate = useNavigate()

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            const formData = { email, password }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/${loginTo}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            console.log(data)

            navigate(loginTo === "users" ? "/user-panel" : "/company-panel")

        } catch (error: any) {
            console.log(error)
        }

    }

    return (
        <form onSubmit={handleSubmit} className="formLoginRegister">
            <div>
                <label htmlFor="email">Email: </label>
                <input
                    placeholder="Email"
                    type="text"
                    name="email"
                    value={email}
                    onChange={handleEmailChange}
                    required
                />
            </div>
            <div>
                <label htmlFor="password">Contraseña: </label>
                <input
                    placeholder="Contraseña"
                    type="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                />
            </div>
            <button type="submit">Iniciar Sesión</button>
        </form>
    );
}

export default FormLogin;
