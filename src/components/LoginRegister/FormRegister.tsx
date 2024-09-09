import React, { useState } from "react"
import "./LoginRegister.css"

const FormRegister = ({ loginTo }: { loginTo: "users" | "companies" }) => {

    const [name, setName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }

    const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLastName(e.target.value)
    }

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocation(e.target.value)
    }

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {

            const formData = { name, lastName, email, password, phone, location }

            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/${loginTo}/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            console.log(data)

        } catch (error: any) {
            console.log(error)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="formLoginRegister">
            <div>
                <label htmlFor="name">Nombre: </label>
                <input
                    placeholder="Nombre"
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleNameChange}
                    required
                />
            </div>
            {
                loginTo === "users" ?
                    <div>
                        <label htmlFor="lastName">Apellido: </label>
                        <input
                            placeholder="Apellido"
                            type="text"
                            name="lastName"
                            value={lastName}
                            onChange={handleLastNameChange}
                            required
                        />
                    </div>
                    :
                    <div>
                        <label htmlFor="location">Ubicación: </label>
                        <input
                            placeholder="Ubicación"
                            type="text"
                            name="location"
                            value={location}
                            onChange={handleLocationChange}
                            required
                        />
                    </div>
            }
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
            <div>
                <label htmlFor="email">Teléfono: </label>
                <input
                    placeholder="Teléfono"
                    type="text"
                    name="phone"
                    value={phone}
                    onChange={handlePhoneChange}
                    required
                />
            </div>
            <button type="submit">Registrarse</button>
        </form>
    );
}

export default FormRegister;
