import React from "react";
import {Navigate} from "react-router";

export const AttendeeLogin: React.FC = () => {
  return <Navigate to="/auth/login" replace />;
};

export default AttendeeLogin;
