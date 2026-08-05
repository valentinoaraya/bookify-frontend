import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Button from "../../common/Button/Button.tsx";
import Title from "../../common/Title/Title.tsx";
import {
	ArrowReturnIcon,
	BellIcon,
	CalendarCheckIcon,
	ClipboardIcon,
	CloseIcon,
	CompanyIcon,
	CreditCardIcon,
	EmailIcon,
	MenuIcon,
	RocketIcon,
	UsersIcon,
} from "../../common/Icons/Icons.tsx";
import { plans } from "../../utils/plans.ts";
import "./Home.css";

const NAV_LINKS = [
	{ label: "Características", href: "#caracteristicas" },
	{ label: "Cómo funciona", href: "#como-funciona" },
	{ label: "Planes", href: "#planes" },
	{ label: "Preguntas", href: "#faq" },
];

const PAIN_POINTS = [
	"Agenda manual por WhatsApp, llamadas o planillas",
	"Turnos duplicados y errores de doble reserva",
	"Ausentismo de clientes que no dejan seña",
	"Cobro de señas desconectado de tus medios de pago",
	"Sin historial, estadísticas ni visibilidad real",
];

const SOLUTIONS = [
	"Portal de reservas propio, online y automático",
	"Control de capacidad por turno, sin choques",
	"Señas obligatorias + recordatorios por email",
	"Cobro integrado con Mercado Pago en tu cuenta",
	"Historial, estados y estadísticas en un panel",
];

const FEATURES = [
	{
		icon: <CreditCardIcon width="22" height="22" fill="currentColor" />,
		title: "Cobro de señas con Mercado Pago",
		description:
			"Vinculás tu cuenta con OAuth y cobrás la seña directo. Reserva temporal de 15 min que evita dobles cobros durante el pago.",
	},
	{
		icon: <BellIcon width="22" height="22" fill="currentColor" />,
		title: "Recordatorios automáticos",
		description:
			"Configurá avisos por email (24 hs, 1 h antes) por servicio. Se envían solos, con link de cancelación.",
	},
	{
		icon: <CalendarCheckIcon width="22" height="22" fill="currentColor" />,
		title: "Servicios y disponibilidad",
		description:
			"Creá servicios presenciales, online o a domicilio y generá franjas con intervalos y capacidad configurables.",
	},
	{
		icon: <ClipboardIcon width="22" height="22" fill="currentColor" />,
		title: "Historial y estadísticas",
		description:
			"Filtrá por fecha o servicio y seguí métricas: finalizados, cancelados, no asistió y pendientes de acción.",
	},
	{
		icon: <EmailIcon width="22" height="22" fill="currentColor" />,
		title: "Emails transaccionales",
		description:
			"Confirmación, cancelación, reembolso y recordatorio con plantillas profesionales para tus clientes.",
	},
	{
		icon: <UsersIcon width="22" height="22" fill="currentColor" />,
		title: "Servicios individuales y grupales",
		description:
			"Capacidad por horario para talleres o clases: varias reservas en un mismo turno sin conflictos.",
	},
	{
		icon: <ArrowReturnIcon width="22" height="22" fill="currentColor" />,
		title: "Reembolsos automáticos",
		description:
			"Políticas claras: 50 % si cancela el cliente, 100 % si cancelás vos o si el turno ya no está disponible.",
	},
];

const STEPS = [
	{
		icon: <RocketIcon width="22" height="22" fill="currentColor" />,
		title: "Creá tu cuenta y elegí tu plan",
		description:
			"Registrate en minutos. Empezá gratis o activá un plan de pago. Con Individual Plus o Equipo vinculás Mercado Pago para cobrar señas.",
	},
	{
		icon: <CalendarCheckIcon width="22" height="22" fill="currentColor" />,
		title: "Cargá servicios y disponibilidad",
		description:
			"Definí servicios, duración, precio y seña. Generá franjas horarias con la capacidad que necesites.",
	},
	{
		icon: <CompanyIcon width="22" height="22" fill="currentColor" />,
		title: "Compartí tu link de reservas",
		description:
			"Sumá tu URL pública a Instagram, WhatsApp o tu web. Tus clientes reservan solos, sin registrarse.",
	},
	{
		icon: <CreditCardIcon width="22" height="22" fill="currentColor" />,
		title: "Gestioná todo en tiempo real",
		description:
			"Recibí turnos y señas al instante, con recordatorios y reembolsos automáticos.",
	},
];

