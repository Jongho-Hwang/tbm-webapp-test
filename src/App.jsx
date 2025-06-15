// src/App.jsx
import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import { currentUser } from './services/localAuth';

/* ───────── 페이지 컴포넌트 ───────── */
import Login               from './pages/Login.jsx';
import ChangePassword      from './pages/ChangePassword.jsx';
import AdminDashboard      from './pages/AdminDashboard.jsx';
import SiteManager         from './pages/SiteManager.jsx';
import PartnerBoard        from './pages/PartnerBoard.jsx';
import PartnerNoticeManage from './pages/PartnerNoticeManage.jsx';
import TBMStatus           from './pages/TBMStatus.jsx';
import WorkerPage          from './pages/WorkerPage.jsx';

/* ───────── 인증 전용 래퍼 ───────── */
function PrivateRoute({ roles, children }) {
  const u = currentUser();
  if (!u || (roles && !roles.includes(u.role))) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  /* vite.config.js의 base 값과 동일해야 합니다 */
  const basename = import.meta.env.BASE_URL;

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        {/* ───── 공용(비로그인) ───── */}
        <Route path="/login"               element={<Login />} />
        <Route path="/worker/:partnerId"   element={<WorkerPage />} />

        {/* ───── 인증 필요 ───── */}
        <Route
          path="/change-password"
          element={
            <PrivateRoute roles={['head', 'site', 'partner']}>
              <ChangePassword />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['head']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/site"
          element={
            <PrivateRoute roles={['site']}>
              <SiteManager />
            </PrivateRoute>
          }
        />

        <Route
          path="/board/:partnerId"
          element={
            <PrivateRoute roles={['partner']}>
              <PartnerBoard />
            </PrivateRoute>
          }
        />

        <Route
          path="/board/:partnerId/manage"
          element={
            <PrivateRoute roles={['partner']}>
              <PartnerNoticeManage />
            </PrivateRoute>
          }
        />

        <Route
          path="/tbm-status"
          element={
            <PrivateRoute roles={['head', 'site']}>
              <TBMStatus />
            </PrivateRoute>
          }
        />

        {/* ───── 기본: 로그인 ───── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
