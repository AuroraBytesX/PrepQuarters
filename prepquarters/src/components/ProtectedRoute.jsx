import { Navigate, useLocation } from "react-router-dom";

/**
 * Route protection wrapper for authenticated candidate pages.
 */
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("prepquartersToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
