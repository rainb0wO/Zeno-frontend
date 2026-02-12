import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Layout,
  Menu,
  Dropdown,
  Button,
  Space,
  message,
  Typography,
  Grid,
  Drawer,
  Alert
} from 'antd';
import Select from 'antd/es/select';
import {
  HomeOutlined,
  UserOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  BarChartOutlined,
  DollarOutlined,
  TruckOutlined,
  LogoutOutlined,
  BuildOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  AppstoreOutlined,
  CalendarOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useFactoryStore } from '../stores/factoryStore';
import { authApi } from '../services/auth';
import { factoryApi } from '../services/factory';
import './MainLayout.css';
import { ReadonlyProvider } from '../contexts/ReadonlyContext';
import { useIsMobile } from '../hooks/useIsMobile';

const { Header, Sider, Content } = Layout;

const { Title } = Typography;

const MainLayout: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth, updateFactoryId, isAuthenticated } = useUserStore();
  const { currentFactory, factories, setCurrentFactory, setFactories } = useFactoryStore();

  /* ----------------------------- 加载厂区列表 ----------------------------- */
  useEffect(() => {
    let isMounted = true;
    const loadFactories = async () => {
      try {
        const response = await factoryApi.getFactories();
        if (!isMounted) return;
        setFactories(response.factories);
        if (user?.factoryId && response.factories.length > 0) {
          const userFactory = response.factories.find(f => f.id === user.factoryId);
          if (userFactory) {
            setCurrentFactory(userFactory);
          } else if (response.factories.length > 0) {
            setCurrentFactory(response.factories[0]);
          }
        } else if (response.factories.length > 0) {
          setCurrentFactory(response.factories[0]);
        }
      } catch (error) {
        console.error('加载厂区列表失败:', error);
      }
    };

    if (user && isAuthenticated && factories.length === 0) {
      loadFactories();
    }
    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]);

  /* ----------------------------- 菜单 ----------------------------- */
  const menuItems = useMemo(() => {
    return [
      { key: '/dashboard', label: '仪表板', icon: <HomeOutlined /> },
      { key: '/factory', label: '厂区管理', icon: <BuildOutlined /> },
      { key: '/capacity', label: '产能管理', icon: <BarChartOutlined /> },
      { key: '/template-library', label: '模板库管理', icon: <AppstoreOutlined /> },
      { key: '/salary', label: '工资计算', icon: <DollarOutlined /> },
      { key: '/personnel', label: '人员管理', icon: <TeamOutlined /> },
      { key: '/department', label: '部门管理', icon: <ApartmentOutlined /> },
      { key: '/logistics', label: '物流管理', icon: <TruckOutlined /> },
      { key: '/attendance', label: '考勤管理', icon: <ClockCircleOutlined /> },
      { key: '/schedule', label: '排班管理', icon: <CalendarOutlined /> }
    ];
  }, []);

  const handleLogout = () => {
    clearAuth();
    authApi.logout();
    message.success('退出登录成功');
  };

  const handleFactoryChange = useCallback(
    async (factoryId: string) => {
      const factory = factories.find(f => f.id === factoryId);
      if (!factory) return;

      try {
        const res = await authApi.switchFactory(factoryId);

        // 以服务端返回的 user.factoryId 为准
        updateFactoryId(res.user.factoryId || factoryId);
        setCurrentFactory(factory);

        message.success(res.message || `已切换到${factory.name}`);
      } catch (error) {
        console.error('切换厂区失败:', error);
        message.error('切换厂区失败，请稍后重试');
      }
    },
    [factories, setCurrentFactory, updateFactoryId]
  );

  const userMenu = [
    { key: 'personal-settings', label: '个人设置', icon: <UserOutlined /> },
    { key: 'system-settings', label: '系统设置', icon: <SettingOutlined /> },
    { key: 'logout', label: '退出登录', danger: true, icon: <LogoutOutlined /> }
  ];

  const handleMenuClick = useCallback(
    ({ key }: { key: string }) => {
      if (key === 'logout') {
        handleLogout();
      } else if (key === 'personal-settings') {
        navigate('/personal-settings');
      } else if (key === 'system-settings') {
        navigate('/system-settings');
      }
    },
    [navigate]
  );

  /* ------------------------- 侧边栏 & 抽屉逻辑 ------------------------- */
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const onMenuClick = ({ key }: { key: string }) => {
    if (location.pathname !== key) {
      navigate(key);
    }
    if (!screens.lg) closeDrawer();
  };

  const isReadonlyRoute = useMemo(() => {
    const p = location.pathname;
    return (
      p.startsWith('/factory') ||
      p.startsWith('/capacity') ||
      p.startsWith('/template-library') ||
      p.startsWith('/salary') ||
      p.startsWith('/personnel') ||
      p.startsWith('/department') ||
      p.startsWith('/logistics') ||
      p.startsWith('/attendance') ||
      p.startsWith('/schedule')
    );
  }, [location.pathname]);

  const isMobileReadonly = isMobile && isReadonlyRoute;

  /* ----------------------------- 渲染 ----------------------------- */
  return (
    <ReadonlyProvider isReadonly={isMobileReadonly}>
      <Layout className="main-layout">
      {screens.lg && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          collapsedWidth={0}
          className="main-sider"
          trigger={null}
          width={240}
        >
          <div className="logo-container">
            <img
              src="/zeno-logo.png"
              alt="Zeno生产辅助"
              className="sidebar-logo"
              style={{
                width: collapsed ? '40px' : '80%',
                transition: 'width 0.2s'
              }}
            />
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={onMenuClick}
            className="main-menu"
          />
        </Sider>
      )}

      {/* 移动端 Drawer */}
      {!screens.lg && (
        <Drawer
          placement="left"
          width={240}
          open={drawerOpen}
          onClose={closeDrawer}
          bodyStyle={{ padding: 0 }}
        >
          <div className="logo-container" style={{ paddingTop: 16 }}>
            <img src="/zeno-logo.png" alt="Zeno生产辅助" style={{ width: '60%' }} />
          </div>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={onMenuClick}
          />
        </Drawer>
      )}

      <Layout className="main-content-wrapper">
        <Header className="main-header">
          <Button
            type="text"
            icon={screens.lg ? (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />) : <MenuUnfoldOutlined />} // 始终显示汉堡图标
            onClick={screens.lg ? toggleSidebar : openDrawer}
            className="menu-toggle"
          />

          <div className="header-left">
            <Title level={4} className="app-title">
              Zeno生产辅助管理平台
            </Title>
            <Select
              value={currentFactory?.id}
              style={{ width: 180 }}
              onChange={handleFactoryChange}
              placeholder="选择厂区"
              className="factory-select"
              size="large"
            >
              {factories.map(factory => (
                <Select.Option key={factory.id} value={factory.id}>
                  {factory.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <Space className="header-right">
            <Dropdown
              menu={{ items: userMenu, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button type="primary" icon={<UserOutlined />} className="user-button" size="large">
                {user?.username || '管理员'} ({user?.role || 'USER'})
              </Button>
            </Dropdown>
          </Space>
        </Header>

        <Content className="main-content">
          {isMobileReadonly && (
            <Alert
              message="该业务操作请在电脑端网页完成"
              type="info"
              showIcon
              banner
              style={{ marginBottom: 12 }}
            />
          )}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
    </ReadonlyProvider>
  );
};

export default MainLayout;
