import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import GuideNavbar from "./guideComponents/GuideNavbar";
import Contactbar from "./guideComponents/Contactbar";
import CategoryForm from "./forms/CategoryForm";
import ProfielPass from "./forms/ProfilePassword";
import EditCategoryForm from "./forms/EditCategoryForm";
import PlaceForm from "./forms/PlaceForm";
import Place from "./components/Places";
import UserData from "./forms/updateUserForm";
import ErrorPage from "./components/ErrorPage";
import HomePage from "./components/HomePage";
import Login from "./auth/Login";
import Register from "./auth/Register";
import ProtectedRoute from "../security/ProtectedRoute";

import "./App.css";

function App() {
  const location = useLocation();

  // Rutas sin Navbar/Footer
  const noNavbarRoutes = ["/", "/register"];
  const noFooterbarRoutes = ["/", "/register"];

  const showNavbar = !noNavbarRoutes.includes(location.pathname);
  const showFooterbar = !noFooterbarRoutes.includes(location.pathname);

  return (
    <div className="app-container">
      <div className="nav-bar">{showNavbar && <GuideNavbar />}</div>

      <div className="content-container">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/home" element={<ProtectedRoute allowedRoles={["ADMIN","USER"]}><HomePage /></ProtectedRoute>} />
          <Route path="/home/profile" element={<ProtectedRoute allowedRoles={["ADMIN","USER"]}><UserData /></ProtectedRoute>} />
          <Route path="/places/:categoryName" element={<ProtectedRoute allowedRoles={["ADMIN","USER"]}><Place /></ProtectedRoute>} />
          <Route path="/profile/password" element={<ProtectedRoute allowedRoles={["ADMIN","USER"]}><ProfielPass /></ProtectedRoute>} />
          <Route path="/:slug/*" element={<ErrorPage />} />
          <Route path="/:slug" element={<Navigate to="/home" replace />} />

          <Route
            path="/home/CForm"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <CategoryForm />
              </ProtectedRoute>
            }EditCategoryForm
          /><Route
            path="/home/PForm/:categoryName"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PlaceForm />
              </ProtectedRoute>
            }
          /><Route
            path="/home/edit/category"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EditCategoryForm />
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
