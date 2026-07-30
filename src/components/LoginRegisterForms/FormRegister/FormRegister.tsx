import { useNavigate, Link } from "react-router-dom";
import "./FormRegister.css";
import { useDataForm } from "../../../hooks/useDataForm.ts";
import LabelInputComponent from "../LabelInputComponent/LabelInputComponent.tsx";
import LabelSelectComponent from "../LabelSelectComponent/LabelSelectComponent.tsx";
import Button from "../../../common/Button/Button.tsx";
import { registerCompany } from "@/shared/api/companies";
import { useState } from "react";
import { notifyError } from "../../../utils/notifications.ts";
import { ToastContainer } from "react-toastify";
import { setTokens } from "../../../utils/tokenManager.ts";
import PlanCard from "../PlanCard/PlanCard.tsx";
import {
	ArrowReturnIcon,
	CalendarCheckIcon,
	CreditCardIcon,
	RocketIcon,
} from "../../../common/Icons/Icons.tsx";
import { plans } from "../../../utils/plans.ts";

type Step = 1 | 2 | 3;

const STEPS = [
	{ id: 1 as const, label: "Plan", hint: "Elegí tu suscripción" },
	{ id: 2 as const, label: "Negocio", hint: "Datos de tu empresa" },
	{ id: 3 as const, label: "Cuenta", hint: "Acceso y pago" },
];

