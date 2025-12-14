import { Card, Row, Col, Statistic, Progress, Typography, Space } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  DollarOutlined, 
  ClockCircleOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          生产管理仪表板
        </Title>
        <Paragraph className="dashboard-subtitle">
          实时监控生产数据，优化管理决策
        </Paragraph>
      </div>
      
      {/* 关键指标卡片 */}
      <Row gutter={[24, 24]} className="dashboard-metrics">
        {/* 总员工数 */}
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card employee-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">总员工数</h3>
                <div className="metric-icon employee-icon">
                  <UserOutlined />
                </div>
              </div>
              <Statistic
                value={128}
                styles={{ content: { color: '#52c41a', fontSize: '32px', fontWeight: '600' } }}
                suffix={
                  <Space className="metric-trend">
                    <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', color: '#52c41a' }}>5.2%</span>
                  </Space>
                }
              />
              <div className="metric-description">
                较上月增长 5.2%
              </div>
            </div>
          </Card>
        </Col>
        
        {/* 今日产能 */}
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card capacity-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">今日产能</h3>
                <div className="metric-icon capacity-icon">
                  <BarChartOutlined />
                </div>
              </div>
              <Statistic
                value={85.5}
                precision={1}
                suffix="%"
                styles={{ content: { color: '#1890ff', fontSize: '32px', fontWeight: '600' } }}
              />
              <div className="metric-description">
                目标完成率 85.5%
              </div>
              <Progress 
                percent={85.5} 
                strokeColor={{
                  '0%': '#91d5ff',
                  '100%': '#1890ff',
                }} 
                className="metric-progress"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
        
        {/* 本月工资总额 */}
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card salary-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">本月工资总额</h3>
                <div className="metric-icon salary-icon">
                  <DollarOutlined />
                </div>
              </div>
              <Statistic
                value={1258000}
                prefix="¥"
                precision={2}
                styles={{ content: { color: '#fa8c16', fontSize: '32px', fontWeight: '600' } }}
                suffix={
                  <Space className="metric-trend">
                    <ArrowUpOutlined style={{ color: '#fa8c16', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', color: '#fa8c16' }}>3.8%</span>
                  </Space>
                }
              />
              <div className="metric-description">
                较上月增长 3.8%
              </div>
            </div>
          </Card>
        </Col>
        
        {/* 今日出勤率 */}
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card attendance-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">今日出勤率</h3>
                <div className="metric-icon attendance-icon">
                  <ClockCircleOutlined />
                </div>
              </div>
              <Statistic
                value={98.2}
                precision={1}
                styles={{ content: { color: '#722ed1', fontSize: '32px', fontWeight: '600' } }}
                suffix={
                  <Space className="metric-trend">
                    <ArrowUpOutlined style={{ color: '#722ed1', fontSize: '14px' }} />
                    <span style={{ fontSize: '14px', color: '#722ed1' }}>1.2%</span>
                  </Space>
                }
              />
              <div className="metric-description">
                较昨日提升 1.2%
              </div>
              <Progress 
                percent={98.2} 
                strokeColor={{
                  '0%': '#d3adf7',
                  '100%': '#722ed1',
                }} 
                className="metric-progress"
                showInfo={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
      
      {/* 详细数据卡片 */}
      <Row gutter={[24, 24]} className="dashboard-details">
        {/* 产能完成情况 */}
        <Col xs={24} lg={12}>
          <Card className="detail-card" title="产能完成情况" variant="outlined">
            <div className="progress-section">
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">生产计划 A</h4>
                  <div className="progress-meta">
                    <span className="progress-value">85%</span>
                    <ArrowUpOutlined className="progress-trend up" />
                  </div>
                </div>
                <Progress 
                  percent={85} 
                  strokeColor={{
                    '0%': '#91d5ff',
                    '100%': '#1890ff',
                  }} 
                  className="progress-bar"
                />
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">生产计划 B</h4>
                  <div className="progress-meta">
                    <span className="progress-value">92%</span>
                    <ArrowUpOutlined className="progress-trend up" />
                  </div>
                </div>
                <Progress 
                  percent={92} 
                  strokeColor={{
                    '0%': '#b7eb8f',
                    '100%': '#52c41a',
                  }} 
                  className="progress-bar"
                />
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">生产计划 C</h4>
                  <div className="progress-meta">
                    <span className="progress-value">78%</span>
                    <ArrowDownOutlined className="progress-trend down" />
                  </div>
                </div>
                <Progress 
                  percent={78} 
                  strokeColor={{
                    '0%': '#ffd591',
                    '100%': '#fa8c16',
                  }} 
                  className="progress-bar"
                />
              </div>
            </div>
          </Card>
        </Col>
        
        {/* 工资分布 */}
        <Col xs={24} lg={12}>
          <Card className="detail-card" title="工资分布" variant="outlined">
            <div className="progress-section">
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">基本工资</h4>
                  <div className="progress-meta">
                    <span className="progress-value">65%</span>
                  </div>
                </div>
                <Progress 
                  percent={65} 
                  strokeColor={{
                    '0%': '#b7eb8f',
                    '100%': '#52c41a',
                  }} 
                  className="progress-bar"
                  format={(percent) => `${percent}%`}
                />
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">绩效奖金</h4>
                  <div className="progress-meta">
                    <span className="progress-value">20%</span>
                  </div>
                </div>
                <Progress 
                  percent={20} 
                  strokeColor={{
                    '0%': '#91d5ff',
                    '100%': '#1890ff',
                  }} 
                  className="progress-bar"
                  format={(percent) => `${percent}%`}
                />
              </div>
              
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">其他补贴</h4>
                  <div className="progress-meta">
                    <span className="progress-value">15%</span>
                  </div>
                </div>
                <Progress 
                  percent={15} 
                  strokeColor={{
                    '0%': '#d3adf7',
                    '100%': '#722ed1',
                  }} 
                  className="progress-bar"
                  format={(percent) => `${percent}%`}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
