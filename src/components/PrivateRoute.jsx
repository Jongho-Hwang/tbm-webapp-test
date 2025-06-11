import React from "react";
import { Navigate } from "react-router-dom";
import { currentUser } from "../services/localAuth";

export default function PrivateRoute({ roles, children }) {
  const u = currentUser();
  if (!u || !roles.includes(u.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
