import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import FormBuilder from "./pages/FormBuilder";
import EmployeeList from "./pages/EmployeeList";
import EmployeeCreate from "./pages/EmployeeCreate";
import EmployeeEdit from "./pages/EmployeeEdit";
import Protected from "./components/Protected";
import "./index.css";

const Root = () => (
  <BrowserRouter>
    <Routes>
      <Route
        path="/"
        element={
          <Protected>
            <App />
          </Protected>
        }
      >
        <Route index element={<EmployeeList />} />
        <Route path="employees/new" element={<EmployeeCreate />} />
        <Route path="employees/:id" element={<EmployeeEdit />} />
        <Route path="forms" element={<FormBuilder />} />
        <Route path="profile" element={<Profile />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

ReactDOM.createRoot(document.getElementById("root")).render(<Root />);
