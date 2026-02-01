import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';

// 页面组件
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

// 产能管理
import Capacity from './pages/capacity/Capacity';
import CapacityDetail from './pages/capacity/CapacityDetail';

// 工资计算
import Salary from './pages/salary/Salary';

// 人员管理
import Personnel from './pages/personnel/Personnel';

// 部门管理
import Department from './pages/department/Department';

// 物流管理
import Logistics from './pages/logistics/Logistics';

// 考勤管理
import Attendance from './pages/attendance/Attendance';

// 排班管理
import Schedule from './pages/schedule/Schedule';

// 厂区管理
import Factory from './pages/factory/Factory';
import FactoryDetail from './pages/factory/FactoryDetail';

// 设置页面
import PersonalSettings from './pages/PersonalSettings';
import SystemSettings from './pages/SystemSettings';
import Maintenance from './pages/Maintenance';

// 模板库管理
import TemplateLibrary from './pages/TemplateLibrary';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          {/* 认证路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/maintenance" element={<Maintenance />} />
          
          {/* 主应用路由 */}
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="factory" element={<Factory />} />
            <Route path="factory/:id" element={<FactoryDetail />} />
            <Route path="capacity" element={<Capacity />} />
            <Route path="capacity/:id" element={<CapacityDetail />} />
            <Route path="template-library" element={<TemplateLibrary />} />
            <Route path="salary" element={<Salary />} />
            <Route path="personnel" element={<Personnel />} />
            <Route path="department" element={<Department />} />
            <Route path="logistics" element={<Logistics />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="personal-settings" element={<PersonalSettings />} />
            <Route path="system-settings" element={<SystemSettings />} />
          </Route>
          
          {/* 404路由 */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
