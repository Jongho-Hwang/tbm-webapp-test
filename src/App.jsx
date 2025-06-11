// File: src/App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import { currentUser, logout } from "./services/localAuth";

// 각 페이지 import
import Login from "./pages/Login.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import SiteManager from "./pages/SiteManager.jsx";
import PartnerBoard from "./pages/PartnerBoard.jsx";
import PartnerNoticeManage from "./pages/PartnerNoticeManage.jsx";
import TBMStatus from "./pages/TBMStatus.jsx"; // <== 반드시 컴포넌트명/파일명 통일

// 인증 라우트
function PrivateRoute({ roles, children }) {
  const user = currentUser();
  if (!user || (roles && !roles.includes(user.role))) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/change-password"
          element={
            <PrivateRoute roles={["head", "site", "partner"]}>
              <ChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute roles={["head"]}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/site"
          element={
            <PrivateRoute roles={["site"]}>
              <SiteManager />
            </PrivateRoute>
          }
        />

        <Route
          path="/board/:partnerId"
          element={
            <PrivateRoute roles={["partner"]}>
              <PartnerBoard />
            </PrivateRoute>
          }
        />

        <Route
          path="/board/:partnerId/manage"
          element={
            <PrivateRoute roles={["partner"]}>
              <PartnerNoticeManage />
            </PrivateRoute>
          }
        />

        {/* TBM 제출현황: 최고관리자/현장관리자 공통 */}
        <Route
          path="/tbm-status"
          element={
            <PrivateRoute roles={["head", "site"]}>
              <TBMStatus /> {/* 반드시 컴포넌트명과 import가 일치해야 함 */}
            </PrivateRoute>
          }
        />

        {/* 기본: 로그인으로 */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
