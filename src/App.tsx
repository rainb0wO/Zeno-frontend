import { BrowserRouter as Router, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import { App as AntdApp, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Factory from './pages/factory/Factory';
import FactoryDetail from './pages/factory/FactoryDetail';
import Department from './pages/department/Department';
import Personnel from './pages/personnel/Personnel';
import PersonnelDetail from './pages/personnel/PersonnelDetail';
import Capacity from './pages/capacity/Capacity';
import CapacityDetail from './pages/capacity/CapacityDetail';
import GroupCapacityEntry from './pages/capacity/GroupCapacityEntry';
import Salary from './pages/salary/Salary';
import WeChatCallback from './pages/WeChatCallback';
import WeChatBind from './pages/WeChatBind';
import JoinFactory from './pages/JoinFactory';
import PersonalSettings from './pages/PersonalSettings';

function WeChatLanding() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = params.get('token');
  const bindTicket = params.get('bindTicket');

  useEffect(() => {
    if (location.pathname === '/auth/wechat/callback') return;
    if (!token && !bindTicket) return;
    navigate({ pathname: '/auth/wechat/callback', search: params.toString() }, { replace: true });
  }, [bindTicket, location.pathname, navigate, params, token]);

  return null;
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AntdApp>
        <Router>
          <WeChatLanding />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/join" element={<JoinFactory />} />
            <Route path="/auth/wechat/callback" element={<WeChatCallback />} />
            <Route path="/auth/wechat/bind" element={<WeChatBind />} />
            <Route path="/h5/group-capacity-entry" element={<GroupCapacityEntry />} />
            <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="factory" element={<Factory />} />
              <Route path="factory/:id" element={<FactoryDetail />} />
              <Route path="department" element={<Department />} />
              <Route path="personnel" element={<Personnel />} />
              <Route path="personnel/:id" element={<PersonnelDetail />} />
              <Route path="capacity" element={<Capacity />} />
              <Route path="capacity/:id" element={<CapacityDetail />} />
              <Route path="salary" element={<Salary />} />
              <Route path="personal-settings" element={<PersonalSettings />} />
            </Route>
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
