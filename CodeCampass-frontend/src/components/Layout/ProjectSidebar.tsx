import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Menu, Button, Input, Modal, Form, message, Popconfirm } from 'antd';
import type { MenuProps } from 'antd';
import {
  ProjectOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/api/project';
import { useProjectStore } from '@/store/projectStore';
import type { Project, CreateProjectParams } from '@/types/project';
import './ProjectSidebar.css';

interface ProjectSidebarProps {
  collapsed: boolean;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const { projectName } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const { setCurrentProject, setProjects } = useProjectStore();

  // 获取项目列表
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.listProjects();
      const projects = response.projects || [];
      setProjects(projects);
      return projects;
    },
  });

  // 创建项目
  const createMutation = useMutation({
    mutationFn: (params: CreateProjectParams) => projectApi.createProject(params),
    onSuccess: (response) => {
      if (response.code === 0 || response.message === '项目创建成功') {
        message.success('项目创建成功');
        setIsModalOpen(false);
        form.resetFields();
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } else {
        message.error(response.message || '创建失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '创建失败';
      message.error(errorMessage);
    },
  });

  // 删除项目
  const deleteMutation = useMutation({
    mutationFn: (name: string) => projectApi.deleteProject(name),
    onSuccess: (response) => {
      if (response.code === 0 || response.message === '项目删除成功') {
        message.success('项目删除成功');
        if (projectName) {
          navigate('/');
        }
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      } else {
        message.error(response.message || '删除失败');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '删除失败';
      message.error(errorMessage);
    },
  });

  const handleCreateProject = () => {
    setEditingProject(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    form.setFieldsValue({
      name: project.name,
      description: project.description,
      repo_url: project.repo_url,
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = (_project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirmDelete = (project: Project) => {
    deleteMutation.mutate(project.name);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key === 'create') {
      handleCreateProject();
      return;
    }
    const project = projectsData?.find((p) => p.id && p.id.toString() === key);
    if (project) {
      setCurrentProject(project);
      navigate(`/project/${encodeURIComponent(project.name)}`);
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingProject) {
        // 更新项目
        const response = await projectApi.updateProject({
          pre_name: editingProject.name,
          ...values,
        });
        if (response.code === 0 || response.message === '项目更新成功') {
          message.success('项目更新成功');
          setIsModalOpen(false);
          form.resetFields();
          queryClient.invalidateQueries({ queryKey: ['projects'] });
        } else {
          message.error(response.message || '更新失败');
        }
      } else {
        // 创建项目
        createMutation.mutate(values);
      }
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        console.error('表单验证失败:', error);
      } else {
        const errorMessage = error.response?.data?.message || error.message || '操作失败';
        message.error(errorMessage);
      }
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'create',
      icon: <PlusOutlined />,
      label: '新建项目',
    },
    {
      type: 'divider',
    },
    ...(projectsData?.filter(project => project.id != null).map((project) => ({
      key: project.id!.toString(),
      icon: <FolderOutlined />,
      label: (
        <div className="flex items-center justify-between group">
          <span className="truncate flex-1">{project.name || '未命名项目'}</span>
          <div
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <EditOutlined
              className="text-blue-500 hover:text-blue-700"
              onClick={(e) => handleEditProject(project, e)}
            />
            <Popconfirm
              title="确定删除这个项目吗？"
              onConfirm={() => handleConfirmDelete(project)}
              okText="确定"
              cancelText="取消"
            >
              <DeleteOutlined
                className="text-red-500 hover:text-red-700"
                onClick={(e) => handleDeleteProject(project, e)}
              />
            </Popconfirm>
          </div>
        </div>
      ),
    })) || []),
  ];

  return (
    <>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <ProjectOutlined className="mr-2" />
            {!collapsed && <span>项目</span>}
          </h2>
        </div>
        {!collapsed && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateProject}
            block
          >
            新建项目
          </Button>
        )}
      </div>
      <Menu
        mode="inline"
        selectedKeys={projectName ? [projectsData?.find((p) => p.name === projectName && p.id != null)?.id?.toString() || ''] : []}
        items={menuItems}
        onClick={handleMenuClick}
        className="border-none"
      />

      <Modal
        title={editingProject ? '编辑项目' : '新建项目'}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        confirmLoading={createMutation.isPending}
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
          >
            <Input placeholder="请输入 Git 仓库地址" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ProjectSidebar;

