import React from 'react';
import { Layout, Menu } from 'antd';

const { Header, Content, Sider } = Layout;

const App: React.FC = () => {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ color: '#fff' }}>Cyber Sport Hunter</Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu mode="inline" defaultSelectedKeys={["layers"]} style={{ height: '100%', borderRight: 0 }}>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Content style={{ margin: 0, minHeight: 280 }}>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default App;
