import { Outlet, useNavigate } from 'react-router-dom';
import { Layout as AntLayout, Button, Dropdown, Avatar, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/api/auth';
import ProjectSidebar from './ProjectSidebar';
import TopBar from './TopBar';
import ApiKeyModal from './ApiKeyModal';
import './index.css';

const { Header, Sider, Content } = AntLayout;

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logoutStore();
      message.success('退出登录成功');
      navigate('/login');
    } catch (error: any) {
      logoutStore();
      message.error(error.message || '退出登录失败');
      navigate('/login');
    }
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
      onClick: () => {
        // TODO: 跳转到个人信息页
      },
    },
    {
      key: 'apiKey',
      icon: <KeyOutlined />,
      label: 'API Key 设置',
      onClick: () => {
        setApiKeyModalOpen(true);
      },
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      onClick: () => {
        // TODO: 跳转到设置页
      },
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <AntLayout className="h-screen">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={280}
        className="border-r border-gray-200"
      >
        <ProjectSidebar collapsed={collapsed} />
      </Sider>
      <AntLayout>
        <Header className="bg-white border-b border-gray-200 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="mr-4"
            />
            <TopBar onApiKeyClick={() => setApiKeyModalOpen(true)} />
          </div>
          <div className="flex items-center">
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center cursor-pointer hover:bg-gray-100 px-3 py-1 rounded">
                <Avatar
                  size="small"
                  icon={<UserOutlined />}
                  className="mr-2"
                />
                <span className="text-sm">{user?.name || '用户'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="bg-gray-50 overflow-auto">
          <Outlet />
        </Content>
      </AntLayout>
      <ApiKeyModal
        open={apiKeyModalOpen}
        onCancel={() => setApiKeyModalOpen(false)}
      />
    </AntLayout>
  );
};

export default Layout;

