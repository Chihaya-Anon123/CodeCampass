import { Button, Space } from 'antd';
import { SyncOutlined, SettingOutlined } from '@ant-design/icons';

const TopBar: React.FC = () => {
  return (
    <Space>
      <Button
        type="text"
        icon={<SyncOutlined />}
        onClick={() => {
          // TODO: 刷新项目列表
          window.location.reload();
        }}
      >
        刷新
      </Button>
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={() => {
          // TODO: 打开设置
        }}
      >
        设置
      </Button>
    </Space>
  );
};

export default TopBar;

