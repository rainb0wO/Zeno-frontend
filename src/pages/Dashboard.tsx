import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Progress, Row, Col, Skeleton, Space, Statistic, Typography } from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  BarChartOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dashboardApi, { type DashboardOverview } from '../services/dashboard';
import { formatCNY, formatNumber, formatPercent } from '../utils/format';
import './Dashboard.css';

const { Title, Paragraph } = Typography;

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardOverview | null>(null);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await dashboardApi.getOverview();
      setData(resp);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || '数据加载失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const salaryParts = useMemo(() => {
    const base = data?.salary?.base ?? 0;
    const bonus = data?.salary?.bonus ?? 0;
    const allowance = data?.salary?.allowance ?? 0;
    const total = base + bonus + allowance;

    const safeRate = (v: number) => (total > 0 ? (v / total) * 100 : 0);

    return {
      basePercent: safeRate(base),
      bonusPercent: safeRate(bonus),
      allowancePercent: safeRate(allowance),
    };
  }, [data]);

  const renderTrend = (rate: number, color: string) => {
    const isUp = rate >= 0;
    const Icon = isUp ? ArrowUpOutlined : ArrowDownOutlined;
    return (
      <Space className="metric-trend">
        <Icon style={{ color, fontSize: '14px' }} />
        <span style={{ fontSize: '14px', color }}>{formatPercent(Math.abs(rate))}</span>
      </Space>
    );
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          生产管理仪表板
        </Title>
        <Paragraph className="dashboard-subtitle">实时监控生产数据，优化管理决策</Paragraph>
      </div>

      {error && (
        <Alert
          type="error"
          showIcon
          message="数据加载失败"
          description={error}
          action={
            <Button size="small" onClick={loadOverview} disabled={loading}>
              重试
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      <Row gutter={[24, 24]} className="dashboard-metrics">
        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card employee-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">总员工数</h3>
                <div className="metric-icon employee-icon">
                  <UserOutlined />
                </div>
              </div>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  value={data?.employee?.total ?? 0}
                  formatter={(v) => formatNumber(Number(v))}
                  styles={{ content: { color: '#52c41a', fontSize: '32px', fontWeight: '600' } }}
                  suffix={renderTrend(data?.employee?.momGrowthRate ?? 0, '#52c41a')}
                />
              )}
              <div className="metric-description">
                较上月{data?.employee?.momGrowthRate !== undefined && data.employee.momGrowthRate >= 0 ? '增长' : '下降'}{' '}
                {loading ? '--' : formatPercent(Math.abs(data?.employee?.momGrowthRate ?? 0))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card capacity-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">今日产能</h3>
                <div className="metric-icon capacity-icon">
                  <BarChartOutlined />
                </div>
              </div>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  value={(data?.capacity?.todayRate ?? 0) * 100}
                  precision={1}
                  suffix="%"
                  styles={{ content: { color: '#1890ff', fontSize: '32px', fontWeight: '600' } }}
                />
              )}
              <div className="metric-description">
                目标完成率 {loading ? '--' : formatPercent(data?.capacity?.todayRate ?? 0)}
                {data?.capacity?.todayPlan !== undefined && data?.capacity?.todayActual !== undefined
                  ? `（${formatNumber(data.capacity.todayActual)}/${formatNumber(data.capacity.todayPlan)}）`
                  : ''}
              </div>
              <Progress
                percent={(data?.capacity?.todayRate ?? 0) * 100}
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

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card salary-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">本月工资总额</h3>
                <div className="metric-icon salary-icon">
                  <DollarOutlined />
                </div>
              </div>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  value={data?.salary?.monthTotal ?? 0}
                  formatter={(v) => formatCNY(Number(v))}
                  styles={{ content: { color: '#fa8c16', fontSize: '32px', fontWeight: '600' } }}
                  suffix={renderTrend(data?.salary?.momGrowthRate ?? 0, '#fa8c16')}
                />
              )}
              <div className="metric-description">
                较上月{data?.salary?.momGrowthRate !== undefined && (data?.salary?.momGrowthRate ?? 0) >= 0 ? '增长' : '下降'}{' '}
                {loading ? '--' : formatPercent(Math.abs(data?.salary?.momGrowthRate ?? 0))}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="metric-card attendance-card">
            <div className="metric-content">
              <div className="metric-header">
                <h3 className="metric-title">今日出勤率</h3>
                <div className="metric-icon attendance-icon">
                  <ClockCircleOutlined />
                </div>
              </div>
              {loading ? (
                <Skeleton active paragraph={false} />
              ) : (
                <Statistic
                  value={(data?.attendance?.todayRate ?? 0) * 100}
                  precision={1}
                  suffix="%"
                  styles={{ content: { color: '#722ed1', fontSize: '32px', fontWeight: '600' } }}
                />
              )}
              <div className="metric-description">
                应到/实到 {loading ? '--' : `${formatNumber(data?.attendance?.shouldAttend ?? 0)}/${formatNumber(data?.attendance?.actualAttend ?? 0)}`}
              </div>
              <Progress
                percent={(data?.attendance?.todayRate ?? 0) * 100}
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

      <Row gutter={[24, 24]} className="dashboard-details">
        <Col xs={24} lg={12}>
          <Card className="detail-card" title="产能完成情况" variant="outlined">
            <div className="progress-section">
              {(data?.capacityPlans ?? []).map((p) => {
                const percent = (p.rate ?? 0) * 100;
                const up = (p.actual ?? 0) >= (p.plan ?? 0);
                return (
                  <div className="progress-item" key={p.name}>
                    <div className="progress-header">
                      <h4 className="progress-title">{p.name}</h4>
                      <div className="progress-meta">
                        <span className="progress-value">{loading ? '--' : formatPercent(p.rate ?? 0, 0)}</span>
                        {up ? (
                          <ArrowUpOutlined className="progress-trend up" />
                        ) : (
                          <ArrowDownOutlined className="progress-trend down" />
                        )}
                      </div>
                    </div>
                    <Progress
                      percent={percent}
                      strokeColor={{
                        '0%': '#91d5ff',
                        '100%': '#1890ff',
                      }}
                      className="progress-bar"
                    />
                    <div style={{ marginTop: 4, color: '#8c8c8c', fontSize: 12 }}>
                      {loading ? '--' : `${formatNumber(p.actual ?? 0)}/${formatNumber(p.plan ?? 0)}`}
                    </div>
                  </div>
                );
              })}

              {!loading && (data?.capacityPlans?.length ?? 0) === 0 && <div style={{ color: '#8c8c8c' }}>--</div>}
              {loading && <Skeleton active />}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card className="detail-card" title="工资分布" variant="outlined">
            <div className="progress-section">
              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">基本工资</h4>
                  <div className="progress-meta">
                    <span className="progress-value">{loading ? '--' : `${salaryParts.basePercent.toFixed(0)}%`}</span>
                  </div>
                </div>
                <Progress
                  percent={salaryParts.basePercent}
                  strokeColor={{
                    '0%': '#b7eb8f',
                    '100%': '#52c41a',
                  }}
                  className="progress-bar"
                  format={(percent) => `${(percent ?? 0).toFixed(0)}%`}
                />
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">绩效奖金</h4>
                  <div className="progress-meta">
                    <span className="progress-value">{loading ? '--' : `${salaryParts.bonusPercent.toFixed(0)}%`}</span>
                  </div>
                </div>
                <Progress
                  percent={salaryParts.bonusPercent}
                  strokeColor={{
                    '0%': '#91d5ff',
                    '100%': '#1890ff',
                  }}
                  className="progress-bar"
                  format={(percent) => `${(percent ?? 0).toFixed(0)}%`}
                />
              </div>

              <div className="progress-item">
                <div className="progress-header">
                  <h4 className="progress-title">其他补贴</h4>
                  <div className="progress-meta">
                    <span className="progress-value">{loading ? '--' : `${salaryParts.allowancePercent.toFixed(0)}%`}</span>
                  </div>
                </div>
                <Progress
                  percent={salaryParts.allowancePercent}
                  strokeColor={{
                    '0%': '#d3adf7',
                    '100%': '#722ed1',
                  }}
                  className="progress-bar"
                  format={(percent) => `${(percent ?? 0).toFixed(0)}%`}
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
