import { useState, useEffect, useMemo } from 'react';
import { Card, Button, Space, DatePicker, Statistic, Row, Col, message, Spin, Empty, Tag, Descriptions, Pagination } from 'antd';
import { PlusOutlined, EditOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined, UserOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import attendanceApi from '../../services/attendance';
import { useUserStore } from '../../stores/userStore';

const { RangePicker } = DatePicker;

const Attendance = () => {
  const { user } = useUserStore();
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (dateRange) {
        params.startDate = dateRange[0].format('YYYY-MM-DD');
        params.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      const res = await attendanceApi.getAttendanceRecords(params);
      setRecords(res.attendanceRecords || []);
    } catch (e: any) {
      console.error(e);
      message.error('获取考勤数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [dateRange, user?.factoryId]);

  const summary = useMemo(() => {
    const statusCount: Record<string, number> = {
      PRESENT: 0,
      LATE: 0,
      EARLY_LEAVE: 0,
      ABSENT: 0,
    };
    records.forEach((r) => {
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    });
    return statusCount;
  }, [records]);

  const columns = [
    { title: '员工ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '上班时间', dataIndex: 'checkInTime', key: 'checkInTime', render: (t: string|null) => t || '-' },
    { title: '下班时间', dataIndex: 'checkOutTime', key: 'checkOutTime', render: (t: string|null) => t || '-' },
    { title: '工作时长', dataIndex: 'workHours', key: 'workHours', render: (h: number) => `${h || 0}小时` },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => {
        switch (s) {
          case 'PRESENT':
            return (
              <Space>
                <CheckOutlined style={{ color: '#3f8600' }} /> 正常
              </Space>
            );
          case 'LATE':
            return (
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} /> 迟到
              </Space>
            );
          case 'EARLY_LEAVE':
            return (
              <Space>
                <ClockCircleOutlined style={{ color: '#faad14' }} /> 早退
              </Space>
            );
          case 'ABSENT':
          default:
            return (
              <Space>
                <CloseOutlined style={{ color: '#cf1322' }} /> 缺勤
              </Space>
            );
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" icon={<EditOutlined />}>
          编辑
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>考勤管理</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <RangePicker
            style={{ width: 300 }}
            value={dateRange}
            onChange={(val) => setDateRange(val as any)}
          />
          <Button type="primary" icon={<PlusOutlined />}>录入今日考勤</Button>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日正常考勤"
              value={summary.PRESENT}
              prefix={<CheckOutlined style={{ color: '#3f8600' }} />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日迟到"
              value={summary.LATE}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日早退"
              value={summary.EARLY_LEAVE}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日缺勤"
              value={summary.ABSENT}
              prefix={<CloseOutlined style={{ color: '#cf1322' }} />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="考勤记录">
        <Spin spinning={loading}>
          {records.length === 0 ? (
            <Empty description="暂无考勤记录" />
          ) : (
            <Row gutter={[16, 16]}>
              {records.map((record) => {
                const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
                  PRESENT: { color: 'success', text: '正常', icon: <CheckOutlined style={{ color: '#3f8600' }} /> },
                  LATE: { color: 'warning', text: '迟到', icon: <ClockCircleOutlined style={{ color: '#faad14' }} /> },
                  EARLY_LEAVE: { color: 'warning', text: '早退', icon: <ClockCircleOutlined style={{ color: '#faad14' }} /> },
                  ABSENT: { color: 'error', text: '缺勤', icon: <CloseOutlined style={{ color: '#cf1322' }} /> },
                };
                const cfg = statusMap[record.status] || { color: 'default', text: record.status || '-', icon: null };

                return (
                  <Col key={record.id} xs={24} sm={24} md={12} lg={8} xl={6}>
                    <Card hoverable styles={{ body: { padding: 16 } }}>
                      <Space direction="vertical" size={10} style={{ width: '100%' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space size={6} style={{ minWidth: 0 }}>
                            <UserOutlined />
                            <div style={{ fontWeight: 600, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {record.name || '-'}
                            </div>
                          </Space>
                          <Tag color={cfg.color}>
                            <Space size={4}>
                              {cfg.icon}
                              <span>{cfg.text}</span>
                            </Space>
                          </Tag>
                        </Space>

                        <Descriptions
                          column={2}
                          size="small"
                          styles={{ itemLabel: { width: 56, whiteSpace: 'nowrap' }, itemContent: { minWidth: 0 } }}
                        >
                          <Descriptions.Item label="日期" span={2}>{record.date || '-'}</Descriptions.Item>
                          <Descriptions.Item label="上班">{record.checkInTime || '-'}</Descriptions.Item>
                          <Descriptions.Item label="下班">{record.checkOutTime || '-'}</Descriptions.Item>
                          <Descriptions.Item label="工时">{`${record.workHours || 0}小时`}</Descriptions.Item>
                          <Descriptions.Item label="电话">{record.phone || '-'}</Descriptions.Item>
                        </Descriptions>

                        <Space wrap size="small">
                          <Button size="small" icon={<EditOutlined />}>编辑</Button>
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default Attendance;
