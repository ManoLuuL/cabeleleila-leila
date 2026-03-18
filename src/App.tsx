import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Navbar } from './components/layout'
import { ClientPage, AdminPage } from './pages'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/"      element={<ClientPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