const FormRegister = () => {
	const navigate = useNavigate();
	const { dataForm, handleChange } = useDataForm({
		name: "",
		email: "",
		phone: "",
		province: "",
		city: "",
		street: "",
		number: "",
		password: "",
		confirmPassword: "",
		plan: "",
		payer_email: "",
	});

	const [step, setStep] = useState<Step>(1);
	const [isLoading, setIsLoading] = useState(false);

	const selectedPlan = plans.find((p) => p.id === dataForm.plan);

	const selectPlan = (planId: string) => {
		handleChange({
			target: { name: "plan", value: planId },
		} as React.ChangeEvent<HTMLInputElement>);
	};

	const validateStep = (current: Step): boolean => {
		if (current === 1) {
			if (!dataForm.plan) {
				notifyError("Por favor seleccioná un plan");
				return false;
			}
			const plan = plans.find((p) => p.id === dataForm.plan);
			if (!plan?.available) {
				notifyError("Ese plan todavía no está disponible");
				return false;
			}
			return true;
		}

		if (current === 2) {
			const required = [
				dataForm.name,
				dataForm.province,
				dataForm.city,
				dataForm.street,
				dataForm.number,
				dataForm.phone,
			];
			if (required.some((v) => !String(v).trim())) {
				notifyError("Completá todos los datos de tu negocio");
				return false;
			}
			return true;
		}

		if (current === 3) {
			if (
				!dataForm.payer_email ||
				!dataForm.email ||
				!dataForm.password ||
				!dataForm.confirmPassword
			) {
				notifyError("Completá todos los campos de la cuenta");
				return false;
			}
			if (dataForm.password !== dataForm.confirmPassword) {
				notifyError("Las contraseñas no coinciden");
				return false;
			}
			return true;
		}

		return true;
	};

	const goNext = () => {
		if (!validateStep(step)) return;
		setStep((s) => Math.min(3, s + 1) as Step);
	};

	const goPrev = () => {
		if (step === 1) {
			navigate(-1);
			return;
		}
		setStep((s) => Math.max(1, s - 1) as Step);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

		setIsLoading(true);
		try {
			const response = await registerCompany(dataForm);

			if (response.error) {
				notifyError(response.error);
				return;
			}

			const initPoint = response.data?.data?.init_point;
			if (!initPoint) {
				notifyError(
					"No pudimos iniciar el pago. Intentá de nuevo o contactá soporte.",
				);
				return;
			}

			setTokens({
				access_token: response.data!.data.access_token,
				refresh_token: response.data!.data.refresh_token,
			});
			window.location.href = initPoint;
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="registerPage">
			<ToastContainer />
			<div className="registerPage__bg" aria-hidden>
				<div className="registerPage__blob registerPage__blob--a" />
				<div className="registerPage__blob registerPage__blob--b" />
			</div>

			<aside className="registerAside">
				<Link to="/" className="registerAside__brand">
					Bookify
				</Link>
				<div className="registerAside__copy">
					<h1>Creá tu cuenta y empezá a recibir turnos</h1>
					<p>
						Configurá tu negocio en minutos. Tus clientes reservan
						sin registrarse y vos cobrás señas con Mercado Pago.
					</p>
				</div>
				<ul className="registerAside__perks">
					<li>
						<span className="registerAside__perkIcon">
							<CalendarCheckIcon
								width="18"
								height="18"
								fill="currentColor"
							/>
						</span>
						Agenda y portal de reservas listos el mismo día
					</li>
					<li>
						<span className="registerAside__perkIcon">
							<CreditCardIcon
								width="18"
								height="18"
								fill="currentColor"
							/>
						</span>
						Cobro de señas directo en tu Mercado Pago
					</li>
					<li>
						<span className="registerAside__perkIcon">
							<RocketIcon
								width="18"
								height="18"
								fill="currentColor"
							/>
						</span>
						Cambiá de plan cuando quieras
					</li>
				</ul>
				<p className="registerAside__login">
					¿Ya tenés cuenta?{" "}
					<Link to="/login/company">Iniciá sesión</Link>
				</p>
			</aside>

			<main className="registerMain">
				<header className="registerMain__header">
					<button
						className="registerBackBtn"
						onClick={goPrev}
						type="button"
					>
						<ArrowReturnIcon
							width="18"
							height="18"
							fill="currentColor"
						/>
						<span>{step === 1 ? "Volver" : "Anterior"}</span>
					</button>

					<nav
						className="registerSteps"
						aria-label="Progreso del registro"
					>
						{STEPS.map((s) => (
							<button
								key={s.id}
								type="button"
								className={`registerSteps__item ${
									step === s.id ? "is-active" : ""
								} ${step > s.id ? "is-done" : ""}`}
								onClick={() => {
									if (s.id < step) setStep(s.id);
									else if (s.id > step) {
										for (let i = step; i < s.id; i++) {
											if (!validateStep(i as Step))
												return;
										}
										setStep(s.id);
									}
								}}
							>
								<span className="registerSteps__num">
									{s.id}
								</span>
								<span className="registerSteps__meta">
									<strong>{s.label}</strong>
									<small>{s.hint}</small>
								</span>
							</button>
						))}
					</nav>
				</header>

				<div className="registerPanel">
					{step === 1 && (
						<section className="registerStep">
							<div className="registerStep__intro">
								<span className="registerStep__eyebrow">
									Paso 1 de 3
								</span>
								<h2>Elegí el plan ideal para tu negocio</h2>
								<p>
									Podés cambiarlo después. El cobro se
									gestiona con Mercado Pago al finalizar el
									registro.
								</p>
							</div>
							<div className="registerPlans">
								{plans.map((plan) => (
									<PlanCard
										key={plan.id}
										planName={plan.name}
										price={plan.price}
										features={plan.features}
										isSelected={dataForm.plan === plan.id}
										onClick={() => selectPlan(plan.id)}
										isComingSoon={!plan.available}
									/>
								))}
							</div>
							<div className="registerActions">
								<Button
									type="button"
									fontWeight="600"
									padding="1rem 1.5rem"
									margin="0"
									width="auto"
									onSubmit={goNext}
									iconSVG={
										<RocketIcon
											width="18"
											height="18"
											fill="currentColor"
										/>
									}
									reverse
								>
									Continuar
								</Button>
							</div>
						</section>
					)}

					{step === 2 && (
						<section className="registerStep">
							<div className="registerStep__intro">
								<span className="registerStep__eyebrow">
									Paso 2 de 3
								</span>
								<h2>Contanos sobre tu negocio</h2>
								<p>
									Estos datos aparecen en tu panel y ayudan a
									tus clientes a encontrarte.
								</p>
							</div>
							<div className="registerFormGrid">
								<div className="registerFormGrid__full">
									<LabelInputComponent
										label="Nombre del negocio"
										type="text"
										name="name"
										value={dataForm.name}
										required
										placeholder="Ej: Estudio Bienestar"
										onChange={handleChange}
									/>
								</div>
								<LabelSelectComponent onChange={handleChange} />
								<LabelInputComponent
									label="Calle"
									type="text"
									name="street"
									value={dataForm.street}
									required
									onChange={handleChange}
								/>
								<LabelInputComponent
									label="Número"
									type="text"
									name="number"
									value={dataForm.number}
									required
									onChange={handleChange}
								/>
								<div className="registerFormGrid__full">
									<LabelInputComponent
										label="Teléfono"
										type="tel"
										name="phone"
										value={dataForm.phone}
										required
										onChange={handleChange}
									/>
								</div>
							</div>
							<div className="registerActions">
								<Button
									type="button"
									variant="ghost"
									fontWeight="600"
									padding="1rem 1.4rem"
									margin="0"
									width="auto"
									onSubmit={goPrev}
								>
									Anterior
								</Button>
								<Button
									type="button"
									fontWeight="600"
									padding="1rem 1.5rem"
									margin="0"
									width="auto"
									onSubmit={goNext}
								>
									Continuar
								</Button>
							</div>
						</section>
					)}

					{step === 3 && (
						<section className="registerStep">
							<div className="registerStep__intro">
								<span className="registerStep__eyebrow">
									Paso 3 de 3
								</span>
								<h2>Creá tu cuenta y activá el plan</h2>
								<p>
									{selectedPlan ? (
										<>
											Vas a suscribirte al plan{" "}
											<strong>{selectedPlan.name}</strong>{" "}
											({selectedPlan.price}/mes).
										</>
									) : (
										"Completá tus datos de acceso para finalizar."
									)}
								</p>
							</div>

							<form
								className="registerForm"
								onSubmit={handleSubmit}
							>
								<div className="registerFormGrid">
									<LabelInputComponent
										label="Email de Mercado Pago"
										type="email"
										name="payer_email"
										value={dataForm.payer_email}
										required
										onChange={handleChange}
									/>
									<LabelInputComponent
										label="Email de contacto / login"
										type="email"
										name="email"
										value={dataForm.email}
										required
										onChange={handleChange}
									/>
									<LabelInputComponent
										label="Contraseña"
										type="password"
										name="password"
										value={dataForm.password}
										required
										onChange={handleChange}
									/>
									<LabelInputComponent
										label="Confirmar contraseña"
										type="password"
										name="confirmPassword"
										value={dataForm.confirmPassword}
										required
										onChange={handleChange}
									/>
								</div>

								<p className="registerEmailWarning">
									Asegurate de escribir correctamente las
									direcciones de correo electrónico.
								</p>

								<div className="registerHints">
									<div className="registerHint">
										<strong>Email de Mercado Pago</strong>
										<p>
											Debe ser el mismo de la cuenta con
											la que vas a pagar la suscripción.
										</p>
									</div>
									<div className="registerHint">
										<strong>Email de contacto</strong>
										<p>
											Lo usás para iniciar sesión y
											recibir notificaciones de Bookify.
											Podés repetir el mismo correo en
											ambos campos.
										</p>
									</div>
								</div>

								<div className="registerActions">
									<Button
										type="button"
										variant="ghost"
										fontWeight="600"
										padding="1rem 1.4rem"
										margin="0"
										width="auto"
										onSubmit={goPrev}
									>
										Anterior
									</Button>
									<Button
										type="submit"
										loading={isLoading}
										fontWeight="700"
										padding="1rem 1.6rem"
										margin="0"
										width="auto"
										iconSVG={
											!isLoading ? (
												<CreditCardIcon
													width="18"
													height="18"
													fill="currentColor"
												/>
											) : undefined
										}
										reverse
									>
										Suscribirme con Mercado Pago
									</Button>
								</div>
							</form>
						</section>
					)}
				</div>

				<p className="registerMain__footer">
					¿Ya tenés cuenta?{" "}
					<Link to="/login/company">Iniciá sesión</Link>
				</p>
			</main>
		</div>
	);
};

export default FormRegister;
