import { useState } from 'react';
import { Button, Space, Modal, Form, Input, message } from 'antd';
import {
  SyncOutlined,
  SettingOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/project';
import { useProjectStore } from '@/store/projectStore';
import type { Project, UpdateProjectParams } from '@/types/project';

interface ProjectToolbarProps {
  project: Project;
}

const ProjectToolbar: React.FC<ProjectToolbarProps> = ({ project }) => {
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { updateProject } = useProjectStore();

  // 同步仓库
  const syncMutation = useMutation({
    mutationFn: (name: string) => projectApi.importProjectRepo(name),
    onSuccess: (response) => {
      if (response.code === 0 || response.message) {
        message.success(response.message || '仓库同步成功');
        queryClient.invalidateQueries({ queryKey: ['project', project.name] });
      } else {
        message.error(response.message || '同步失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '同步失败';
      message.error(errorMessage);
    },
  });

  // 更新项目
  const updateMutation = useMutation({
    mutationFn: (params: UpdateProjectParams) => projectApi.updateProject(params),
    onSuccess: (response) => {
      if (response.code === 0 || response.message === '项目更新成功') {
        message.success('项目更新成功');
        setIsConfigModalOpen(false);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['project', project.name] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        if (response.data) {
          updateProject(response.data);
        }
      } else {
        message.error(response.message || '更新失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '更新失败';
      message.error(errorMessage);
    },
  });

  const handleSync = () => {
    if (!project.repo_url) {
      message.warning('请先配置仓库地址');
      setIsConfigModalOpen(true);
      return;
    }
    syncMutation.mutate(project.name);
  };

  const handleConfig = () => {
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      repo_url: project.repo_url,
    });
    setIsConfigModalOpen(true);
  };

  const handleConfigOk = async () => {
    try {
      const values = await form.validateFields();
      updateMutation.mutate({
        pre_name: project.name,
        ...values,
      });
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-800 mr-4">{project.name}</h2>
        {project.description && (
          <span className="text-gray-500 text-sm">{project.description}</span>
        )}
      </div>
      <Space>
        <Button
          icon={<SyncOutlined />}
          loading={syncMutation.isPending}
          onClick={handleSync}
        >
          同步仓库
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            queryClient.invalidateQueries({ queryKey: ['project', project.name] });
            message.info('已刷新');
          }}
        >
          刷新
        </Button>
        <Button
          icon={<SettingOutlined />}
          onClick={handleConfig}
        >
          配置
        </Button>
      </Space>

      <Modal
        title="项目配置"
        open={isConfigModalOpen}
        onOk={handleConfigOk}
        onCancel={() => {
          setIsConfigModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={updateMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称!' }]}
          >
            <Input placeholder="请输入项目名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="项目描述"
          >
            <Input.TextArea
              placeholder="请输入项目描述"
              rows={3}
            />
          </Form.Item>
          <Form.Item
            name="repo_url"
            label="仓库地址"
            rules={[
              { type: 'url', message: '请输入有效的 URL!' },
            ]}
          >
            <Input placeholder="请输入 Git 仓库地址" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProjectToolbar;

