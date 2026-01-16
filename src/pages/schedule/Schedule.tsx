/**
 * 排班管理页面
 */

import React, { useState, useEffect } from 'react';
import { Table, Button, DatePicker, Select, message, Modal, Form, Input, Tag, Space } from 'antd';
import { PlusOutlined, ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import scheduleAPI, { type Schedule } from '../../services/schedule';
import factoryAPI from '../../services/factory';
import personnelApi from '../../services/personnel';

const { RangePicker } = DatePicker;
const { Option } = Select;

const SchedulePage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [factories, setFactories] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // 筛选条件
  const [selectedFactory, setSelectedFactory] = useState<string>('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().startOf('week'),
    dayjs().endOf('week'),
  ]);

  // 模态框
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGenerateModalVisible, setIsGenerateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [generateForm] = Form.useForm();

  useEffect(() => {
    loadFactories();
  }, []);

  useEffect(() => {
    if (selectedFactory) {
      loadDepartments();
      loadEmployees();
      loadSchedules();
    }
  }, [selectedFactory, selectedDepartment, dateRange]);

  const loadFactories = async () => {
    try {
      const response = await factoryAPI.getFactories();
      const data = response.factories || [];
      setFactories(data);
      if (data.length > 0) {
        setSelectedFactory(data[0].id);
      }
    } catch (error) {
      message.error('加载工厂列表失败');
    }
  };

  const loadDepartments = async () => {
    if (!selectedFactory) return;
    try {
      const response = await factoryAPI.getFactoryById(selectedFactory);
      const data = response.factory || {};
      setDepartments((data as any).departments || []);
    } catch (error) {
      message.error('加载部门列表失败');
    }
  };

  const loadEmployees = async () => {
    if (!selectedFactory) return;
    try {
      const response = await personnelApi.getEmployees({ factoryId: selectedFactory });
      setEmployees(response?.employees || []);
    } catch (error) {
      message.error('加载员工列表失败');
    }
  };

  const loadSchedules = async () => {
    if (!selectedFactory) return;
    setLoading(true);
    try {
      const data = await scheduleAPI.getSchedules({
        factoryId: selectedFactory,
        departmentId: selectedDepartment,
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      setSchedules(data || []);
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSchedule = async () => {
    try {
      const values = await generateForm.validateFields();
      setLoading(true);

      const result = await scheduleAPI.generateSchedule({
        factoryId: selectedFactory,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        departmentId: values.departmentId,
        planId: values.planId,
      });

      message.success(result.message || 'AI排班生成成功');
      setIsGenerateModalVisible(false);
      generateForm.resetFields();
      loadSchedules();
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (id: string, data: Partial<Schedule>) => {
    try {
      await scheduleAPI.updateSchedule(id, data);
      message.success('排班更新成功');
      loadSchedules();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条排班记录吗?',
      onOk: async () => {
        try {
          await scheduleAPI.deleteSchedule(id);
          message.success('删除成功');
          loadSchedules();
        } catch (error: any) {
          message.error(error.message);
        }
      },
    });
  };

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '员工',
      key: 'employee',
      render: (record: Schedule) => (
        <div>
          <div>{record.employee?.name}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.employee?.employeeId} | {record.employee?.position}
          </div>
        </div>
      ),
    },
    {
      title: '部门',
      key: 'department',
      render: (record: Schedule) => record.employee?.department?.name || '-',
    },
    {
      title: '班次',
      dataIndex: 'shiftType',
      key: 'shiftType',
      render: (type: string) => {
        const typeMap: any = {
          NORMAL: { text: '正常上班', color: 'blue' },
          OVERTIME: { text: '加班', color: 'orange' },
          REST: { text: '休息', color: 'green' },
          LEAVE: { text: '请假', color: 'red' },
        };
        const config = typeMap[type] || typeMap.NORMAL;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '工作时间',
      key: 'time',
      render: (record: Schedule) => 
        record.startTime && record.endTime ? `${record.startTime} - ${record.endTime}` : '-',
    },
    {
      title: '分配产能',
      dataIndex: 'assignedCapacity',
      key: 'assignedCapacity',
      render: (value: number) => value || '-',
    },
    {
      title: '技能匹配度',
      dataIndex: 'skillMatch',
      key: 'skillMatch',
      render: (value: number) => (value !== undefined ? `${value}%` : '-'),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          SCHEDULED: { text: '已排班', color: 'default' },
          CONFIRMED: { text: '已确认', color: 'blue' },
          COMPLETED: { text: '已完成', color: 'green' },
          CANCELLED: { text: '已取消', color: 'red' },
        };
        const config = statusMap[status] || statusMap.SCHEDULED;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: '来源',
      key: 'source',
      render: (record: Schedule) => (
        <div>
          {record.isAutoGenerated ? (
            <Tag color="purple">AI生成</Tag>
          ) : (
            <Tag>手动创建</Tag>
          )}
          {record.adjustedBy && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {record.adjustedBy} 调整
            </div>
          )}
        </div>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Schedule) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => {
              form.setFieldsValue({
                ...record,
                date: dayjs(record.date),
              });
              setIsModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            size="small"
            onClick={() => handleDeleteSchedule(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h2>排班管理</h2>

      {/* 筛选区 */}
      <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Select
          style={{ width: 200 }}
          placeholder="选择工厂"
          value={selectedFactory}
          onChange={setSelectedFactory}
        >
          {factories.map((f) => (
            <Option key={f.id} value={f.id}>
              {f.name}
            </Option>
          ))}
        </Select>

        <Select
          style={{ width: 200 }}
          placeholder="选择部门（全部）"
          value={selectedDepartment}
          onChange={setSelectedDepartment}
          allowClear
        >
          {departments.map((d) => (
            <Option key={d.id} value={d.id}>
              {d.name}
            </Option>
          ))}
        </Select>

        <RangePicker
          value={dateRange}
          onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
        />

        <Button icon={<ReloadOutlined />} onClick={loadSchedules}>
          刷新
        </Button>

        <Button
          type="primary"
          icon={<ThunderboltOutlined />}
          onClick={() => setIsGenerateModalVisible(true)}
        >
          AI智能排班
        </Button>

        <Button icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          手动添加
        </Button>
      </div>

      {/* 排班表 */}
      <Table
        columns={columns}
        dataSource={schedules}
        loading={loading}
        rowKey="id"
        pagination={{ pageSize: 20 }}
      />

      {/* AI生成排班模态框 */}
      <Modal
        title="AI智能排班"
        open={isGenerateModalVisible}
        onOk={handleGenerateSchedule}
        onCancel={() => {
          setIsGenerateModalVisible(false);
          generateForm.resetFields();
        }}
        okText="生成"
        cancelText="取消"
      >
        <Form form={generateForm} layout="vertical">
          <Form.Item
            name="dateRange"
            label="排班周期"
            rules={[{ required: true, message: '请选择排班周期' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="departmentId" label="部门（可选）">
            <Select placeholder="选择部门" allowClear>
              {departments.map((d) => (
                <Option key={d.id} value={d.id}>
                  {d.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="planId" label="生产计划（可选）">
            <Input placeholder="输入生产计划ID" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 手动添加/编辑排班模态框 */}
      <Modal
        title="排班信息"
        open={isModalVisible}
        onOk={async () => {
          try {
            const values = await form.validateFields();
            const scheduleData = {
              ...values,
              date: values.date.format('YYYY-MM-DD'),
            };

            if (values.id) {
              await handleUpdateSchedule(values.id, scheduleData);
            } else {
              await scheduleAPI.createSchedule(scheduleData);
              message.success('创建成功');
              loadSchedules();
            }

            setIsModalVisible(false);
            form.resetFields();
          } catch (error: any) {
            message.error(error.message);
          }
        }}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="id" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="employeeId"
            label="员工"
            rules={[{ required: true, message: '请选择员工' }]}
          >
            <Select placeholder="选择员工">
              {employees.map((e) => (
                <Option key={e.id} value={e.id}>
                  {e.name} - {e.employeeId}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="shiftType" label="班次" initialValue="NORMAL">
            <Select>
              <Option value="NORMAL">正常上班</Option>
              <Option value="OVERTIME">加班</Option>
              <Option value="REST">休息</Option>
              <Option value="LEAVE">请假</Option>
            </Select>
          </Form.Item>

          <Form.Item label="工作时间">
            <Space>
              <Form.Item name="startTime" noStyle>
                <Input placeholder="开始时间 HH:mm" />
              </Form.Item>
              -
              <Form.Item name="endTime" noStyle>
                <Input placeholder="结束时间 HH:mm" />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item name="assignedCapacity" label="分配产能">
            <Input type="number" placeholder="分配的产能目标" />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
