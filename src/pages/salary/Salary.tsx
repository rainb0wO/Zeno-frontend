import { useState, useEffect } from 'react';
import { Card, Button, Table, Space, DatePicker, message, Tag, Modal, Empty } from 'antd';
import { PlusOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import { salaryApi } from '../../services/salary';
import type { SalaryRecord } from '../../services/salary';
import { useFactoryStore } from '../../stores/factoryStore';
import dayjs from 'dayjs';

const { MonthPicker } = DatePicker;

const Salary = () => {
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'));
  const { currentFactory } = useFactoryStore();

  useEffect(() => {
    if (currentFactory) {
      fetchSalaryRecords();
    }
  }, [currentFactory, selectedMonth]);

  const fetchSalaryRecords = async () => {
    if (!currentFactory) return;
    setLoading(true);
    try {
      const response = await salaryApi.getSalaryRecords({ month: selectedMonth });
      setSalaryRecords(response.salaryRecords);
    } catch (error) {
      console.error('获取工资记录失败:', error);
      message.error('获取工资记录失败');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchGenerate = () => {
    if (!currentFactory) return;
    Modal.confirm({
      title: '批量生成工资条',
      content: `确定要为 ${selectedMonth} 月生成工资条吗？`,
      onOk: async () => {
        try {
          const response = await salaryApi.batchGenerateSalary({
            month: selectedMonth,
            factoryId: currentFactory.id
          });
          message.success(`成功生成 ${response.count} 条工资记录`);
          fetchSalaryRecords();
        } catch (error) {
          console.error('生成失败:', error);
          message.error('生成工资条失败');
        }
      }
    });
  };

  const handlePaySalary = (id: string) => {
    Modal.confirm({
      title: '确认发放',
      content: '确定要发放这条工资吗？',
      onOk: async () => {
        try {
          await salaryApi.paySalary(id);
          message.success('工资发放成功');
          fetchSalaryRecords();
        } catch (error) {
          console.error('发放失败:', error);
          message.error('发放失败');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      UNPAID: { color: 'warning', text: '未发放' },
      PAID: { color: 'success', text: '已发放' },
      PARTIAL_PAID: { color: 'processing', text: '部分发放' },
    };
    const status_config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={status_config.color}>{status_config.text}</Tag>;
  };

  const columns = [
    { title: '员工ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: '基本工资', dataIndex: 'basicSalary', key: 'basicSalary', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '计件工资', dataIndex: 'piecePay', key: 'piecePay', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '加班工资', dataIndex: 'overtimePay', key: 'overtimePay', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '奖金', dataIndex: 'bonus', key: 'bonus', render: (value: number) => `¥${value.toFixed(2)}` },
    { title: '扣除', dataIndex: 'deduction', key: 'deduction', render: (value: number) => `¥${value.toFixed(2)}` },
    { 
      title: '实发工资', 
      dataIndex: 'totalSalary', 
      key: 'totalSalary', 
      render: (value: number) => <span style={{ color: '#cf1322', fontWeight: 'bold' }}>¥{value.toFixed(2)}</span> 
    },
    { title: '月份', dataIndex: 'month', key: 'month' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, record: SalaryRecord) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<DollarOutlined />} 
            size="small"
            disabled={record.status === 'PAID'}
            onClick={() => handlePaySalary(record.id)}
          >
            发放
          </Button>
          <Button icon={<DownloadOutlined />} size="small">导出</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>工资计算</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <MonthPicker 
            value={dayjs(selectedMonth)}
            onChange={(date) => date && setSelectedMonth(date.format('YYYY-MM'))}
            style={{ width: 150 }}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleBatchGenerate}>
            生成工资条
          </Button>
        </div>
      </div>
      
      <Card title="工资记录列表" variant="outlined">
        {salaryRecords.length === 0 && !loading ? (
          <Empty
            description="暂无工资记录"
            style={{ padding: '60px 0' }}
          >
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleBatchGenerate}
            >
              生成{selectedMonth}月工资条
            </Button>
          </Empty>
        ) : (
          <Table 
            columns={columns} 
            dataSource={salaryRecords} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 10 }} 
          />
        )}
      </Card>
    </div>
  );
};

export default Salary;
