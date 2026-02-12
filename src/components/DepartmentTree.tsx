import React, { useRef } from 'react';
import { Tree, Tag, Dropdown, Button, Space, Popover, List, Typography } from 'antd';
import type { DataNode } from 'antd/es/tree';
import { useDrop } from 'react-dnd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UndoOutlined,
  ClearOutlined,
  MoreOutlined,
  UserOutlined,
  TeamOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import type { Department } from '../services/department';
import { useUserStore } from '../stores/userStore';

const { Text } = Typography;

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
  depth: number;
  children: React.ReactNode;
}> = ({ department, showDeleted, onDropEmployee, depth, children }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: 'EMPLOYEE',
    drop: (item: { employeeIds: string[] }) => {
      // 仅岗位层（depth=2）允许接收调配
      if (!department.deletedAt && depth === 2) {
        onDropEmployee(item.employeeIds, department.id);
      }
    },
    canDrop: () => !department.deletedAt && !showDeleted && depth === 2,
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

// 计算部门及其所有子部门的总人数，并附带层级信息
const getDeptInfo = (dept: Department, depth = 0): any => {
  const directCount =
    (dept as any)?._count?.employees ??
    (Array.isArray((dept as any).employees) ? (dept as any).employees.length : undefined) ??
    (dept as any).employeeCount ??
    0;

  const children = dept.children || [];
  let totalCount = directCount;
  const allEmployeesWithPost: any[] = (dept as any).employees?.map((e: any) => ({ ...e, postName: dept.name })) || [];

  for (const child of children) {
    const childInfo = getDeptInfo(child, depth + 1);
    totalCount += childInfo.totalCount;
    allEmployeesWithPost.push(...childInfo.allEmployeesWithPost);
  }

  return { totalCount, depth, allEmployeesWithPost };
};

// 将部门数据转换为 Tree 的 DataNode 格式
const convertToTreeData = (
  departments: Department[],
  showDeleted: boolean,
  onDropEmployee: (employeeIds: string[], departmentId: string) => void,
  depth = 0
): DataNode[] => {
  return departments
    .filter((dept) => showDeleted || !dept.deletedAt)
    .map((dept) => {
      const isDeleted = !!dept.deletedAt;
      const { totalCount: count, allEmployeesWithPost } = getDeptInfo(dept, depth);

      return {
        key: dept.id,
        title: (
          <DroppableTreeNode
            department={dept}
            showDeleted={showDeleted}
            onDropEmployee={onDropEmployee}
            depth={depth}
          >
            <Popover
              placement="right"
              mouseEnterDelay={0.2}
              content={
                <div style={{ maxWidth: 300 }}>
                  <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <UserOutlined />
                    <Text strong>负责人：</Text>
                    <Text>{(dept as any)?.leader?.name || '未设置'}</Text>
                  </div>

                  {depth === 0 ? (
                    // 部门层：显示负责人 + 子部门(组)名称
                    <div>
                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ApartmentOutlined />
                        <Text strong>包含组：</Text>
                      </div>
                      <List
                        size="small"
                        dataSource={(dept.children || []).map((c) => c.name)}
                        locale={{ emptyText: '无' }}
                        renderItem={(name) => (
                          <List.Item style={{ padding: '2px 0' }}>
                            <Text>{name}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  ) : depth === 1 ? (
                    // 组层：显示负责人 + 成员及其岗位
                    <div>
                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined />
                        <Text strong>成员及岗位：</Text>
                      </div>
                      <List
                        size="small"
                        dataSource={allEmployeesWithPost}
                        locale={{ emptyText: '无' }}
                        renderItem={(emp: any) => (
                          <List.Item style={{ padding: '2px 0' }}>
                            <Text>{emp.name}</Text>
                            <Tag size="small" style={{ marginLeft: 8 }}>{emp.postName}</Tag>
                          </List.Item>
                        )}
                      />
                    </div>
                  ) : (
                    // 岗位层：仅显示负责人和直属成员
                    <div>
                      <div style={{ marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TeamOutlined />
                        <Text strong>成员：</Text>
                      </div>
                      <List
                        size="small"
                        dataSource={((dept as any).employees || []).map((e: any) => e.name)}
                        locale={{ emptyText: '无' }}
                        renderItem={(name) => (
                          <List.Item style={{ padding: '2px 0' }}>
                            <Text>{name}</Text>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}
                </div>
              }
            >
              <span style={{ color: isDeleted ? '#aaa' : undefined }}>
                {dept.name}
                {isDeleted && (
                  <Tag color="error" style={{ marginLeft: 8 }}>
                    已删除
                  </Tag>
                )}
                <Tag style={{ marginLeft: 8 }}>{count} 人</Tag>
              </span>
            </Popover>
          </DroppableTreeNode>
        ),
        children: dept.children
          ? convertToTreeData(dept.children, showDeleted, onDropEmployee, depth + 1)
          : undefined,
        isLeaf: !dept.children || dept.children.length === 0,
        disabled: isDeleted && !showDeleted,
        data: { ...dept, depth },
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
          ...(department.depth === 2
            ? []
            : [
                {
                  key: 'addChild',
                  label: department.depth === 0 ? '新增组' : '新增岗位',
                  icon: <PlusOutlined />,
                  onClick: () => onAddChild(department.id),
                },
              ]),
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

