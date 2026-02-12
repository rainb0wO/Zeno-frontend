import React, { useState, useEffect, useMemo } from 'react';
import { Card, Tabs, Input, Space, Checkbox, Alert, Spin, Empty, Button, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { DndProvider, useDrag } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import EmployeeCard from './EmployeeCard';
import type { Employee } from '../services/personnel';
import personnelApi from '../services/personnel';
import { useUserStore } from '../stores/userStore';

interface EmployeePoolProps {
  onAssignEmployees: (employeeIds: string[], departmentId: string) => void;
}

// 多选拖拽容器组件
const MultiSelectDragContainer: React.FC<{
  employeeIds: string[];
  children: React.ReactNode;
}> = ({ employeeIds, children }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'EMPLOYEE',
    item: { employeeIds },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
      }}
    >
      {children}
    </div>
  );
};

const EmployeePool: React.FC<EmployeePoolProps> = ({ onAssignEmployees }) => {
  const { user } = useUserStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');

  // 获取员工列表
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params: any = {
        factoryId: user?.factoryId // 显式传递 factoryId 确保隔离
      };
      if (activeTab === 'unassigned') {
        params.unassigned = '1';
      }
      const response = await personnelApi.getEmployees(params);
      setEmployees(response.employees || []);
    } catch (error) {
      console.error('获取员工列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [activeTab, user?.factoryId]); // 监听 factoryId 变化以重拉数据

  // 过滤员工
  const filteredEmployees = useMemo(() => {
    let result = employees;
    
    if (searchText.trim()) {
      const kw = searchText.trim().toLowerCase();
      result = result.filter(
        emp =>
          emp.name?.toLowerCase().includes(kw) ||
          emp.employeeId?.toLowerCase().includes(kw)
      );
    }

    return result;
  }, [employees, searchText]);

  const isUnassigned = (deptId: unknown) => {
    if (deptId === null || deptId === undefined) return true;
    const s = String(deptId).trim();
    if (!s) return true;
    if (s.toLowerCase() === 'null') return true;
    if (s === '0') return true;
    return false;
  };

  // 未分配员工数量
  const unassignedCount = useMemo(() => {
    return employees.filter(emp => isUnassigned((emp as any).departmentId)).length;
  }, [employees]);

  // 切换选择
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(emp => emp.id)));
    }
  };

  // 获取选中的员工ID数组（用于拖拽）
  const selectedEmployeeIds = Array.from(selectedIds);

  return (
    <DndProvider backend={HTML5Backend}>
      <Card
        title="员工池"
        extra={
          <Space>
            <Input
              placeholder="搜索员工"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
            {filteredEmployees.length > 0 && (
              <Checkbox
                checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                indeterminate={selectedIds.size > 0 && selectedIds.size < filteredEmployees.length}
                onChange={toggleSelectAll}
              >
                全选
              </Checkbox>
            )}
            {selectedIds.size > 0 && (
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  // 可以通过按钮触发拖拽，或者直接显示提示
                  message.info(`已选中 ${selectedIds.size} 名员工，请拖拽到目标部门`);
                }}
              >
                已选 {selectedIds.size} 人
              </Button>
            )}
          </Space>
        }
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, overflow: 'auto' }}
      >
        {unassignedCount > 0 && (
          <Alert
            message={`共有 ${unassignedCount} 名员工未分配部门，请尽快完成调配`}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: `全部员工 (${employees.length})`,
            },
            {
              key: 'unassigned',
              label: `未分配部门 (${unassignedCount})`,
            },
          ]}
        />

        <Spin spinning={loading}>
          {filteredEmployees.length === 0 ? (
            <Empty description="暂无员工" />
          ) : (
            <div>
              {/* 多选拖拽容器 */}
              {selectedIds.size > 0 && (
                <MultiSelectDragContainer employeeIds={selectedEmployeeIds}>
                  <Card
                    style={{
                      marginBottom: 16,
                      backgroundColor: '#e6f7ff',
                      border: '2px dashed #1890ff',
                      textAlign: 'center',
                      padding: 16,
                    }}
                  >
                    <Space>
                      <span>已选中 {selectedIds.size} 名员工</span>
                      <span style={{ color: '#999' }}>拖拽此处到目标部门</span>
                    </Space>
                  </Card>
                </MultiSelectDragContainer>
              )}

              <Space direction="vertical" style={{ width: '100%' }} size="small">
                {filteredEmployees.map(employee => (
                  <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    isSelected={selectedIds.has(employee.id)}
                    onSelect={toggleSelect}
                    selectedIds={selectedIds}
                  />
                ))}
              </Space>
            </div>
          )}
        </Spin>
      </Card>
    </DndProvider>
  );
};

export default EmployeePool;

