import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Layout } from 'antd';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Trading from './pages/Trading';
import Analysis from './pages/Analysis';

const { Header, Content, Footer } = Layout;

function App() {
  return (
    <Router>
      <Layout className="layout">
        <Header>
          <Navigation />
        </Header>
        <Content style={{ padding: '0 50px' }}>
          <Switch>
            <Route exact path="/" component={Dashboard} />
            <Route path="/trading" component={Trading} />
            <Route path="/analysis" component={Analysis} />
          </Switch>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          乾元量化交易系统 ©2024
        </Footer>
      </Layout>
    </Router>
  );
}

export default App; 