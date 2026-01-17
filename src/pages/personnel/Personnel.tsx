import { useState, useEffect } from 'react';
import { Card, Button, Table, Space, Select, Modal, Form, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import personnelApi from '../../services/personnel';

const { Option } = Select;

const Personnel = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [form] = Form.useForm();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('全部');
  
  // 部门选项
  const departmentOptions = ['全部', '生产部', '质检部', '物流部'];
  
  // 从后端获取员工数据
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        // 假设当前用户只有一个工厂，所以没有传递factoryId
        const response = await personnelApi.getEmployees();
        setEmployees(response.employees || response || []);
      } catch (error) {
        console.error('获取员工列表失败:', error);
        message.error('获取员工列表失败');
        
        // 保留Mock数据作为备用（仅开发环境使用）
        if (import.meta.env.DEV) {
          const mockData = [
            { 
              id: '1', 
              employeeId: 'EMP001', 
              name: '张三', 
              department: '生产部', 
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
              department: '生产部', 
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
              department: '质检部', 
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
              department: '物流部', 
              position: '仓库管理员', 
              hireDate: '2025-01-12', 
              salaryType: 'FIXED', 
              baseSalary: 5500, 
              phone: '13800138004', 
              status: 'probation' 
            },
          ];
          setEmployees(mockData);
        }
      }
    };
    
    fetchEmployees();
  }, []);
  
  // 过滤员工数据 - 兼容department为对象或字符串的情况
  const filteredEmployees = selectedDepartment === '全部'
    ? employees
    : employees.filter(e => {
        const empDepartment = typeof e.department === 'object' ? e.department.name : e.department;
        return empDepartment === selectedDepartment;
      });
  
  // 处理编辑按钮 - 统一salaryType大小写
  const handleEdit = (record: any) => {
    // 修复salaryType大小写不一致问题
    const fixedRecord = { 
      ...record, 
      salaryType: String(record.salaryType).toUpperCase() 
    };
    
    setEditingEmployee(record);
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
        } catch (error) {
          console.error('删除员工失败:', error);
          message.error('操作失败，请稍后重试');
        }
      }
    });
  };
  
  // 处理表单提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingEmployee) {
        // 调用后端更新 API - 兼容不同的返回格式
        const updated = await personnelApi.updateEmployee(editingEmployee.id, values);
        const updatedEmployee = updated.employee || updated;
        
        setEmployees(prev => prev.map(emp => 
          emp.id === editingEmployee.id ? { ...emp, ...updatedEmployee } : emp
        ));
        message.success('员工信息更新成功');
      } else {
        // 调用后端创建 API - 兼容不同的返回格式
        const newEmployeeData = await personnelApi.createEmployee(values);
        const newEmployee = newEmployeeData.employee || newEmployeeData;
        
        setEmployees(prev => [...prev, newEmployee]);
        message.success('员工创建成功');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      setEditingEmployee(null);
    } catch (error) {
      console.error('保存员工失败:', error);
      message.error('操作失败，请稍后重试');
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
    { 
      title: '部门', 
      dataIndex: 'department', 
      key: 'department',
      render: (dep: any) => typeof dep === 'object' ? dep.name : dep
    },
    { title: '职位', dataIndex: 'position', key: 'position' },
    { title: '入职日期', dataIndex: 'hireDate', key: 'hireDate' },
    { 
      title: '薪资类型', 
      dataIndex: 'salaryType', 
      key: 'salaryType', 
      render: (type: string) => {
        switch(type.toUpperCase()) {
          case 'PIECE': return '计件';
          case 'TIME': return '计时';
          case 'FIXED': return '固定';
          default: return type;
        }
      }
    },
    { 
      title: '薪资标准', 
      dataIndex: ['baseSalary', 'pieceRate'], 
      key: 'salaryStandard', 
      render: (_: any, record: any) => {
        const salaryType = String(record.salaryType).toUpperCase();
        if (salaryType.match(/PIECE/i)) {
          return `¥${record.pieceRate}/件`;
        } else if (salaryType.match(/TIME/i)) {
          return `¥${record.baseSalary}/时`;
        } else {
          return `¥${record.baseSalary}`;
        }
      }
    },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => {
        switch(status) {
          case 'active': return <span style={{ color: '#3f8600' }}>在职</span>;
          case 'probation': return <span style={{ color: '#1890ff' }}>试用期</span>;
          case 'inactive': return <span style={{ color: '#cf1322' }}>离职</span>;
          default: return status;
        }
      }
    },
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
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Select 
            placeholder="选择部门" 
            style={{ width: 150 }} 
            value={selectedDepartment}
            onChange={setSelectedDepartment}
          >
            {departmentOptions.map(dep => (
              <Option key={dep} value={dep}>{dep}</Option>
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
        <Table 
          columns={columns} 
          dataSource={filteredEmployees} 
          rowKey="id" 
          pagination={{ pageSize: 10 }} 
        />
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
          initialValues={{ status: 'active', salaryType: 'PIECE' }}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>
          
          <Form.Item
            name="department"
            label="部门"
            rules={[{ required: true, message: '请选择部门' }]}
          >
            <Select placeholder="请选择部门">
              <Option value="生产部">生产部</Option>
              <Option value="质检部">质检部</Option>
              <Option value="物流部">物流部</Option>
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
            rules={[{ required: true, message: '请输入入职日期' }]}
          >
            <Input type="date" />
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
              <Option value="active">在职</Option>
              <Option value="probation">试用期</Option>
              <Option value="inactive">离职</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Personnel;
