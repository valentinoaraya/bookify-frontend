import './App.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './components/Home/Home'
import FormLogin from './components/LoginRegisterForms/FormLogin/FormLogin.tsx'
import FormRegister from './components/LoginRegisterForms/FormRegister/FormRegister.tsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <main className='mainPage'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login/:loginTo' element={<FormLogin />} />
            <Route path='/register/:registerTo' element={<FormRegister />} />
          </Routes>
        </main>
      </BrowserRouter>
    </>
  )
}

export default App
