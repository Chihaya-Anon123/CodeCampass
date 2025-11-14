import { useEffect } from 'react';
import { Modal, Form, Input, Button, message, Space, Popconfirm } from 'antd';
import { KeyOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeyApi } from '@/api/apiKey';

interface ApiKeyModalProps {
  open: boolean;
  onCancel: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ open, onCancel }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // 获取当前 API Key 状态
  const { data: keyInfo, isLoading } = useQuery({
    queryKey: ['openaiKey'],
    queryFn: async () => {
      const response = await apiKeyApi.getOpenAIKey();
      return response.data;
    },
    enabled: open,
  });

  // 设置 API Key
  const setKeyMutation = useMutation({
    mutationFn: (key: string) => apiKeyApi.setOpenAIKey(key),
    onSuccess: () => {
      message.success('API Key 设置成功');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['openaiKey'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '设置失败';
      message.error(errorMessage);
    },
  });

  // 删除 API Key
  const deleteKeyMutation = useMutation({
    mutationFn: () => apiKeyApi.deleteOpenAIKey(),
    onSuccess: () => {
      message.success('API Key 已删除');
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['openaiKey'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      message.error(errorMessage);
    },
  });

  useEffect(() => {
    if (open && keyInfo) {
      form.setFieldsValue({
        key: keyInfo.is_set ? '••••••••' : '',
      });
    }
  }, [open, keyInfo, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (values.key === '••••••••') {
        message.warning('请输入新的 API Key');
        return;
      }
      setKeyMutation.mutate(values.key);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  const handleDelete = () => {
    deleteKeyMutation.mutate();
  };

  return (
    <Modal
      title={
        <Space>
          <KeyOutlined />
          <span>OpenAI API Key 设置</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <div className="mb-4 text-sm text-gray-600">
        <p>设置 OpenAI API Key 以启用 AI 问答和代码分析功能。</p>
        <p className="mt-2">
          API Key 将安全存储在 Redis 中，仅用于您的账户。
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="key"
          label="OpenAI API Key"
          rules={[
            { required: true, message: '请输入 API Key!' },
            { min: 20, message: 'API Key 长度至少 20 个字符!' },
          ]}
        >
          <Input.Password
            placeholder={keyInfo?.is_set ? '已设置 API Key，输入新值以更新' : '请输入 OpenAI API Key'}
            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            disabled={isLoading}
          />
        </Form.Item>

        {keyInfo?.is_set && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <div className="text-sm text-green-700">
              <span className="font-semibold">当前状态：</span>已设置 API Key
              {keyInfo.key && (
                <div className="mt-1 font-mono text-xs">
                  {keyInfo.key}
                </div>
              )}
            </div>
          </div>
        )}

        <Form.Item>
          <Space>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={setKeyMutation.isPending}
              icon={<KeyOutlined />}
            >
              {keyInfo?.is_set ? '更新 API Key' : '设置 API Key'}
            </Button>
            {keyInfo?.is_set && (
              <Popconfirm
                title="确定要删除 API Key 吗？"
                description="删除后，AI 问答功能将不可用。"
                onConfirm={handleDelete}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  danger
                  loading={deleteKeyMutation.isPending}
                >
                  删除
                </Button>
              </Popconfirm>
            )}
            <Button onClick={onCancel}>取消</Button>
          </Space>
        </Form.Item>
      </Form>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
        <p className="font-semibold mb-1">提示：</p>
        <ul className="list-disc list-inside space-y-1">
          <li>API Key 可以从 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI Platform</a> 获取</li>
          <li>也可以使用 <a href="https://api.chatanywhere.org" target="_blank" rel="noopener noreferrer" className="underline">ChatAnywhere</a> 等服务提供的兼容 API Key</li>
          <li>API Key 将加密存储，仅用于您的账户</li>
        </ul>
      </div>
    </Modal>
  );
};

export default ApiKeyModal;

