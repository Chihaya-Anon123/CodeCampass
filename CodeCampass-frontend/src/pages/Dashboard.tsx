import { useNavigate } from 'react-router-dom';
import { Card, Empty, Button, List, Typography, Space } from 'antd';
import { ProjectOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/api/project';
import { useProjectStore } from '@/store/projectStore';
import type { Project } from '@/types/project';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentProject } = useProjectStore();

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.listProjects();
      return response.projects || [];
    },
  });

  const handleProjectClick = (project: Project) => {
    setCurrentProject(project);
    navigate(`/project/${encodeURIComponent(project.name)}`);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <Card loading />
      </div>
    );
  }

  if (!projectsData || projectsData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <span className="text-gray-500">暂无项目，请创建新项目</span>
          }
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              // 触发侧边栏的新建项目
            }}
          >
            创建项目
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <Title level={2}>我的项目</Title>
        <Text type="secondary">共 {projectsData.length} 个项目</Text>
      </div>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={projectsData.filter(p => p.id != null)}
        renderItem={(project) => (
          <List.Item>
            <Card
              hoverable
              onClick={() => handleProjectClick(project)}
              className="h-full"
            >
              <Space direction="vertical" size="small" className="w-full">
                <div className="flex items-center">
                  <ProjectOutlined className="text-blue-500 text-xl mr-2" />
                  <Title level={5} className="mb-0 truncate">
                    {project.name || '未命名项目'}
                  </Title>
                </div>
                {project.description && (
                  <Text type="secondary" ellipsis className="block">
                    {project.description}
                  </Text>
                )}
                {project.repo_url && (
                  <Text type="secondary" ellipsis className="block text-xs">
                    {project.repo_url}
                  </Text>
                )}
                <Text type="secondary" className="text-xs">
                  创建于 {project.created_at ? new Date(project.created_at).toLocaleDateString() : '未知'}
                </Text>
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default Dashboard;

