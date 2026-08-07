import "./LocationsSettings.css";
import { useMemo, useState } from "react";
import type { Company, CompanyLocation } from "@/types";
import {
	addCompanyLocation,
	deleteCompanyLocation,
	setDefaultCompanyLocation,
	updateCompanyLocation,
} from "@/shared/api/companies";
import { useCompany } from "@/hooks/useCompany";
import { notifyError, notifySuccess } from "@/utils/notifications";
import { confirmDelete } from "@/utils/alerts";
import Button from "@/common/Button/Button";
import { PLAN_LOCATION_LIMITS } from "@/features/company-panel/locations/planLocationLimits";

interface Props {
	data: Company;
}

type LocationForm = {
	name: string;
	city: string;
	street: string;
	number: string;
};

const emptyForm: LocationForm = {
	name: "",
	city: "",
	street: "",
	number: "",
};

const LocationsSettings: React.FC<Props> = ({ data }) => {
	const { updateCompanyData } = useCompany();
	const locations = data.locations ?? [];
	const plan = data.subscription?.plan ?? "individual";
	const maxLocations = PLAN_LOCATION_LIMITS[plan] ?? 1;

	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [form, setForm] = useState<LocationForm>(emptyForm);
	const [isLoading, setIsLoading] = useState(false);

	const atLimit = locations.length >= maxLocations;

	const sortedLocations = useMemo(
		() =>
			[...locations].sort((a, b) => {
				if (a.isDefault === b.isDefault)
					return a.name.localeCompare(b.name);
				return a.isDefault ? -1 : 1;
			}),
		[locations],
	);

	const openCreate = () => {
		if (atLimit) {
			notifyError(
				`Has alcanzado el límite de sedes para tu plan (${maxLocations}).`,
				true,
			);
			return;
		}
		setEditingId(null);
		setForm(emptyForm);
		setIsFormOpen(true);
	};

	const openEdit = (location: CompanyLocation) => {
		setEditingId(location._id);
		setForm({
			name: location.name,
			city: location.city,
			street: location.street,
			number: String(location.number),
		});
		setIsFormOpen(true);
	};

	const applyCompanyPatch = (company: Company) => {
		updateCompanyData({
			locations: company.locations,
			city: company.city,
			street: company.street,
			number: company.number,
			province: company.province,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (
			!form.name.trim() ||
			!form.city.trim() ||
			!form.street.trim() ||
			!form.number.trim()
		) {
			notifyError("Completá todos los campos de la sede.", true);
			return;
		}

		setIsLoading(true);
		try {
			const payload = {
				name: form.name.trim(),
				city: form.city.trim(),
				street: form.street.trim(),
				number: form.number.trim(),
			};
			const response = editingId
				? await updateCompanyLocation(editingId, payload)
				: await addCompanyLocation(payload);

			if (response.error || !response.data?.data) {
				notifyError(response.error || "No se pudo guardar la sede.");
				return;
			}

			applyCompanyPatch(response.data.data);
			setIsFormOpen(false);
			setEditingId(null);
			setForm(emptyForm);
			notifySuccess(editingId ? "Sede actualizada" : "Sede agregada");
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (location: CompanyLocation) => {
		if (locations.length <= 1) {
			notifyError("Debés conservar al menos una sede.", true);
			return;
		}

		const confirmed = await confirmDelete({
			question: `¿Eliminar la sede "${location.name}"?`,
			message: "Los servicios que la usaban dejarán de incluirla.",
			confirmButtonText: "Eliminar",
			cancelButton: true,
			cancelButtonText: "Cancelar",
			icon: "warning",
		});
		if (!confirmed) return;

		setIsLoading(true);
		try {
			const response = await deleteCompanyLocation(location._id);
			if (response.error || !response.data?.data) {
				notifyError(response.error || "No se pudo eliminar la sede.");
				return;
			}
			applyCompanyPatch(response.data.data);
			notifySuccess("Sede eliminada");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSetDefault = async (location: CompanyLocation) => {
		if (location.isDefault) return;
		setIsLoading(true);
		try {
			const response = await setDefaultCompanyLocation(location._id);
			if (response.error || !response.data?.data) {
				notifyError(
					response.error || "No se pudo marcar como principal.",
				);
				return;
			}
			applyCompanyPatch(response.data.data);
			notifySuccess("Sede principal actualizada");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="animation-section">
			<div className="header-settings">
				<h2 className="titleSetting">Sedes y consultorios</h2>
				<p>
					Administrá los lugares donde atendés. Los servicios
					presenciales pueden ofrecerse en una o varias sedes.
				</p>
			</div>

			<div className="locations-settings">
				<div className="locationsToolbar">
					<p className="locationsLimitHint">
						{locations.length} de{" "}
						{maxLocations === Infinity ? "∞" : maxLocations} sedes
						disponibles en tu plan
					</p>
					<Button
						margin="1rem 0 0 0"
						width="auto"
						padding="0.5rem 1rem"
						fontSize="0.9rem"
						onSubmit={openCreate}
						disabled={isLoading || atLimit}
					>
						Agregar sede
					</Button>
				</div>

				{isFormOpen && (
					<form className="locationForm" onSubmit={handleSubmit}>
						<h3>{editingId ? "Editar sede" : "Nueva sede"}</h3>
						<div className="locationFormGrid">
							<label>
								Nombre
								<input
									value={form.name}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											name: e.target.value,
										}))
									}
									placeholder="Consultorio Norte"
									required
								/>
							</label>
							<label>
								Ciudad
								<input
									value={form.city}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											city: e.target.value,
										}))
									}
									required
								/>
							</label>
							<label>
								Calle
								<input
									value={form.street}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											street: e.target.value,
										}))
									}
									required
								/>
							</label>
							<label>
								Número
								<input
									value={form.number}
									onChange={(e) =>
										setForm((prev) => ({
											...prev,
											number: e.target.value,
										}))
									}
									required
								/>
							</label>
						</div>
						<div className="locationFormActions">
							<Button
								type="submit"
								loading={isLoading}
								margin="0"
								width="auto"
							>
								Guardar
							</Button>
							<Button
								type="button"
								variant="neutral"
								margin="0"
								width="auto"
								disabled={isLoading}
								onSubmit={() => {
									setIsFormOpen(false);
									setEditingId(null);
								}}
							>
								Cancelar
							</Button>
						</div>
					</form>
				)}

				<div className="locationsList">
					{sortedLocations.length === 0 ? (
						<p className="locationsEmpty">
							Todavía no tenés sedes configuradas.
						</p>
					) : (
						sortedLocations.map((location) => (
							<article
								key={location._id}
								className="locationCard"
							>
								<div className="locationCardMain">
									<div className="locationCardTitleRow">
										<h3>{location.name}</h3>
										{location.isDefault && (
											<span className="locationDefaultBadge">
												Principal
											</span>
										)}
									</div>
									<p>
										{location.street} {location.number},{" "}
										{location.city}
									</p>
								</div>
								<div className="locationCardActions">
									{!location.isDefault && (
										<button
											type="button"
											className="locationActionBtn"
											disabled={isLoading}
											onClick={() =>
												handleSetDefault(location)
											}
										>
											Marcar principal
										</button>
									)}
									<button
										type="button"
										className="locationActionBtn"
										disabled={isLoading}
										onClick={() => openEdit(location)}
									>
										Editar
									</button>
									<button
										type="button"
										className="locationActionBtn locationActionBtn--danger"
										disabled={
											isLoading || locations.length <= 1
										}
										onClick={() => handleDelete(location)}
									>
										Eliminar
									</button>
								</div>
							</article>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default LocationsSettings;
