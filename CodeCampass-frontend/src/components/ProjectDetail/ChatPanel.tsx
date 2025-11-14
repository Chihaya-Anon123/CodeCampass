import { useState, useRef, useEffect } from 'react';
import { Input, Button, message, Spin, Empty } from 'antd';
import { SendOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PrismAsync as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { projectApi } from '@/api/project';
import type { AskProjectParams } from '@/types/project';
import './ChatPanel.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatPanelProps {
  projectName: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ projectName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 发送消息
  const askMutation = useMutation({
    mutationFn: (params: AskProjectParams) => projectApi.askProject(params),
    onSuccess: (response) => {
      const answer = response.data?.answer || response.message || '抱歉，我无法回答这个问题。';
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || error.message || '问答失败';
      message.error(errorMessage);
      const errorMsg: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `抱歉，发生了错误：${errorMessage}，请稍后重试。`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const handleSend = () => {
    if (!inputValue.trim()) {
      message.warning('请输入问题');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');

    askMutation.mutate({
      name: decodeURIComponent(projectName),
      question: inputValue,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center">
          <RobotOutlined className="mr-2" />
          AI 问答助手
        </h3>
      </div>

      {/* 消息列表 */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Empty
              description="开始与 AI 对话吧"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start mb-1">
                  {message.role === 'user' ? (
                    <UserOutlined className="mr-2 mt-1" />
                  ) : (
                    <RobotOutlined className="mr-2 mt-1" />
                  )}
                  <div className="flex-1">
                    {message.role === 'user' ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            code({ node, inline, className, children, ...props }: any) {
                              const match = /language-(\w+)/.exec(className || '');
                              const language = match ? match[1] : '';
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={language}
                                  PreTag="div"
                                  customStyle={{
                                    margin: '8px 0',
                                    borderRadius: '4px',
                                  }}
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} style={{ 
                                  backgroundColor: 'rgba(0, 0, 0, 0.1)', 
                                  padding: '2px 4px',
                                  borderRadius: '3px',
                                }} {...props}>
                                  {children}
                                </code>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        {askMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <Spin size="small" tip="AI 正在思考..." />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框 */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="输入您的问题..."
          rows={3}
          disabled={askMutation.isPending}
          className="mb-2"
        />
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSend}
            loading={askMutation.isPending}
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;

