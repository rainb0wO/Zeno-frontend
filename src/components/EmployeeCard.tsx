import React from 'react';
import { Avatar, Space } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDrag } from 'react-dnd';
import type { Employee } from '../services/personnel';

interface EmployeeCardProps {
  employee: Employee;
  departmentPath?: string;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  selectedIds?: Set<string>; // 多选时传入已选ID集合
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  departmentPath,
  isSelected = false,
  onSelect,
  selectedIds,
}) => {
  // 如果有多选且当前员工被选中，使用多选ID数组；否则使用单个ID
  const dragItem = selectedIds && selectedIds.has(employee.id)
    ? { employeeIds: Array.from(selectedIds) }
    : { employeeIds: [employee.id] };

  const [{ isDragging }, drag] = useDrag({
    type: 'EMPLOYEE',
    item: dragItem,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(employee.id);
      }}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        backgroundColor: isSelected ? '#e6f7ff' : '#fff',
        transition: 'all 0.2s',
      }}
    >
      <Space>
        <Avatar icon={<UserOutlined />} src={employee.avatar} />
        <div>
          <div style={{ fontWeight: 500 }}>{employee.name}</div>
          {employee.employeeId && (
            <div style={{ fontSize: 12, color: '#999' }}>{employee.employeeId}</div>
          )}
          {departmentPath && (
            <div style={{ fontSize: 12, color: '#1890ff', marginTop: 4 }}>
              组织：{departmentPath}
            </div>
          )}
        </div>
      </Space>
    </div>
  );
};

export default EmployeeCard;

