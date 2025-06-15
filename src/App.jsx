// File: src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { currentUser } from "./services/localAuth";

/* ───────── 기존 페이지 ───────── */
import Login                from "./pages/Login.jsx";
import ChangePassword       from "./pages/ChangePassword.jsx";
import AdminDashboard       from "./pages/AdminDashboard.jsx";
import SiteManager          from "./pages/SiteManager.jsx";
import PartnerBoard         from "./pages/PartnerBoard.jsx";
import PartnerNoticeManage  from "./pages/PartnerNoticeManage.jsx";
import TBMStatus            from "./pages/TBMStatus.jsx";

/* ───────── 새로 추가되는 근로자(Worker) 페이지 ───────── */
import WorkerPage           from "./pages/WorkerPage.jsx";

/* ───────── 인증 전용 래퍼 ───────── */
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
        {/* ───── 공용(비로그인) 라우트 ───── */}
        <Route path="/login" element={<Login />} />
        {/* 근로자용 QR 진입 경로 ― 인증 없이 접속 */}
        <Route path="/worker/:partnerId" element={<WorkerPage />} />

        {/* ───── 인증 필요한 라우트 ───── */}
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

        {/* TBM 제출현황 (최고‧현장 관리자) */}
        <Route
          path="/tbm-status"
          element={
            <PrivateRoute roles={["head", "site"]}>
              <TBMStatus />
            </PrivateRoute>
          }
        />

        {/* ───── 기본: 로그인으로 리다이렉트 ───── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
