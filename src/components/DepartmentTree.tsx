import React, { useRef } from 'react';
import { Tree, Tag, Dropdown, Button, Space, message } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useDrop } from 'react-dnd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  ClearOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import type { Department } from '../services/department';
import { useUserStore } from '../stores/userStore';

interface DepartmentTreeProps {
  departments: Department[];
  showDeleted: boolean;
  onAddChild: (parentId: string) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onRestore: (department: Department) => void;
  onForceDelete: (department: Department) => void;
  onDropEmployee: (employeeIds: string[], departmentId: string) => void;
}

// 可拖放的目标节点组件
const DroppableTreeNode: React.FC<{
  department: Department;
  showDeleted: boolean;
  onDropEmployee: (employeeIds: string[], departmentId: string) => void;
  children: React.ReactNode;
}> = ({ department, showDeleted, onDropEmployee, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'EMPLOYEE',
    drop: (item: { employeeIds: string[] }) => {
      if (!department.deletedAt) {
        onDropEmployee(item.employeeIds, department.id);
      }
    },
    canDrop: () => !department.deletedAt && !showDeleted,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const ref = useRef<HTMLDivElement>(null);
  drop(ref);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: isOver && canDrop ? '#e6f7ff' : 'transparent',
        padding: '4px 8px',
        borderRadius: 4,
        transition: 'background-color 0.2s',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

// 将部门数据转换为 Tree 的 DataNode 格式
const convertToTreeData = (
  departments: Department[],
  showDeleted: boolean,
  onDropEmployee: (employeeIds: string[], departmentId: string) => void
): DataNode[] => {
  return departments
    .filter(dept => showDeleted || !dept.deletedAt)
    .map(dept => {
      const isDeleted = !!dept.deletedAt;
      const count =
        (dept as any)?._count?.employees ??
        (Array.isArray((dept as any).employees) ? (dept as any).employees.length : undefined) ??
        (dept as any).employeeCount ??
        0;
      
      return {
        key: dept.id,
        title: (
          <DroppableTreeNode
            department={dept}
            showDeleted={showDeleted}
            onDropEmployee={onDropEmployee}
          >
            <span style={{ color: isDeleted ? '#aaa' : undefined }}>
              {dept.name}
              {isDeleted && <Tag color="error" style={{ marginLeft: 8 }}>已删除</Tag>}
              <Tag style={{ marginLeft: 8 }}>{count} 人</Tag>
            </span>
          </DroppableTreeNode>
        ),
        children: dept.children ? convertToTreeData(dept.children, showDeleted, onDropEmployee) : undefined,
        isLeaf: !dept.children || dept.children.length === 0,
        disabled: isDeleted && !showDeleted,
        data: dept,
      };
    });
};

const DepartmentTree: React.FC<DepartmentTreeProps> = ({
  departments,
  showDeleted,
  onAddChild,
  onEdit,
  onDelete,
  onRestore,
  onForceDelete,
  onDropEmployee,
}) => {
  const { hasRole } = useUserStore();
  const isSuperAdmin = hasRole('super_admin');

  // 渲染树节点
  const renderTreeNode = (node: DataNode): React.ReactNode => {
    const department = node.data as Department;
    if (!department) return node.title;

    const isDeleted = !!department.deletedAt;

    const menuItems = isDeleted
      ? [
          {
            key: 'restore',
            label: '恢复',
            icon: <UndoOutlined />,
            onClick: () => onRestore(department),
          },
          ...(isSuperAdmin
            ? [
                {
                  key: 'forceDelete',
                  label: '永久清除',
                  icon: <ClearOutlined />,
                  danger: true,
                  onClick: () => onForceDelete(department),
                },
              ]
            : []),
        ]
      : [
          {
            key: 'addChild',
            label: '新增子部门',
            icon: <PlusOutlined />,
            onClick: () => onAddChild(department.id),
          },
          {
            key: 'edit',
            label: '编辑',
            icon: <EditOutlined />,
            onClick: () => onEdit(department),
          },
          {
            key: 'delete',
            label: '删除',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: () => onDelete(department),
          },
        ];

    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ flex: 1 }}>{node.title}</div>
        <Dropdown
          menu={{ items: menuItems }}
          trigger={['click']}
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    );
  };

  const treeData = convertToTreeData(departments, showDeleted, onDropEmployee);

  return (
    <Tree
      treeData={treeData}
      defaultExpandAll
      showLine={{ showLeafIcon: false }}
      titleRender={(node) => renderTreeNode(node)}
    />
  );
};

export default DepartmentTree;

