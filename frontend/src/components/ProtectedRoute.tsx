import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  // still checking localstorage for token
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // not logged in -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace/>;
  }

  // logged in but not admin -> redirect to home
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" />;
  }

  // all checks passed -> show the page
  return <>{children}</>;
};

export default ProtectedRoute;