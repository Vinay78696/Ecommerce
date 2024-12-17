import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";
import Login from "./Pages/Login";

function App() {
  return (
    <BrowserRouter>
      <div>
        {/* Navbar is displayed for all routes */}
        <Navbar />

        {/* Define main application routes */}
        <Routes>
          {/* Login Route */}
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard with nested routes */}
          <Route path="/admin/*" element={<Admin />} />
        </Routes>

        {/* Footer is displayed for all routes */}
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
