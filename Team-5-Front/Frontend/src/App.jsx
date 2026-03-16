import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GuideNavbar from "./guideComponents/GuideNavbar";
import Contactbar from "./guideComponents/Contactbar";
import CategoryForm from "./forms/CategoryForm";
import PlaceForm from "./forms/PlaceForm";
import Place from "./components/Places";
import UserData from "./forms/UserData";
import ErrorPage from "./components/ErrorPage";
import HomePage from "./components/HomePage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ProtectedRoute from "../security/ProtectedRoute";

import "./App.css";

function App() {
  const location = useLocation();

  // Rutas sin Navbar/Footer
  const noNavbarRoutes = ["/login", "/register"];
  const noFooterbarRoutes = ["/login", "/register"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);
  const showFooterbar = !noFooterbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      <div className="nav-bar">{showNavbar && <GuideNavbar />}</div>

      <div className="content-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/home/profile" element={<UserData />} />
          <Route path="/places/:categoryName" element={<Place />} />
          <Route path="/:slug/*" element={<ErrorPage />} />
          <Route path="/:slug" element={<Navigate to="/home" replace />} />

          <Route
            path="/home/CForm"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CategoryForm />
              </ProtectedRoute>
            }
          /><Route
            path="/home/PForm/:categoryName"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PlaceForm />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
      {showFooterbar && <Contactbar />}
    </div>
  );
}

export default App;
