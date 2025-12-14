import { useState } from 'react';
import { Card, Button, Table, Space, Select, DatePicker, Statistic, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, ClockCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Attendance = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedDateRange, setSelectedDateRange] = useState<any>(null);
  
  // Mock data
  const attendanceRecords = [
    { 
      id: '1', 
      employeeName: '张三', 
      employeeId: 'EMP001', 
      date: '2025-12-08', 
      checkInTime: '08:05', 
      checkOutTime: '18:15', 
      workHours: 10.17, 
      status: 'present' 
    },
    { 
      id: '2', 
      employeeName: '李四', 
      employeeId: 'EMP002', 
      date: '2025-12-08', 
      checkInTime: '08:15', 
      checkOutTime: '18:00', 
      workHours: 9.75, 
      status: 'late' 
    },
    { 
      id: '3', 
      employeeName: '王五', 
      employeeId: 'EMP003', 
      date: '2025-12-08', 
      checkInTime: null, 
      checkOutTime: null, 
      workHours: 0, 
      status: 'absent' 
    },
    { 
      id: '4', 
      employeeName: '赵六', 
      employeeId: 'EMP004', 
      date: '2025-12-08', 
      checkInTime: '07:58', 
      checkOutTime: '17:30', 
      workHours: 9.53, 
      status: 'early_leave' 
    },
  ];

  const columns = [
    { title: '员工ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: '员工姓名', dataIndex: 'employeeName', key: 'employeeName' },
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '上班时间', dataIndex: 'checkInTime', key: 'checkInTime', render: (time: string | null) => time || '-' },
    { title: '下班时间', dataIndex: 'checkOutTime', key: 'checkOutTime', render: (time: string | null) => time || '-' },
    { title: '工作时长', dataIndex: 'workHours', key: 'workHours', render: (hours: number) => `${hours}小时` },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => {
        switch(status) {
          case 'present': return <Space><CheckOutlined style={{ color: '#3f8600' }} /> 正常</Space>;
          case 'late': return <Space><ClockCircleOutlined style={{ color: '#faad14' }} /> 迟到</Space>;
          case 'absent': return <Space><CloseOutlined style={{ color: '#cf1322' }} /> 缺勤</Space>;
          case 'early_leave': return <Space><ClockCircleOutlined style={{ color: '#faad14' }} /> 早退</Space>;
          case 'sick_leave': return <Space><ClockCircleOutlined style={{ color: '#1890ff' }} /> 病假</Space>;
          case 'personal_leave': return <Space><ClockCircleOutlined style={{ color: '#1890ff' }} /> 事假</Space>;
          default: return status;
        }
      }
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, _record: any) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h1>考勤管理</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select 
            placeholder="选择部门" 
            style={{ width: 150 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            allowClear
          >
            <Option value="all">全部部门</Option>
            <Option value="production">生产部</Option>
            <Option value="quality">质检部</Option>
            <Option value="logistics">物流部</Option>
          </Select>
          <RangePicker 
            style={{ width: 300 }} 
            value={selectedDateRange}
            onChange={setSelectedDateRange}
          />
          <Tooltip title={!selectedDepartment ? '请先选择部门' : ''}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              disabled={!selectedDepartment}
            >
              录入今日考勤
            </Button>
          </Tooltip>
        </div>
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日正常考勤"
              value={1}
              prefix={<CheckOutlined style={{ color: '#3f8600' }} />}
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日迟到"
              value={1}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日早退"
              value={1}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              styles={{ content: { color: '#faad14' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="今日缺勤"
              value={1}
              prefix={<CloseOutlined style={{ color: '#cf1322' }} />}
              styles={{ content: { color: '#cf1322' } }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="今日考勤记录" variant="outlined">
        <Table 
          columns={columns} 
          dataSource={attendanceRecords} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
        />
      </Card>
    </div>
  );
};

export default Attendance;
