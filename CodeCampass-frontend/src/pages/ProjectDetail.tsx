import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, message, Spin } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { projectApi } from '@/api/project';
import { useProjectStore } from '@/store/projectStore';
import ProjectToolbar from '@/components/ProjectDetail/ProjectToolbar';
import CodeViewer from '@/components/ProjectDetail/CodeViewer';
import ChatPanel from '@/components/ProjectDetail/ChatPanel';
import './ProjectDetail.css';

const { Content } = Layout;

const ProjectDetail: React.FC = () => {
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [splitRatio, setSplitRatio] = useState(50); // 左右分割比例
  const { setCurrentProject } = useProjectStore();

  // 获取项目信息
  const { data: projectData, isLoading, error } = useQuery({
    queryKey: ['project', projectName],
    queryFn: async () => {
      if (!projectName) {
        throw new Error('项目名称不能为空');
      }
      const response = await projectApi.getProjectInfo(decodeURIComponent(projectName));
      if (response.code === 0 && response.data) {
        const project = response.data;
        setCurrentProject(project);
        return project;
      } else {
        throw new Error(response.message || '获取项目信息失败');
      }
    },
    enabled: !!projectName,
  });

  useEffect(() => {
    if (error) {
      message.error('获取项目信息失败');
      navigate('/');
    }
  }, [error, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin size="large" tip="加载项目中..." />
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div>项目不存在</div>
      </div>
    );
  }

  return (
    <Layout className="h-full flex flex-col">
      <ProjectToolbar project={projectData} />
      <Content className="flex-1 flex overflow-hidden relative">
        <div
          className="overflow-hidden"
          style={{ width: `${splitRatio}%` }}
        >
          <CodeViewer projectName={projectName!} />
        </div>
        {/* 拖拽调整分割线 */}
        <div
          className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors flex-shrink-0 z-10"
          onMouseDown={(e) => {
            e.preventDefault();
            const startX = e.clientX;
            const startRatio = splitRatio;
            const container = e.currentTarget.parentElement;
            if (!container) return;
            const containerWidth = container.clientWidth;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              const deltaRatio = (deltaX / containerWidth) * 100;
              const newRatio = Math.max(20, Math.min(80, startRatio + deltaRatio));
              setSplitRatio(newRatio);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
        <div
          className="overflow-hidden"
          style={{ width: `${100 - splitRatio}%` }}
        >
          <ChatPanel projectName={projectName!} />
        </div>
      </Content>
    </Layout>
  );
};

export default ProjectDetail;

