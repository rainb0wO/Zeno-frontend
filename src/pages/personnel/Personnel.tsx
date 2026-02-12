import { useState, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Space, Modal, Form, Input, message, Spin, Select, Tag, Alert } from 'antd';
import BatchImportModal from '../../components/BatchImportModal';
import ResponsiveDataList from '../../components/ResponsiveDataList';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import personnelApi from '../../services/personnel';
import { useUserStore } from '../../stores/userStore';


const Personnel = () => {
  const { user } = useUserStore();
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
  }, [user?.factoryId]);
  
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
  
  // 处理编辑按钮
  const handleEdit = (record: any) => {
    // 现在仅支持编辑姓名和联系电话，与列表展示字段保持一致
    const simpleRecord = {
      id: record.id,
      name: record.name,
      phone: record.phone,
    };

    setEditingEmployee(simpleRecord);
    form.setFieldsValue(simpleRecord);
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
      // 只校验并获取姓名和联系电话，与「员工列表」展示字段对齐
      const values = await form.validateFields();

      const submitValues: any = {
        name: values.name,
        // 联系电话为非必填，只有在有值时才提交
        ...(values.phone ? { phone: values.phone } : {}),
      };
      
      if (editingEmployee) {
        await personnelApi.updateEmployee(editingEmployee.id, submitValues);

        // 统一以重新拉取列表为准，保证与后端一致
        const ok = await fetchEmployees();
        if (ok) {
          message.success('员工信息更新成功');
        }
      } else {
        await personnelApi.createEmployee(submitValues);

        // 统一以重新拉取列表为准，保证与后端一致
        const ok = await fetchEmployees();
        if (ok) {
          message.success('员工创建成功，请在部门管理中进行分配');
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
  
  // 打开批量导入弹窗
  const [importOpen, setImportOpen] = useState(false);

  const handleBatchImportSuccess = () => {
    fetchEmployees();
  };

  // 处理新增按钮
  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 扁平化部门树用于反查
  const deptMap = useMemo(() => {
    const map = new Map<string, any>();
    const flatten = (list: any[]) => {
      list.forEach((item) => {
        map.set(item.id, item);
        if (item.children) flatten(item.children);
      });
    };
    flatten(departments);
    return map;
  }, [departments]);

  // 根据部门ID反查 部门-组-岗位 路径
  const getDeptPath = (deptId: string) => {
    if (!deptId || !deptMap.has(deptId)) return { dept: null, group: null, post: null };
    
    const node3 = deptMap.get(deptId); // 可能是岗位、组或部门
    const node2 = node3?.parentId ? deptMap.get(node3.parentId) : null;
    const node1 = node2?.parentId ? deptMap.get(node2.parentId) : null;

    // 根据深度判断（depth属性已在DepartmentTree中计算，但在API返回的原始list中没有，我们根据parentId回溯）
    // 岗位(333) -> 组(2222) -> 部门(aaa)
    if (node1) {
      return { dept: node1.name, group: node2?.name, post: node3.name };
    } else if (node2) {
      return { dept: node2.name, group: node3.name, post: null };
    } else {
      return { dept: node3.name, group: null, post: null };
    }
  };

  const columns = [
    { title: '员工ID', dataIndex: 'employeeId', key: 'employeeId' },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <Space>
          <UserOutlined />
          {name}
        </Space>
      ),
    },
    { title: '联系电话', dataIndex: 'phone', key: 'phone' },
    {
      title: '部门',
      dataIndex: 'departmentId',
      key: 'dept',
      render: (deptId: string) => {
        const { dept } = getDeptPath(deptId);
        return dept || <Tag color="default">未分配</Tag>;
      },
    },
    {
      title: '组',
      dataIndex: 'departmentId',
      key: 'group',
      render: (deptId: string) => {
        const { group } = getDeptPath(deptId);
        return group || '-';
      },
    },
    {
      title: '岗位',
      dataIndex: 'departmentId',
      key: 'post',
      render: (deptId: string) => {
        const { post } = getDeptPath(deptId);
        // 如果只有一层，则岗位显示为'-'或部门名，按需调整
        return post || '-';
      },
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

  // 计算未分配员工数量
  const unassignedCount = useMemo(() => {
    return employees.filter(emp => !emp.departmentId).length;
  }, [employees]);

  return (
    <div className="page-container">
      <div className="page-header">
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
            <Select.Option key="全部" value="全部">全部</Select.Option>
            {departments.map(dep => (
              <Select.Option key={dep.id} value={dep.id}>{dep.name}</Select.Option>
            ))}
          </Select>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增员工
          </Button>
          <Button
            onClick={() => setImportOpen(true)}
          >
            批量导入
          </Button>
        </div>
      </div>

      {unassignedCount > 0 && (
        <Alert
          message={`共有 ${unassignedCount} 名员工未分配部门，请在"部门管理"中进行分配`}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* 移除variant="outlined"属性，兼容Ant Design v4 */}
      <Card title="员工列表">
        <Spin spinning={loading}>
          <ResponsiveDataList
            columns={columns}
            dataSource={filteredEmployees}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            onRowClick={(record) => {
              navigate(`/personnel/${record.id}`);
            }}
            mobileRenderItem={(record) => (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Space size={6}>
                    <UserOutlined />
                    <div style={{ fontWeight: 600 }}>{record.name}</div>
                  </Space>
                  {record.departmentName ? (
                    <Tag color="blue">{record.departmentName}</Tag>
                  ) : (
                    <Tag color="default">未分配</Tag>
                  )}
                </Space>
                <div style={{ fontSize: 12, color: '#666' }}>员工ID：{record.employeeId || '-'}</div>
                <div style={{ fontSize: 12, color: '#666' }}>电话：{record.phone || '-'}</div>
              </Space>
            )}
          />
        </Spin>
      </Card>
      
      <BatchImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={handleBatchImportSuccess}
      />

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
          initialValues={{}}
        >
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入员工姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Personnel;
