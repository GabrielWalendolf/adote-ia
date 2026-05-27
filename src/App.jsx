import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Adocao from './pages/Adocao.jsx'
import Pets from './pages/Pets.jsx'
import Cadastro from './pages/Cadastro.jsx'
import Admin from './pages/Admin.jsx'
import Memorias from './pages/Memorias.jsx'
import RAGBusca from './pages/RAGBusca.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-brand-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/adocao"        element={<Adocao />} />
            <Route path="/pets"          element={<Pets />} />
            <Route path="/cadastro"      element={<Cadastro />} />
            <Route path="/admin"         element={<Admin />} />
            <Route path="/memorias/:id"  element={<Memorias />} />
            <Route path="/rag"           element={<RAGBusca />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