const FAQS = [
	{
		q: "¿Mis clientes necesitan crear una cuenta para reservar?",
		a: "No. Bookify le da a tu negocio una URL pública propia donde tus clientes eligen el servicio, el día y el horario, y reservan completando sólo sus datos de contacto.",
	},
	{
		q: "¿Cómo funciona el cobro de señas?",
		a: "Vinculás tu propia cuenta de Mercado Pago mediante OAuth y la seña se acredita directamente en tu cuenta. Durante el pago, el turno queda reservado de forma temporal por 15 minutos para evitar dobles reservas.",
	},
	{
		q: "¿Qué pasa si un cliente cancela?",
		a: "Las políticas de reembolso son automáticas: si cancela el cliente se devuelve el 50 % de la seña, si cancelás vos se devuelve el 100 %, y si el turno ya no está disponible se reembolsa el 100 %.",
	},
	{
		q: "¿Puedo ofrecer clases o talleres grupales?",
		a: "Sí. Cada horario tiene una capacidad configurable, así que podés recibir varias reservas en un mismo turno para clases, talleres o sesiones grupales.",
	},
	{
		q: "¿Los recordatorios se envían solos?",
		a: "Sí. Configurás cuántas horas antes querés avisar y Bookify envía los emails automáticamente en el momento exacto, con un link para cancelar si es necesario.",
	},
	{
		q: "¿Puedo cambiar de plan más adelante?",
		a: "Cuando quieras. El upgrade y el downgrade se ajustan a tu suscripción de Mercado Pago sin trámites extra.",
	},
];

const STATS = [
	{ value: "−70%", label: "de ausentismo con señas y recordatorios" },
	{ value: "24/7", label: "reservas online sin intervención manual" },
	{ value: "0", label: "registros: tus clientes reservan al instante" },
	{ value: "100%", label: "cobros digitales con Mercado Pago" },
];

const CheckMark = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
		<path
			d="M5 13l4 4L19 7"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const CrossMark = () => (
	<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
		<path
			d="M6 6l12 12M18 6 6 18"
			stroke="currentColor"
			strokeWidth="2.5"
			strokeLinecap="round"
		/>
	</svg>
);

function useReveal() {
	useEffect(() => {
		const elements = document.querySelectorAll(".home-reveal");
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add("is-visible");
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
		);

		elements.forEach((el) => observer.observe(el));
		return () => observer.disconnect();
	}, []);
}

const Home = () => {
	useReveal();

	return (
		<div className="homePage">
			<HomeNav />
			<main>
				<Hero />
				<StatsBar />
				<Problem />
				<Features />
				<HowItWorks />
				<Pricing />
				<FAQ />
				<FinalCTA />
			</main>
			<Footer />
			<StickyMobileCTA />
		</div>
	);
};

