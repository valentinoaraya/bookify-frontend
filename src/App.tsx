import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home/Home'
import FormLogin from './components/LoginRegisterForms/FormLogin/FormLogin.tsx'
import FormRegister from './components/LoginRegisterForms/FormRegister/FormRegister.tsx'
import UserPanel from './components/UserCompanyPanels/UserPanel/UserPanel.tsx'
import CompanyPanel from './components/UserCompanyPanels/CompanyPanel/CompanyPanel.tsx'
import CheckoutConfirmAppointment from './components/CheckoutConfirmAppointment/CheckoutConfirmAppointment.tsx'
import ProcessingPayment from './components/ProcessingPayment/ProcessingPayment.tsx'
import { CompanyProvider } from './contexts/CompanyContext.tsx'
import { UserProvider } from './contexts/UserContext.tsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <main className='mainPage'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login/:loginTo' element={<FormLogin />} />
            <Route path='/register/:registerTo' element={<FormRegister />} />
            <Route path='/company/:company_id' element={
              <UserProvider>
                <UserPanel />
              </UserProvider>
            } />
            <Route path='/company-panel' element={
              <CompanyProvider>
                <CompanyPanel />
              </CompanyProvider>
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
