import { useMemo } from 'react';
import { Alert, Card, Collapse, Space, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { Department } from '../../services/department';

interface Props {
  departments: Department[];
  showDeleted: boolean;
}

const flatten = (nodes: Department[], depth = 0): Array<{ node: Department; depth: number }> => {
  const res: Array<{ node: Department; depth: number }> = [];
  for (const n of nodes || []) {
    res.push({ node: n, depth });
    if (n.children?.length) {
      res.push(...flatten(n.children, depth + 1));
    }
  }
  return res;
};

const DepartmentMobile = ({ departments, showDeleted }: Props) => {
  const navigate = useNavigate();

  const groups = useMemo(() => {
    const roots = departments || [];
    return roots.map((root) => {
      const all = flatten([root]);
      const list = showDeleted ? all : all.filter((x) => !x.node.deletedAt);
      return { root, list };
    });
  }, [departments, showDeleted]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <h1>部门管理</h1>
      </div>

      <Alert message="该业务操作请在电脑端网页完成" type="info" showIcon style={{ marginBottom: 12 }} />

      <Card title="部门浏览">
        <Collapse
          accordion
          items={groups.map(({ root, list }) => ({
            key: root.id,
            label: (
              <Space size={8}>
                <span>{root.name}</span>
                {root.status === 1 ? <Tag color="success">正常</Tag> : <Tag color="default">停用</Tag>}
                {root.deletedAt ? <Tag color="error">已删除</Tag> : null}
              </Space>
            ),
            children: (
              <div>
                {list.map(({ node, depth }) => (
                  <div
                    key={node.id}
                    style={{
                      padding: '10px 8px',
                      borderBottom: '1px solid #f0f0f0',
                      marginLeft: depth * 12,
                      cursor: 'pointer'
                    }}
                    onClick={() => navigate(`/department/${node.id}`)}
                  >
                    <Space size={8} style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>{node.name}</span>
                      <Space size={6}>
                        {node.employeeCount != null ? <Tag color="blue">{node.employeeCount}人</Tag> : null}
                        {node.deletedAt ? <Tag color="error">删</Tag> : null}
                      </Space>
                    </Space>
                  </div>
                ))}
              </div>
            )
          }))}
        />
      </Card>
    </div>
  );
};

export default DepartmentMobile;