function HomeNav() {
	const [scrolled, setScrolled] = useState(false);
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [open]);

	const close = () => setOpen(false);

	return (
		<header className={`homeNav ${scrolled ? "homeNav--scrolled" : ""}`}>
			<nav className="homeNav__inner">
				<a
					href="#inicio"
					className="homeNav__brand"
					aria-label="Bookify inicio"
				>
					<span className="homeBrandMark">Bookify</span>
				</a>

				<ul className="homeNav__links">
					{NAV_LINKS.map((link) => (
						<li key={link.href}>
							<a href={link.href}>{link.label}</a>
						</li>
					))}
				</ul>

				<div className="homeNav__actions">
					<Link to="/login/company" className="homeNav__login">
						Iniciar sesión
					</Link>
					<Link to="/register" className="homeNav__ctaLink">
						<Button
							iconSVG={
								<RocketIcon
									width="20"
									height="20"
									fill="currentColor"
								/>
							}
							reverse
							fontWeight="600"
							fontSize="0.9rem"
							padding="0.65rem 1.25rem"
							margin="0"
							width="auto"
						>
							Empezar ahora
						</Button>
					</Link>
				</div>

				<button
					type="button"
					className="homeNav__menuBtn"
					onClick={() => setOpen((v) => !v)}
					aria-label={open ? "Cerrar menú" : "Abrir menú"}
					aria-expanded={open}
				>
					{open ? (
						<CloseIcon width="22" height="22" fill="currentColor" />
					) : (
						<MenuIcon width="22" height="22" fill="currentColor" />
					)}
				</button>
			</nav>

			<div
				className={`homeNav__mobile ${open ? "homeNav__mobile--open" : ""}`}
			>
				<ul>
					{NAV_LINKS.map((link) => (
						<li key={link.href}>
							<a href={link.href} onClick={close}>
								{link.label}
							</a>
						</li>
					))}
					<li className="homeNav__mobileActions">
						<Link to="/login/company" onClick={close}>
							<Button
								variant="ghost"
								fontWeight="600"
								padding="0.85rem"
								margin="0"
							>
								Iniciar sesión
							</Button>
						</Link>
						<Link to="/register" onClick={close}>
							<Button
								fontWeight="600"
								padding="0.85rem"
								margin="0"
							>
								Empezar ahora
							</Button>
						</Link>
					</li>
				</ul>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section id="inicio" className="homeHero">
			<div className="homeHero__bg" aria-hidden>
				<div className="homeHero__blob homeHero__blob--a" />
				<div className="homeHero__blob homeHero__blob--b" />
				<div className="homeHero__blob homeHero__blob--c" />
				<div className="homeHero__dots" />
			</div>

			<div className="homeContainer homeHero__content">
				<div className="homeHero__copy home-reveal">
					<span className="homePill">
						<span className="homePill__dot" />
						Turnos online + cobro de señas con Mercado Pago
					</span>

					<Title
						fontSize="clamp(3.25rem, 9vw, 6rem)"
						margin="0 0 0.35rem 0"
					>
						Bookify
					</Title>

					<h2 className="homeHero__headline">
						Digitalizá tu agenda y{" "}
						<span className="homeTextGradient">
							dejá de perder turnos
						</span>
					</h2>

					<p className="homeHero__lead">
						Centralizá el ciclo del turno: publicá disponibilidad,
						cobrá señas, enviá recordatorios automáticos y gestioná
						tu agenda en tiempo real. Tus clientes reservan{" "}
						<strong>sin crear cuenta</strong>.
					</p>

					<div className="homeHero__ctas">
						<Link to="/register" className="homeHero__ctaLink">
							<Button
								iconSVG={
									<RocketIcon
										width="20"
										height="20"
										fill="currentColor"
									/>
								}
								reverse
								fontWeight="600"
								padding="1rem 1.5rem"
								margin="0"
								width="100%"
							>
								Empezar ahora
							</Button>
						</Link>
						<a href="#como-funciona" className="homeHero__ctaLink">
							<Button
								variant="ghost"
								fontWeight="600"
								padding="1rem 1.5rem"
								margin="0"
								width="100%"
							>
								Ver cómo funciona
							</Button>
						</a>
					</div>

					<div className="homeHero__trust">
						<span>
							<CheckMark /> Listo en minutos
						</span>
						<span>
							<CheckMark /> Clientes sin registro
						</span>
						<span>
							<CheckMark /> Soporte en español
						</span>
					</div>
				</div>

				<div className="homeHero__mockup home-reveal">
					<DashboardMockup />
				</div>
			</div>
		</section>
	);
}

