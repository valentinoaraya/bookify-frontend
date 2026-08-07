import "./ProfileSettings.css"
import { Company } from "../../../../../types";
import { useDataForm } from "../../../../../hooks/useDataForm";
import { notifyError, notifySuccess } from "../../../../../utils/notifications";
import { ClipboardIcon, UserXIcon } from "../../../../../common/Icons/Icons";
import Button from "../../../../../common/Button/Button";
import { updateCompany } from "@/shared/api/companies";
import { useCompany } from "../../../../../hooks/useCompany";
import { useMemo, useState } from "react";
import { logout } from "../../../../../utils/tokenManager";

interface Props {
    data: Company
}

type ProfileFields = {
    name: string
    phone: string
    email: string
    company_id: string
}

const normalizeProfile = (fields: ProfileFields) => ({
    name: String(fields.name ?? "").trim(),
    phone: String(fields.phone ?? "").trim(),
    email: String(fields.email ?? "").trim(),
    company_id: String(fields.company_id ?? "").trim(),
})

const profilesEqual = (a: ProfileFields, b: ProfileFields) => {
    const left = normalizeProfile(a)
    const right = normalizeProfile(b)
    return (
        left.name === right.name &&
        left.phone === right.phone &&
        left.email === right.email &&
        left.company_id === right.company_id
    )
}

const ProfileSettings: React.FC<Props> = ({ data }) => {
    const { updateCompanyData } = useCompany()
    const initial = {
        name: data.name,
        phone: data.phone,
        email: data.email,
        company_id: data.company_id,
    }
    const { dataForm, handleChange } = useDataForm(initial)
    const [isLoading, setIsLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const hasChanges = useMemo(
        () => !profilesEqual(initial, dataForm as ProfileFields),
        [dataForm, data.name, data.phone, data.email, data.company_id]
    )

    const publicPath = `/c/${String(dataForm["company_id"] ?? "").trim() || "…"}`
    const publicUrl = `${window.location.origin}${publicPath}`

    const updateData = async () => {
        if (!hasChanges) return

        const next = normalizeProfile(dataForm as ProfileFields)

        if (!next.name || !next.phone || !next.email || !next.company_id) {
            notifyError("Por favor, completa todos los campos")
            return
        }

        setIsLoading(true)
        try {
            const response = await updateCompany(next)
            if (response?.data) {
                updateCompanyData(response.data.data)
                notifySuccess("Datos actualizados")
            }
            if (response?.error) notifyError(response.error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        await logout()
        window.location.href = "/"
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/c/${data.company_id}`)
            setCopied(true)
            notifySuccess("¡Link copiado!")
            window.setTimeout(() => setCopied(false), 1800)
        } catch {
            notifyError("No se pudo copiar el link")
        }
    }

    return (
        <div className="animation-section">
            <div className="header-settings">
                <h2 className="titleSetting">Perfil de tu empresa</h2>
                <p>Edita los datos de contacto. Las sedes se gestionan en la pestaña Sedes.</p>
            </div>
            <div className="profile-settings">
                <section className="profileLinkCard">
                    <div className="profileLinkCardHeader">
                        <div>
                            <h3>Link para tus clientes</h3>
                            <p>Compartí este enlace para que reserven turnos online.</p>
                        </div>
                        <div className="profileLinkActions">
                            <button
                                type="button"
                                className={`profileLinkCopy ${copied ? "is-copied" : ""}`}
                                onClick={copyToClipboard}
                            >
                                <ClipboardIcon
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                />
                                {copied ? "Copiado" : "Copiar link"}
                            </button>
                            <a
                                className="profileLinkOpen"
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                            >
                                Abrir
                            </a>
                        </div>
                    </div>

                    <div className="profileLinkPreview" title={publicUrl}>
                        <span className="profileLinkPreviewHost">{window.location.host}</span>
                        <span className="profileLinkPreviewPath">{publicPath}</span>
                    </div>

                    <div className="profileLinkSlug">
                        <label htmlFor="company_id">Identificador del link</label>
                        <div className="profileLinkSlugField">
                            <span className="profileLinkSlugPrefix">/c/</span>
                            <input
                                id="company_id"
                                className="profileLinkSlugInput"
                                name="company_id"
                                required
                                type="text"
                                value={dataForm["company_id"]}
                                onChange={handleChange}
                                autoComplete="off"
                            />
                        </div>
                        <p className="profileLinkSlugHint">
                            Si lo cambiás, el link anterior dejará de funcionar.
                        </p>
                    </div>
                </section>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        if (hasChanges && !isLoading) updateData()
                    }}
                >
                    <div className="profile-settings-item">
                        <label htmlFor="profile-name">Nombre</label>
                        <input
                            id="profile-name"
                            name="name"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["name"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label htmlFor="profile-phone">Teléfono</label>
                        <input
                            id="profile-phone"
                            name="phone"
                            required
                            onChange={handleChange}
                            type="text"
                            value={dataForm["phone"]}
                        />
                    </div>
                    <div className="profile-settings-item">
                        <label htmlFor="profile-email">Email</label>
                        <input
                            id="profile-email"
                            name="email"
                            required
                            onChange={handleChange}
                            type="email"
                            value={dataForm["email"]}
                        />
                    </div>
                </form>
            </div>
            <div className="buttons-profile-settings">
                {hasChanges && (
                    <span className="profileDirtyHint">Hay cambios sin guardar</span>
                )}
                <Button
                    type="button"
                    loading={isLoading}
                    disabled={!hasChanges}
                    onSubmit={updateData}
                >
                    Guardar cambios
                </Button>
                <Button
                    type="button"
                    variant="danger-ghost"
                    margin="0"
                    onSubmit={handleLogout}
                >
                    <UserXIcon width="16" height="16" fill="currentColor" />
                    Cerrar sesión
                </Button>
            </div>
        </div>
    );
}

export default ProfileSettings;
