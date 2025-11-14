import { useState, useEffect } from 'react';
import { Tree, Spin, Empty, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { FileTextOutlined, FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import './CodeViewer.css';

interface CodeViewerProps {
  projectName: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ projectName }) => {
  const [fileTree, setFileTree] = useState<DataNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    // TODO: 从后端获取文件树
    // 暂时使用空数组
    setFileTree([]);
  }, [projectName]);

  const handleSelect = async (selectedKeys: React.Key[]) => {
    if (selectedKeys.length === 0) {
      setSelectedFile(null);
      setFileContent('');
      return;
    }

    const key = selectedKeys[0] as string;
    const node = findNode(fileTree, key);

    if (node && !node.isLeaf) {
      // 如果是目录，展开/收起
      if (expandedKeys.includes(key)) {
        setExpandedKeys(expandedKeys.filter((k) => k !== key));
      } else {
        setExpandedKeys([...expandedKeys, key]);
      }
      return;
    }

    setSelectedFile(key);
    setLoading(true);
    try {
      // TODO: 从后端获取文件内容
      // const content = await getFileContent(projectName, key);
      // setFileContent(content);
      setFileContent(`// 文件: ${key}\n// TODO: 从后端获取文件内容`);
    } catch (error: any) {
      message.error('获取文件内容失败');
      setFileContent('');
    } finally {
      setLoading(false);
    }
  };

  const findNode = (nodes: DataNode[], key: React.Key): DataNode | null => {
    for (const node of nodes) {
      if (node.key === key) {
        return node;
      }
      if (node.children) {
        const found = findNode(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      h: 'c',
      hpp: 'cpp',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      swift: 'swift',
      kt: 'kotlin',
      scala: 'scala',
      sh: 'bash',
      yaml: 'yaml',
      yml: 'yaml',
      json: 'json',
      xml: 'xml',
      html: 'html',
      css: 'css',
      scss: 'scss',
      sql: 'sql',
      md: 'markdown',
    };
    return langMap[ext] || 'text';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* 文件树 */}
        <div className="w-64 border-r border-gray-200 overflow-auto bg-white">
          <div className="p-2 border-b border-gray-200 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">文件目录</h3>
          </div>
          {fileTree.length > 0 ? (
            <Tree
              treeData={fileTree}
              defaultExpandAll={false}
              expandedKeys={expandedKeys}
              onExpand={setExpandedKeys}
              selectedKeys={selectedFile ? [selectedFile] : []}
              onSelect={handleSelect}
              showIcon
              icon={({ expanded, isLeaf }) => {
                if (isLeaf) {
                  return <FileTextOutlined className="text-blue-500" />;
                }
                return expanded ? (
                  <FolderOpenOutlined className="text-yellow-500" />
                ) : (
                  <FolderOutlined className="text-yellow-500" />
                );
              }}
              className="p-2"
            />
          ) : (
            <div className="p-4">
              <Empty
                description="暂无文件"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
              <div className="text-xs text-gray-500 mt-2">
                请先同步仓库以查看文件
              </div>
            </div>
          )}
        </div>

        {/* 文件内容 */}
        <div className="flex-1 overflow-auto bg-gray-900">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spin size="large" tip="加载文件中..." />
            </div>
          ) : selectedFile && fileContent ? (
            <div className="h-full">
              <div className="bg-gray-800 text-gray-300 px-4 py-2 text-sm border-b border-gray-700">
                {selectedFile}
              </div>
              <SyntaxHighlighter
                language={getLanguageFromFileName(selectedFile)}
                style={vscDarkPlus}
                customStyle={{
                  margin: 0,
                  padding: '16px',
                  minHeight: 'calc(100% - 40px)',
                }}
                showLineNumbers
              >
                {fileContent}
              </SyntaxHighlighter>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <Empty
                description="请选择一个文件查看内容"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;

