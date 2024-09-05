import Home from './components/Home/Home'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LoginRegisterCompany from './components/LoginRegister/LoginRegisterCompany'
import LoginRegisterUser from './components/LoginRegister/LoginRegisterUser'
import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <main className='mainPage'>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/login-user' element={<LoginRegisterUser />} />
            <Route path='/login-company' element={<LoginRegisterCompany />} />
          </Routes>
        </main>
      </BrowserRouter>
    </>
  )
}

export default App