function DashboardMockup() {
	const appointments = [
		{
			name: "María González",
			service: "Consulta",
			mode: "Presencial",
			modeClass: "presencial",
			time: "10:30",
			duration: "45 min",
		},
		{
			name: "Lucas Fernández",
			service: "Sesión online",
			mode: "Virtual",
			modeClass: "online",
			time: "12:00",
			duration: "60 min",
		},
		{
			name: "Ana Martínez",
			service: "Control",
			mode: "Presencial",
			modeClass: "presencial",
			time: "15:45",
			duration: "30 min",
		},
	];

	return (
		<div className="homeMockup">
			<div className="homeMockup__panel">
				<div className="homeMockup__tabs" role="tablist" aria-hidden>
					<span className="homeMockup__tab is-active">
						Próximos turnos
					</span>
					<span className="homeMockup__tab">Historial</span>
					<span className="homeMockup__tab">Servicios</span>
				</div>

				<div className="homeMockup__section">
					<div className="homeMockup__sectionHead">
						<p className="homeMockup__sectionTitle">
							Próximos turnos
						</p>
						<div className="homeMockup__filters">
							<span>Hoy</span>
							<span className="is-active">Esta semana</span>
							<span>Este mes</span>
							<span>Todos</span>
						</div>
					</div>

					<div className="homeMockup__dayHead">
						<p>
							<strong>Hoy</strong>
							<span> · miércoles 29</span>
						</p>
						<span>3 turnos</span>
					</div>

					<div className="homeMockup__list">
						{appointments.map((appt) => (
							<article
								key={appt.name}
								className="homeMockup__row"
							>
								<div className="homeMockup__rowTime">
									<span className="homeMockup__rowTimeValue">
										{appt.time}
									</span>
									<span className="homeMockup__rowTimeUnit">
										hs
									</span>
								</div>
								<div className="homeMockup__rowClient">
									<p className="homeMockup__rowName">
										{appt.name}
									</p>
									<p className="homeMockup__rowMeta">
										<span className="homeMockup__rowService">
											{appt.service}
										</span>
										<span aria-hidden>·</span>
										<span
											className={`homeMockup__rowMode homeMockup__rowMode--${appt.modeClass}`}
										>
											{appt.mode}
										</span>
										<span aria-hidden>·</span>
										<span>{appt.duration}</span>
									</p>
								</div>
								<span className="homeMockup__rowAction">
									Finalizar
								</span>
							</article>
						))}
					</div>
				</div>
			</div>

			<div className="homeMockup__float homeMockup__float--left">
				<div className="homeMockup__floatIcon homeMockup__floatIcon--success">
					<CheckMark />
				</div>
				<div>
					<p>Nueva reserva</p>
					<span>Seña acreditada</span>
				</div>
			</div>

			<div className="homeMockup__float homeMockup__float--right">
				<div className="homeMockup__floatIcon homeMockup__floatIcon--accent">
					<BellIcon width="18" height="18" fill="currentColor" />
				</div>
				<div>
					<p>Recordatorio enviado</p>
					<span>24 hs antes del turno</span>
				</div>
			</div>
		</div>
	);
}

