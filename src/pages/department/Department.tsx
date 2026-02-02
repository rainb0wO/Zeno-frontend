import React, { useState, useEffect } from 'react';
import { Layout, Card, Switch, Space, Modal, Form, Input, message, Select, Button, Grid } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useReadonly } from '../../contexts/ReadonlyContext';
import DepartmentMobile from './DepartmentMobile';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DepartmentTree from '../../components/DepartmentTree';
import EmployeePool from '../../components/EmployeePool';
import type { Department } from '../../services/department';
import { departmentApi } from '../../services/department';
import { useDepartmentStore } from '../../stores/departmentStore';
import { useFactoryStore } from '../../stores/factoryStore';
import { useUserStore } from '../../stores/userStore';
import personnelApi from '../../services/personnel';

const { Content, Sider } = Layout;

const Department: React.FC = () => {
  const screens = Grid.useBreakpoint();
  const { isReadonly, showTip } = useReadonly();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);

  const isMobileView = !screens.md;

  const {
    departments,
    showDeleted,
    setDepartments,
    setShowDeleted,
    setLoading,
  } = useDepartmentStore();

  const { currentFactory } = useFactoryStore();
  const { hasRole } = useUserStore();

  // 加载部门树
  const loadDepartments = async () => {
    if (!currentFactory?.id) return;

    setLoading(true);
    try {
      const response: any = await departmentApi.getDepartments({
        factoryId: currentFactory.id,
        includeDeleted: showDeleted,
      });

      const list: Department[] =
        response?.departments?.items ||
        response?.departments ||
        response?.department ||
        [];

      const tree = buildTree(list);
      setDepartments(tree);
    } catch (error: any) {
      console.error('加载部门列表失败:', error);
      message.error('加载部门列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 构建树形结构
  const buildTree = (list: Department[]): Department[] => {
    const map = new Map<string, Department>();
    const roots: Department[] = [];

    const normalizeParentId = (v: unknown): string | null => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      if (!s) return null;
      if (s.toLowerCase() === 'null') return null;
      if (s === '0') return null;
      return s;
    };

    list.forEach((dept) => {
      map.set(dept.id, { ...dept, children: [] });
    });

    list.forEach((dept) => {
      const node = map.get(dept.id)!;
      const pid = normalizeParentId((dept as any).parentId);

      if (!pid) {
        roots.push(node);
        return;
      }

      const parent = map.get(pid);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  useEffect(() => {
    loadDepartments();
  }, [currentFactory?.id, showDeleted]);

  // 新增根部门
  const handleAddRoot = () => {
    if (isReadonly) {
      showTip();
      return;
    }
    setEditingDepartment(null);
    setParentId(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 新增子部门
  const handleAddChild = (parentId: string) => {
    if (isReadonly) {
      showTip();
      return;
    }
    setEditingDepartment(null);
    setParentId(parentId);
    form.resetFields();
    setIsModalVisible(true);
  };

  // 编辑部门
  const handleEdit = (department: Department) => {
    if (isReadonly) {
      showTip();
      return;
    }
    setEditingDepartment(department);
    setParentId(null);
    form.setFieldsValue({
      name: department.name,
      leaderId: department.leaderId,
    });
    setIsModalVisible(true);
  };

  // 删除部门
  const handleDelete = (department: Department) => {
    if (isReadonly) {
      showTip();
      return;
    }
    Modal.confirm({
      title: '删除部门',
      content:
        '删除后，该部门及其所有下级部门、员工、考勤和排班记录将被标记为"已删除"，在正常页面中不再显示，但仍可在历史报表查询。此操作可在30天内联系管理员恢复。确认继续？',
      okText: '确认删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await departmentApi.deleteDepartment(department.id);
          message.success(`删除成功，影响 ${response.cascadeCount} 条记录`);
          await loadDepartments();
        } catch (error: any) {
          console.error('删除部门失败:', error);
          message.error(error.response?.data?.message || '删除部门失败');
        }
      },
    });
  };

  // 恢复部门
  const handleRestore = (department: Department) => {
    if (isReadonly) {
      showTip();
      return;
    }
    Modal.confirm({
      title: '恢复部门',
      content: `确认要恢复部门 "${department.name}" 及其所有下级数据吗？`,
      okText: '确认恢复',
      cancelText: '取消',
      onOk: async () => {
        try {
          await departmentApi.restoreDepartment(department.id);
          message.success('恢复成功');
          await loadDepartments();
        } catch (error: any) {
          console.error('恢复部门失败:', error);
          message.error(error.response?.data?.message || '恢复部门失败');
        }
      },
    });
  };

  // 永久清除
  const handleForceDelete = (department: Department) => {
    if (isReadonly) {
      showTip();
      return;
    }
    Modal.confirm({
      title: '永久清除部门',
      content: '此操作将彻底删除该部门及全部下级数据且无法恢复。确认要永久清除？',
      okText: '确认清除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await departmentApi.forceDeleteDepartment(department.id);
          message.success('永久清除成功');
          await loadDepartments();
        } catch (error: any) {
          console.error('永久清除失败:', error);
          message.error(error.response?.data?.message || '永久清除失败');
        }
      },
    });
  };

  // 提交表单
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!currentFactory?.id) {
        message.error('请先选择厂区');
        return;
      }

      if (editingDepartment) {
        // 更新
        await departmentApi.updateDepartment(editingDepartment.id, {
          name: values.name,
          leaderId: values.leaderId || null,
        });
        message.success('更新成功');
      } else {
        // 新增
        await departmentApi.createDepartment({
          name: values.name,
          factoryId: currentFactory.id,
          parentId: parentId || null,
          leaderId: values.leaderId || null,
        });
        message.success('创建成功');
      }

      setIsModalVisible(false);
      form.resetFields();
      setEditingDepartment(null);
      setParentId(null);
      await loadDepartments();
    } catch (error: any) {
      console.error('保存部门失败:', error);
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(error.response?.data?.message || '保存部门失败');
    }
  };

  // 拖拽分配员工
  const handleDropEmployee = async (employeeIds: string[], departmentId: string) => {
    try {
      // 检查是否有员工已分配部门（跨部门调动）
      const employeesResponse = await personnelApi.getEmployees();
      const employees = employeesResponse.employees || [];
      const hasAssigned = employeeIds.some(id => {
        const emp = employees.find(e => e.id === id);
        return emp && emp.departmentId && emp.departmentId !== departmentId;
      });

      if (hasAssigned) {
        Modal.confirm({
          title: '跨部门调动确认',
          content: `员工已在其他部门，确认调至「${departments.find(d => d.id === departmentId)?.name || '该部门'}」吗？`,
          okText: '确认调动',
          cancelText: '取消',
          onOk: async () => {
            await doAssignEmployees(employeeIds, departmentId);
          },
        });
      } else {
        await doAssignEmployees(employeeIds, departmentId);
      }
    } catch (error: any) {
      console.error('分配员工失败:', error);
      message.error(error.response?.data?.message || '分配员工失败');
    }
  };

  // 执行分配
  const doAssignEmployees = async (employeeIds: string[], departmentId: string) => {
    try {
      const response = await departmentApi.assignEmployees(departmentId, {
        employeeIds,
      });
      message.success(`已调配 ${response.updated} 名员工`);
      await loadDepartments();
    } catch (error: any) {
      console.error('分配员工失败:', error);
      message.error(error.response?.data?.message || '分配员工失败');
    }
  };

  // 获取员工列表（用于选择负责人）
  const [employees, setEmployees] = useState<any[]>([]);
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await personnelApi.getEmployees();
        setEmployees(response.employees || []);
      } catch (error) {
        console.error('获取员工列表失败:', error);
      }
    };
    fetchEmployees();
  }, []);

  if (isMobileView) {
    return <DepartmentMobile departments={departments} showDeleted={showDeleted} />;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h1>部门管理</h1>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddRoot}
            >
              新增部门
            </Button>
            <span>显示已删除：</span>
            <Switch checked={showDeleted} onChange={setShowDeleted} />
          </Space>
        </div>

        <Layout style={{ height: 'calc(100vh - 120px)' }}>
          <Sider width={400} style={{ backgroundColor: '#fff', padding: 16 }}>
            <Card title="部门树" style={{ height: '100%' }}>
              <DepartmentTree
                departments={departments}
                showDeleted={showDeleted}
                onAddChild={handleAddChild}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onRestore={handleRestore}
                onForceDelete={handleForceDelete}
                onDropEmployee={handleDropEmployee}
              />
            </Card>
          </Sider>

          <Content style={{ marginLeft: 16, backgroundColor: '#fff', padding: 16 }}>
            <EmployeePool onAssignEmployees={handleDropEmployee} />
          </Content>
        </Layout>

        {/* 新增/编辑部门弹窗 */}
        <Modal
          title={editingDepartment ? '编辑部门' : parentId ? '新增子部门' : '新增部门'}
          open={isModalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setEditingDepartment(null);
            setParentId(null);
          }}
          okText="确定"
          cancelText="取消"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="部门名称"
              rules={[{ required: true, message: '请输入部门名称' }]}
            >
              <Input placeholder="请输入部门名称" />
            </Form.Item>

            <Form.Item name="leaderId" label="负责人">
              <Select
                placeholder="请选择负责人"
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              >
                {employees.map(emp => (
                  <Select.Option key={emp.id} value={emp.id} label={emp.name}>
                    {emp.name} ({emp.employeeId || emp.id})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default Department;

