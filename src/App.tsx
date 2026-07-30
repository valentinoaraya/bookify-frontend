import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from './components/Home/Home.tsx'
import FormLogin from './components/LoginRegisterForms/FormLogin/FormLogin.tsx'
import FormRegister from './components/LoginRegisterForms/FormRegister/FormRegister.tsx'
import UserPanel from './components/UserCompanyPanels/UserPanel/UserPanel.tsx'
import CompanyPanel from './components/UserCompanyPanels/CompanyPanel/CompanyPanel.tsx'
import CheckoutConfirmAppointment from './components/CheckoutConfirmAppointment/CheckoutConfirmAppointment.tsx'
import ProcessingPayment from './components/ProcessingPayment/ProcessingPayment.tsx'
import { CompanyProvider } from './contexts/CompanyContext.tsx'
import { UserProvider } from './contexts/UserContext.tsx'
import CancelAppointment from './components/CancelAppointment/CancelAppointment.tsx'
import Panel from './components/Panel/Panel.tsx'
import ProtectedRoute from './features/auth/components/ProtectedRoute.tsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <main className='mainPage'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/panel/mercadopago-success' element={<Panel />} />
            <Route path='/panel/mercadopago-error' element={<Panel />} />
            <Route path='/login/:loginTo' element={<FormLogin />} />
            <Route path='/cancel/:appointmentRef' element={<CancelAppointment />} />
            <Route path='/register' element={<FormRegister />} />
            <Route path='/register/:registerTo' element={<Navigate to="/register" replace />} />
            <Route path='/c/:company_id' element={
              <UserProvider>
                <UserPanel />
              </UserProvider>
            } />
            <Route path='/company-panel' element={
              <ProtectedRoute>
                <CompanyProvider>
                  <CompanyPanel />
                </CompanyProvider>
              </ProtectedRoute>
            } />
            <Route path='/checkout' element={
              <CheckoutConfirmAppointment />
            } />
            <Route path='/processingpayment' element={<ProcessingPayment />} />
          </Routes>
        </main>
      </BrowserRouter>
    </>
  )
}

export default App
