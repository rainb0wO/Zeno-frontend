import { useCallback, useEffect, useState } from 'react';
import { Button, Drawer, Dropdown, Grid, Layout, Menu, Select, Space, Typography, message } from 'antd';
import {
  ApartmentOutlined,
  BuildOutlined,
  DollarOutlined,
  HomeOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  TeamOutlined,
  UserOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../services/auth';
import { factoryApi } from '../services/factory';
import { useFactoryStore } from '../stores/factoryStore';
import { useUserStore } from '../stores/userStore';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  { key: '/dashboard', label: '仪表盘', icon: <HomeOutlined /> },
  { key: '/factory', label: '厂区', icon: <BuildOutlined /> },
  { key: '/department', label: '部门', icon: <ApartmentOutlined /> },
  { key: '/personnel', label: '员工', icon: <TeamOutlined /> },
  { key: '/capacity', label: '生产计划', icon: <BarChartOutlined /> },
  { key: '/salary', label: '工资', icon: <DollarOutlined /> },
];

const MainLayout = () => {
  const screens = Grid.useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, clearAuth } = useUserStore();
  const { factories, currentFactory, setFactories, setCurrentFactory } = useFactoryStore();

  useEffect(() => {
    let alive = true;
    factoryApi.list()
      .then((list) => {
        if (!alive) return;
        setFactories(list);
        const preferred = list.find((item) => item.id === user?.factoryId) || list[0];
        if (preferred) setCurrentFactory(preferred);
      })
      .catch(() => {
        if (alive) message.error('厂区列表加载失败');
      });
    return () => { alive = false; };
  }, [user?.factoryId, setFactories, setCurrentFactory]);

  const switchFactory = useCallback(async (factoryId: string) => {
    const factory = factories.find((item) => item.id === factoryId);
    if (!factory) return;
    try {
      const result = await authApi.switchFactory(factoryId);
      if (result.user) useUserStore.getState().setUser(result.user);
      else useUserStore.getState().updateFactoryId(result.factoryId);
      setCurrentFactory(factory);
      message.success(result.message || `已切换到${factory.name}`);
    } catch {
      message.error('切换厂区失败');
    }
  }, [factories, setCurrentFactory]);

  const logout = () => {
    clearAuth();
    authApi.logout();
  };

  const onMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const selected = menuItems.find((item) => location.pathname === item.key || location.pathname.startsWith(`${item.key}/`))?.key;

  const menu = (
    <Menu
      mode="inline"
      selectedKeys={selected ? [selected] : []}
      items={menuItems}
      onClick={onMenuClick}
    />
  );

  return (
    <Layout className="main-layout">
      {screens.lg && (
        <Sider collapsible collapsed={collapsed} trigger={null} width={220} className="main-sider" theme="dark">
          <div className="logo-container">
            <img src="/zeno-logo.png" alt="Zeno" className="sidebar-logo" style={{ width: collapsed ? 40 : '70%' }} />
          </div>
          <Menu theme="dark" mode="inline" selectedKeys={selected ? [selected] : []} items={menuItems} onClick={onMenuClick} className="main-menu" />
        </Sider>
      )}
      {!screens.lg && (
        <Drawer placement="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }} width={240}>
          <div className="logo-container" style={{ paddingTop: 16 }}>
            <img src="/zeno-logo.png" alt="Zeno" style={{ width: '60%' }} />
          </div>
          {menu}
        </Drawer>
      )}
      <Layout className="main-content-wrapper">
        <Header className="main-header">
          <Button
            type="text"
            className="menu-toggle"
            icon={screens.lg ? (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />) : <MenuUnfoldOutlined />}
            onClick={() => (screens.lg ? setCollapsed((value) => !value) : setDrawerOpen(true))}
          />
          <div className="header-left">
            <Title level={4} className="app-title">{screens.md ? 'Zeno生产辅助管理平台' : 'Zeno'}</Title>
            <Select
              value={currentFactory?.id}
              placeholder="厂区"
              className="factory-select"
              style={{ width: screens.md ? 180 : 110 }}
              options={factories.map((factory) => ({ value: factory.id, label: factory.name }))}
              onChange={switchFactory}
            />
          </div>
          <Space className="header-right">
            <Dropdown
              menu={{
                items: [{ key: 'logout', label: '退出登录', icon: <LogoutOutlined />, danger: true }],
                onClick: ({ key }) => { if (key === 'logout') logout(); },
              }}
            >
              <Button type="primary" icon={<UserOutlined />}>
                {screens.md ? `${user?.username || '用户'}（${user?.role || ''}）` : (user?.username || '用户')}
              </Button>
            </Dropdown>
          </Space>
        </Header>
        <Content className="main-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