function StatsBar() {
	return (
		<section className="homeSection">
			<div className="homeContainer">
				<div className="homeStats home-reveal">
					{STATS.map((stat) => (
						<div key={stat.label} className="homeStats__item">
							<p className="homeTextGradient">{stat.value}</p>
							<span>{stat.label}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function Problem() {
	return (
		<section className="homeSection">
			<div className="homeContainer">
				<SectionHeader
					eyebrow="El problema"
					title="Gestionar turnos a mano te cuesta tiempo y dinero"
					lead="Las empresas de servicios pierden clientes por fricción, ausentismo y desorganización. Bookify lo resuelve de punta a punta."
				/>

				<div className="homeProblem home-reveal">
					<div className="homeProblem__card">
						<span className="bk-badge bk-badge--danger">
							Sin Bookify
						</span>
						<ul>
							{PAIN_POINTS.map((item) => (
								<li key={item}>
									<span className="homeProblem__icon homeProblem__icon--bad">
										<CrossMark />
									</span>
									{item}
								</li>
							))}
						</ul>
					</div>
					<div className="homeProblem__card homeProblem__card--brand">
						<span className="homeProblem__brandBadge">
							Con Bookify
						</span>
						<ul>
							{SOLUTIONS.map((item) => (
								<li key={item}>
									<span className="homeProblem__icon homeProblem__icon--good">
										<CheckMark />
									</span>
									{item}
								</li>
							))}
						</ul>
						<a
							href="#caracteristicas"
							className="homeProblem__link"
						>
							Descubrí todo lo que incluye →
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}

function Features() {
	return (
		<section id="caracteristicas" className="homeSection">
			<div className="homeContainer">
				<SectionHeader
					eyebrow="Todo en un solo lugar"
					title="Las herramientas que tu negocio de servicios necesita"
					lead="Desde la publicación de disponibilidad hasta el cobro, el recordatorio y el reembolso. Todo el ciclo del turno, automatizado."
				/>

				<div className="homeFeatures home-reveal">
					<div className="homeFeatures__spotlight">
						<div className="homeFeatures__icon">
							<CompanyIcon
								width="24"
								height="24"
								fill="currentColor"
							/>
						</div>
						<h3>Portal de reservas sin registro</h3>
						<p>
							Cada empresa tiene su URL pública única. Tus
							clientes ven tus servicios, eligen día y horario y
							reservan en segundos, sin crear ninguna cuenta.
						</p>
						<div className="homeFeatures__portalDemo">
							<div className="homeFeatures__url">
								<span className="homeFeatures__urlDot" />
								bookify.app/c/tu-negocio
							</div>
							<div className="homeFeatures__slots">
								{[
									"09:00",
									"10:30",
									"12:00",
									"14:00",
									"15:30",
									"17:00",
								].map((t, i) => (
									<span
										key={t}
										className={
											i === 1 ? "is-selected" : undefined
										}
									>
										{t}
									</span>
								))}
							</div>
						</div>
					</div>

					{FEATURES.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
}

function FeatureCard({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) {
	return (
		<article className="homeFeatureCard">
			<div className="homeFeatures__icon">{icon}</div>
			<h3>{title}</h3>
			<p>{description}</p>
		</article>
	);
}

function HowItWorks() {
	return (
		<section id="como-funciona" className="homeHow">
			<div className="homeHow__pattern" aria-hidden />
			<div className="homeContainer">
				<SectionHeader
					eyebrow="Cómo funciona"
					title="En marcha en 4 simples pasos"
					lead="Sin instalaciones ni configuraciones complejas. Empezás hoy y recibís tu primer turno el mismo día."
					light
				/>

				<div className="homeHow__grid home-reveal">
					{STEPS.map((step, index) => (
						<article key={step.title} className="homeHow__card">
							<span className="homeHow__num">0{index + 1}</span>
							<div className="homeHow__icon">{step.icon}</div>
							<h3>{step.title}</h3>
							<p>{step.description}</p>
						</article>
					))}
				</div>
			</div>
		</section>
	);
}

function Pricing() {
	return (
		<section id="planes" className="homeSection">
			<div className="homeContainer">
				<SectionHeader
					eyebrow="Planes y precios"
					title="Precios simples, sin sorpresas"
					lead="Elegí el plan que se ajusta a tu negocio. Cambiá de plan cuando quieras."
				/>

				<div className="homePricing home-reveal">
					{plans.map((plan) => {
						const featured = plan.id === "individual_plus";
						return (
							<article
								key={plan.id}
								className={`homePlan ${featured ? "homePlan--featured" : ""} ${
									!plan.available ? "homePlan--soon" : ""
								}`}
							>
								{featured && (
									<span className="homePlan__badge">
										Más elegido
									</span>
								)}
								{!plan.available && (
									<span className="homePlan__soon">
										Próximamente
									</span>
								)}
								<h3>{plan.name}</h3>
								<div className="homePlan__price">
									<span className="homePlan__amount">
										{plan.price}
									</span>
									<span className="homePlan__period">
										ARS / mes
									</span>
								</div>
								<ul>
									{plan.features.map((feature) => (
										<li key={feature}>
											<span>
												<CheckMark />
											</span>
											{feature}
										</li>
									))}
								</ul>
								{plan.available ? (
									<Link
										to="/register"
										className="homePlan__cta"
									>
										<Button
											variant={
												featured ? "accent" : "primary"
											}
											fontWeight="600"
											padding="0.9rem 1.25rem"
											margin="0"
											width="100%"
										>
											Empezar con {plan.name}
										</Button>
									</Link>
								) : (
									<Button
										disabled
										fontWeight="600"
										padding="0.9rem 1.25rem"
										margin="0"
										width="100%"
									>
										Próximamente
									</Button>
								)}
							</article>
						);
					})}
				</div>

				<p className="homePricing__note home-reveal">
					El plan Individual es gratis. Los planes de pago incluyen
					cobros con Mercado Pago, panel en tiempo real y
					actualizaciones sin costo. Precios en pesos argentinos.
				</p>
			</div>
		</section>
	);
}

function FAQ() {
	const [open, setOpen] = useState<number | null>(0);

	return (
		<section id="faq" className="homeSection">
			<div className="homeContainer">
				<SectionHeader
					eyebrow="Preguntas frecuentes"
					title="¿Tenés dudas? Las respondemos"
				/>

				<div className="homeFaq home-reveal">
					{FAQS.map((faq, index) => {
						const isOpen = open === index;
						return (
							<div
								key={faq.q}
								className={`homeFaq__item ${isOpen ? "is-open" : ""}`}
							>
								<button
									type="button"
									onClick={() =>
										setOpen(isOpen ? null : index)
									}
									aria-expanded={isOpen}
								>
									<span>{faq.q}</span>
									<span
										className="homeFaq__toggle"
										aria-hidden
									>
										{isOpen ? "−" : "+"}
									</span>
								</button>
								<div
									className="homeFaq__answer"
									style={{
										maxHeight: isOpen ? "240px" : "0",
									}}
								>
									<p>{faq.a}</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function FinalCTA() {
	return (
		<section className="homeSection homeSection--cta">
			<div className="homeContainer">
				<div className="homeFinalCta home-reveal">
					<div className="homeFinalCta__pattern" aria-hidden />
					<h2>Empezá a recibir turnos hoy mismo</h2>
					<p>
						Sumate a los profesionales que digitalizaron su agenda
						con Bookify. Configuralo en minutos y dejá que el
						sistema trabaje por vos.
					</p>
					<div className="homeFinalCta__actions">
						<Link
							to="/register"
							className="homeFinalCta__btn homeFinalCta__btn--primary"
						>
							<RocketIcon
								width="20"
								height="20"
								fill="currentColor"
							/>
							Crear una cuenta
						</Link>
						<Link
							to="/login/company"
							className="homeFinalCta__btn homeFinalCta__btn--secondary"
						>
							<CompanyIcon
								width="20"
								height="20"
								fill="currentColor"
							/>
							Ya tengo cuenta
						</Link>
					</div>
					<div className="homeFinalCta__trust">
						<span>
							<CheckMark /> Cancelás cuando quieras
						</span>
						<span>
							<CheckMark /> Sin costos de instalación
						</span>
					</div>
				</div>
			</div>
		</section>
	);
}

function Footer() {
	return (
		<footer className="homeFooter">
			<div className="homeContainer">
				<div className="homeFooter__grid">
					<div className="homeFooter__brand">
						<span className="homeBrandMark homeBrandMark--footer">
							Bookify
						</span>
						<p>
							Plataforma SaaS de gestión y reserva de turnos para
							profesionales y empresas de servicios.
						</p>
					</div>

					<div className="homeFooter__col">
						<h3>Producto</h3>
						<ul>
							<li>
								<a href="#caracteristicas">Características</a>
							</li>
							<li>
								<a href="#como-funciona">Cómo funciona</a>
							</li>
							<li>
								<a href="#planes">Planes</a>
							</li>
							<li>
								<a href="#faq">Preguntas frecuentes</a>
							</li>
						</ul>
					</div>

					<div className="homeFooter__col">
						<h3>Acceso</h3>
						<ul>
							<li>
								<Link to="/register">Crear cuenta</Link>
							</li>
							<li>
								<Link to="/login/company">
									Ingresar como empresa
								</Link>
							</li>
						</ul>
					</div>

					<div className="homeFooter__col">
						<h3>Empresa</h3>
						<ul>
							<li>
								<a
									className="homeFooter__company"
									href="https://aedestec.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									Aedes Technologies
								</a>
							</li>
							<li>
								<a
									href="https://aedestec.com"
									target="_blank"
									rel="noopener noreferrer"
								>
									aedestec.com
								</a>
							</li>
						</ul>
					</div>
				</div>

				<div className="homeFooter__bottom">
					<p>
						© {new Date().getFullYear()} Bookify. Un producto de{" "}
						<a
							href="https://aedestec.com"
							target="_blank"
							rel="noopener noreferrer"
						>
							Aedes Technologies
						</a>
						.
					</p>
					<p className="homeFooter__legal">
						Todos los derechos reservados.
					</p>
				</div>
			</div>
		</footer>
	);
}

function StickyMobileCTA() {
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const onScroll = () => setVisible(window.scrollY > 700);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return (
		<div className={`homeStickyCta ${visible ? "is-visible" : ""}`}>
			<Link to="/register">
				<Button
					iconSVG={
						<RocketIcon
							width="18"
							height="18"
							fill="currentColor"
						/>
					}
					reverse
					fontWeight="600"
					padding="0.95rem 1.25rem"
					margin="0"
					width="100%"
				>
					Empezar con Bookify
				</Button>
			</Link>
		</div>
	);
}

function SectionHeader({
	eyebrow,
	title,
	lead,
	light,
}: {
	eyebrow: string;
	title: string;
	lead?: string;
	light?: boolean;
}) {
	return (
		<div
			className={`homeSectionHeader home-reveal ${light ? "homeSectionHeader--light" : ""}`}
		>
			<span className="homeSectionHeader__eyebrow">{eyebrow}</span>
			<h2>{title}</h2>
			{lead && <p>{lead}</p>}
		</div>
	);
}

export default Home;
