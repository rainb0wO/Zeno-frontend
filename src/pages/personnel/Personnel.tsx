import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Table, Space, Select, Modal, Form, Input, message, DatePicker, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import personnelApi from '../../services/personnel';

const { Option } = Select;

const Personnel = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [form] = Form.useForm();

  const [loading, setLoading] = useState<boolean>(false);
  // 部门筛选
  const [selectedDepartment, setSelectedDepartment] = useState<string>('全部');
  // 搜索关键词
  const [searchText, setSearchText] = useState<string>('');
  // 新增：部门列表
  const [departments, setDepartments] = useState<any[]>([]);
  
  // 部门ID到名称的映射，使用useMemo缓存
  const depNameById = useMemo(
    () => Object.fromEntries(departments.map(d => [d.id, d.name])),
    [departments]
  );
  
  // 开发环境全局调试
  if (import.meta.env.DEV) {
    (window as any).__EMP_LIST__ = employees;
  }
  
  // 从后端获取部门列表
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await personnelApi.getDepartments();
        setDepartments(response.departments || []);
      } catch (error: any) {
        console.error('获取部门列表失败:', error);
        // 仅在开发环境使用默认部门数据
        if (import.meta.env.DEV) {
          setDepartments([
            { id: '1', name: '生产部', factoryId: '1', createdAt: '', updatedAt: '' },
            { id: '2', name: '质检部', factoryId: '1', createdAt: '', updatedAt: '' },
            { id: '3', name: '物流部', factoryId: '1', createdAt: '', updatedAt: '' },
          ]);
        }
      }
    };
    
    fetchDepartments();
  }, []);
  
  // 从后端获取员工数据
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      // 假设当前用户只有一个工厂，所以没有传递factoryId
      const response = await personnelApi.getEmployees();
      setEmployees(response.employees || response || []);
      return true; // 成功标记
    } catch (error: any) {
      console.error('获取员工列表失败:', error);
      
      if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
        navigate('/login');
      } else {
        message.error('获取员工列表失败');
        
        // 仅在开发环境保留Mock数据，且确保先await接口失败再注入
        if (import.meta.env.DEV) {
          const mockData = [
            { 
              id: '1', 
              employeeId: 'EMP001', 
              name: '张三', 
              departmentId: '1',
              position: '缝纫工', 
              hireDate: '2023-05-15', 
              salaryType: 'PIECE', 
              pieceRate: 0.5, 
              phone: '13800138001', 
              status: 'active' 
            },
            { 
              id: '2', 
              employeeId: 'EMP002', 
              name: '李四', 
              departmentId: '1',
              position: '裁剪工', 
              hireDate: '2024-03-20', 
              salaryType: 'PIECE', 
              pieceRate: 0.8, 
              phone: '13800138002', 
              status: 'active' 
            },
            { 
              id: '3', 
              employeeId: 'EMP003', 
              name: '王五', 
              departmentId: '2',
              position: '质检员', 
              hireDate: '2022-10-08', 
              salaryType: 'TIME', 
              baseSalary: 6000, 
              phone: '13800138003', 
              status: 'active' 
            },
            { 
              id: '4', 
              employeeId: 'EMP004', 
              name: '赵六', 
              departmentId: '3',
              position: '仓库管理员', 
              hireDate: '2025-01-12', 
              salaryType: 'FIXED', 
              baseSalary: 5500, 
              phone: '13800138004', 
              status: 'probation' 
            },
          ];
          setEmployees(mockData);
          return true; // Mock数据也算成功
        }
      }
      return false; // 失败标记
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchEmployees();
  }, []);
  
  // 过滤员工数据 - 使用useMemo缓存，提高性能
  const filteredEmployees = useMemo(() => {
    let data = employees;
    // 部门过滤
    if (selectedDepartment !== '全部') {
      data = data.filter(e => e.departmentId === selectedDepartment);
    }
    // 关键字搜索
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      data = data.filter(e =>
        String(e.employeeId).toLowerCase().includes(kw) ||
        String(e.name).toLowerCase().includes(kw)
      );
    }
    return data;
  }, [employees, selectedDepartment, searchText]);
  
  // 封装API错误处理函数，提高代码可读性和可维护性
  const showApiError = (error: any) => {
    const code = error.response?.status;
    const msgMap: Record<number, string> = {
      400: '输入数据无效，请检查后重试',
      403: '无权限执行此操作',
      404: '员工不存在',
    };
    message.error(msgMap[code] || '操作失败，请稍后重试');
  };
  
  // 处理编辑按钮 - 统一salaryType大小写和部门数据
  const handleEdit = (record: any) => {
    // 修复salaryType大小写不一致问题
    const fixedRecord = { 
      ...record, 
      salaryType: String(record.salaryType).toUpperCase(),
      // 直接使用departmentId字段
      departmentId: record.departmentId,
      // 处理日期数据，转换为dayjs对象
      hireDate: dayjs(record.hireDate)
    };
    
    setEditingEmployee(fixedRecord);
    form.setFieldsValue(fixedRecord);
    setIsModalVisible(true);
  };
  
  // 处理删除按钮
  const handleDelete = (record: any) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除员工 "${record.name}" 吗？删除后数据不可恢复。`,
      okText: '确定',
      cancelText: '取消',
      okType: 'danger',
      onOk: async () => {
        try {
          // 调用后端删除 API
          await personnelApi.deleteEmployee(record.id);
          
          setEmployees(prev => prev.filter(emp => emp.id !== record.id));
          message.success('员工删除成功');
        } catch (error: any) {
          console.error('删除员工失败:', error);
          showApiError(error);
        }
      }
    });
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      // 统一处理表单数据
      let values = await form.validateFields();
      
      // 处理日期字段 - 转换为YYYY-MM-DD格式
      const hireDate = values.hireDate.format('YYYY-MM-DD');

      // 构建最终提交数据（2+A：employeeId 由后端生成，前端不生成也不提交）
      const submitValues: any = {
        ...values,
        salaryType: String(values.salaryType).toUpperCase(),
        status: String(values.status).toUpperCase(),
        hireDate,
      };

      // 移除多余字段
      delete submitValues.employeeId;
      
      if (editingEmployee) {
        // 更新时不应提交入职日期
        delete submitValues.hireDate;
        // 调用后端更新 API
        await personnelApi.updateEmployee(editingEmployee.id, submitValues);

        // 统一以重新拉取列表为准，保证与后端一致
        const ok = await fetchEmployees();
        if (ok) {
          message.success('员工信息更新成功');
        }
      } else {
        // 调用后端创建 API
        await personnelApi.createEmployee(submitValues);

        // 统一以重新拉取列表为准，保证与后端一致
        const ok = await fetchEmployees();
        if (ok) {
          message.success('员工创建成功');
        }
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingEmployee(null);
    } catch (error: any) {
      console.error('保存员工失败:', error);
      showApiError(error);
    }
  };
  
  // 处理取消
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingEmployee(null);
  };
  
  // 处理新增按钮
  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const columns = [
    { title: '员工ID', dataIndex: 'employeeId', key: 'employeeId' },
    { title: '姓名', dataIndex: 'name', key: 'name', render: (name: string) => <Space><UserOutlined />{name}</Space> },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <h1>人员管理</h1>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="输入员工ID/姓名搜索"
            allowClear
            style={{ width: 220 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <Select
            placeholder="选择部门"
            style={{ width: 150 }}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            allowClear={false}
          >
            <Option key="全部" value="全部">全部</Option>
            {departments.map(dep => (
              <Option key={dep.id} value={dep.id}>{dep.name}</Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增员工
          </Button>
        </div>
      </div>
      
      {/* 移除variant="outlined"属性，兼容Ant Design v4 */}
      <Card title="员工列表">
        <Spin spinning={loading}>
          <Table 
            columns={columns} 
            dataSource={filteredEmployees} 
            rowKey="id" 
            pagination={{ pageSize: 10 }} 
          />
        </Spin>
      </Card>
      
      <Modal
        title={editingEmployee ? '编辑员工' : '新增员工'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={600}
        okText="确定"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: 'ACTIVE', salaryType: 'PIECE' }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>
          
          <Form.Item
            name="departmentId"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              {departments.map(dep => (
                <Option key={dep.id} value={dep.id}>{dep.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="position"
            label="职位"
            rules={[{ required: true, message: '请输入职位' }]}
          >
            <Input placeholder="请输入职位" />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
            ]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item
            name="hireDate"
            label="入职日期"
            rules={[{ required: true, message: '请选择入职日期' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="salaryType"
            label="薪资类型"
            rules={[{ required: true, message: '请选择薪资类型' }]}
          >
            <Select placeholder="请选择薪资类型">
              <Option value="PIECE">计件</Option>
              <Option value="TIME">计时</Option>
              <Option value="FIXED">固定</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.salaryType !== currentValues.salaryType
            }
          >
            {({ getFieldValue }) => {
              const salaryType = getFieldValue('salaryType');
              return salaryType === 'PIECE' ? (
                <Form.Item
                  name="pieceRate"
                  label="计件单价（元/件）"
                  rules={[{ required: true, message: '请输入计件单价' }]}
                >
                  <Input type="number" step="0.01" placeholder="请输入计件单价" />
                </Form.Item>
              ) : (
                <Form.Item
                  name="baseSalary"
                  label={salaryType === 'TIME' ? '计时工资（元/时）' : '基本工资（元）'}
                  rules={[{ required: true, message: '请输入基本工资' }]}
                >
                  <Input type="number" placeholder={salaryType === 'TIME' ? '请输入计时工资' : '请输入基本工资'} />
                </Form.Item>
              );
            }}
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="ACTIVE">在职</Option>
              <Option value="PROBATION">试用期</Option>
              <Option value="INACTIVE">离职</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Personnel;
