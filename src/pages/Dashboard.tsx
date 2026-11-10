import { useEffect, useState } from 'react';
import { Alert, Card, Col, Empty, Row, Spin, Statistic } from 'antd';
import { dashboardApi, type DashboardOverview } from '../services/dashboard';
import { readErrorMessage } from '../domain/apiEnvelope';
import { useFactoryStore } from '../stores/factoryStore';

const empty: DashboardOverview = {
  employeeCount: 0,
  departmentCount: 0,
  planCount: 0,
  todayOutput: 0,
  monthPiecePay: 0,
};

const Dashboard = () => {
  const factory = useFactoryStore((state) => state.currentFactory);
  const factoryId = factory?.id;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<DashboardOverview>(empty);
  const [queryId, setQueryId] = useState(factoryId);

  if (factoryId !== queryId) {
    setQueryId(factoryId);
    setLoading(true);
    setError('');
  }

  useEffect(() => {
    let alive = true;
    dashboardApi.overview(factoryId)
      .then((overview) => {
        if (alive) setData(overview);
      })
      .catch((err) => {
        if (alive) setError(readErrorMessage(err, '仪表盘加载失败'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [factoryId]);

  const nothingYet = !loading && !error
    && data.employeeCount === 0
    && data.planCount === 0
    && data.todayOutput === 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>仪表盘</h1>
      </div>
      <p style={{ color: '#666', marginTop: 0 }}>
        {factory ? `当前厂区：${factory.name}` : '登录后只显示你已加入的厂区数据'}
      </p>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="员工人数" value={data.employeeCount} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="部门数" value={data.departmentCount} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="生产计划" value={data.planCount} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="今日产量" value={data.todayOutput} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="本月计件工资" prefix="¥" precision={2} value={data.monthPiecePay} /></Card></Col>
        </Row>
        {nothingYet && <Empty description="这个厂区还没有员工或生产计划" style={{ marginTop: 32 }} />}
      </Spin>
    </div>
  );
};

export default Dashboard;
