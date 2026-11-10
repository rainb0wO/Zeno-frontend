import { useEffect, useState } from 'react';
import { Alert, Card, Col, Empty, Row, Spin, Statistic, Table } from 'antd';
import { dashboardApi, type DashboardOverview } from '../services/dashboard';
import { readErrorMessage } from '../domain/apiEnvelope';
import { useFactoryStore } from '../stores/factoryStore';

const empty: DashboardOverview = {
  employee: { total: 0, momGrowthRate: 0 },
  capacity: { todayRate: 0, todayPlan: 0, todayActual: 0 },
  salary: { monthTotal: 0, momGrowthRate: 0, base: 0, bonus: 0, allowance: 0 },
  attendance: { todayRate: 0, shouldAttend: 0, actualAttend: 0 },
  capacityPlans: [],
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
    dashboardApi.overview()
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

  return (
    <div className="page-container">
      <div className="page-header"><h1>仪表盘</h1></div>
      <p style={{ color: '#666', marginTop: 0 }}>
        {factory ? `当前厂区：${factory.name}` : '统计范围是当前厂区，日期默认今天'}
      </p>
      {error && <Alert title={error} type="error" showIcon style={{ marginBottom: 16 }} />}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="员工人数" value={data.employee.total} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="今日计划" value={data.capacity.todayPlan} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="今日实绩" value={data.capacity.todayActual} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="本月工资合计" prefix="¥" precision={2} value={data.salary.monthTotal} /></Card></Col>
          <Col xs={24} sm={12} lg={8}><Card><Statistic title="应出勤" value={data.attendance.shouldAttend} /></Card></Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic title="实出勤" value="未启用" />
            </Card>
          </Col>
        </Row>
        <Card title="进行中的计划" style={{ marginTop: 16 }}>
          <Table
            rowKey={(row) => row.name}
            pagination={false}
            dataSource={data.capacityPlans}
            locale={{ emptyText: <Empty description="今天没有进行中的计划" /> }}
            columns={[
              { title: '计划', dataIndex: 'name' },
              { title: '计划量', dataIndex: 'plan' },
              { title: '实绩', dataIndex: 'actual' },
              { title: '完成率', dataIndex: 'rate', render: (value: number) => `${value}` },
            ]}
          />
        </Card>
      </Spin>
    </div>
  );
};

export default Dashboard;
