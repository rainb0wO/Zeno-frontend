import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Menu, Dropdown, Button, Space, Select, message, Typography } from 'antd';
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
  CalendarOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { useFactoryStore } from '../stores/factoryStore';
import { authApi } from '../services/auth';
import { factoryApi } from '../services/factory';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { Option } = Select;
const { Title } = Typography;

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const navigate = useNavigate();
  const { user, clearAuth, updateFactoryId, isAuthenticated } = useUserStore();
  const { currentFactory, factories, setCurrentFactory, setFactories } = useFactoryStore();

  // 加载厂区列表 - 仅在用户认证后执行一次
  useEffect(() => {
    let isMounted = true;
    
    const loadFactories = async () => {
      try {
        const response = await factoryApi.getFactories();
        if (!isMounted) return;
        
        setFactories(response.factories);
        
        // 如果用户有默认厂区，设置为当前厂区
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
    
    // 只有在用户认证且厂区列表为空时才加载
    if (user && isAuthenticated && factories.length === 0) {
      loadFactories();
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, isAuthenticated]); // 移除会导致无限循环的依赖项

  // 根据用户角色动态生成菜单项 - 使用 useMemo 优化
  const menuItems = useMemo(() => {
    const baseItems = [
      {
        key: '/dashboard',
        label: '仪表板',
        icon: <HomeOutlined />
      },
      {
        key: '/factory',
        label: '厂区管理',
        icon: <BuildOutlined />
      },
      {
        key: '/capacity',
        label: '产能管理',
        icon: <BarChartOutlined />
      },
      {
        key: '/template-library',
        label: '模板库管理',
        icon: <AppstoreOutlined />
      },
      {
        key: '/salary',
        label: '工资计算',
        icon: <DollarOutlined />
      },
      {
        key: '/personnel',
        label: '人员管理',
        icon: <TeamOutlined />
      },
      {
        key: '/logistics',
        label: '物流管理',
        icon: <TruckOutlined />
      },
      {
        key: '/attendance',
        label: '考勤管理',
        icon: <ClockCircleOutlined />
      },
      {
        key: '/schedule',
        label: '排班管理',
        icon: <CalendarOutlined />
      }
    ];

    return baseItems;
  }, []);

  const handleLogout = () => {
    clearAuth();
    authApi.logout();
    message.success('退出登录成功');
  };

  // 处理厂区切换 - 使用 useCallback 优化
  const handleFactoryChange = useCallback((factoryId: string) => {
    const factory = factories.find(f => f.id === factoryId);
    if (factory) {
      setCurrentFactory(factory);
      updateFactoryId(factoryId);
      message.success(`已切换到${factory.name}`);
    }
  }, [factories, setCurrentFactory, updateFactoryId]);

  const userMenu = [
    { key: 'personal-settings', label: '个人设置', icon: <UserOutlined /> },
    { key: 'system-settings', label: '系统设置', icon: <SettingOutlined /> },
    { key: 'logout', label: '退出登录', danger: true, icon: <LogoutOutlined /> }
  ];

  const handleMenuClick = useCallback(({ key }: { key: string }) => {
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'personal-settings') {
      navigate('/personal-settings');
    } else if (key === 'system-settings') {
      navigate('/system-settings');
    }
  }, [navigate]);

  // 侧边栏切换 - 使用 useCallback 优化
  const toggleSidebar = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  return (
    <Layout className="main-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
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
              height: 'auto',
              transition: 'width 0.2s'
            }}
          />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['/dashboard']}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="main-menu"
        />
      </Sider>
      <Layout className="main-content-wrapper">
        <Header className="main-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
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
                <Option key={factory.id} value={factory.id}>{factory.name}</Option>
              ))}
            </Select>
          </div>
          <Space className="header-right">
            <Dropdown
              menu={{ items: userMenu, onClick: handleMenuClick }}
              placement="bottomRight"
              trigger={['click']}
            >
              <Button
                type="primary"
                icon={<UserOutlined />}
                className="user-button"
                size="large"
              >
                {user?.username || '管理员'} ({user?.role || 'USER'})
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