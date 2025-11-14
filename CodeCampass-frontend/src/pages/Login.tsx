import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/authStore';
import type { LoginParams } from '@/types/user';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const onFinish = async (values: LoginParams) => {
    setLoading(true);
    try {
      const response = await authApi.login(values);
      if (response.code === 0 && response.message === '登录成功') {
        const token = response.token || response.data?.token;
        const user = response.data;
        if (token && user) {
          login(user, token);
          message.success('登录成功');
          navigate('/');
        } else {
          message.error('登录失败：无效的响应数据');
        }
      } else {
        message.error(response.message || '登录失败');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || '登录失败';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CodeCampass</h1>
          <p className="text-gray-600">代码项目管理平台</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入用户名!' }]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码!' }]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
              className="h-10"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="text-center mt-4">
          <span className="text-gray-600">还没有账号？</span>
          <Link to="/register" className="text-blue-600 hover:text-blue-800 ml-2">
            立即注册
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;

