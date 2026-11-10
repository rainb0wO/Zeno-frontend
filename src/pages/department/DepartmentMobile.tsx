import { useMemo } from 'react';
import { Alert, Card, Collapse, Space, Tag, Typography } from 'antd';
import { ApartmentOutlined, RightOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Department } from '../../services/department';

const { Text } = Typography;

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
        <Space>
          <ApartmentOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          <h1 style={{ margin: 0 }}>部门管理</h1>
        </Space>
      </div>

      <Alert message="该业务操作请在电脑端网页完成" type="info" showIcon style={{ marginBottom: 12 }} />

      <Card title="部门组织架构" bodyStyle={{ padding: '0 12px 12px' }}>
        <Collapse
          accordion
          ghost
          expandIconPosition="end"
          items={groups.map(({ root, list }) => ({
            key: root.id,
            label: (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: 24 }}>
                <Space size={8}>
                  <Text strong style={{ fontSize: 16 }}>{root.name}</Text>
                  {root.status === 1 ? <Tag color="success">正常</Tag> : <Tag color="default">停用</Tag>}
                  {root.deletedAt ? <Tag color="error">已删除</Tag> : null}
                </Space>
                <Space size={4} style={{ color: '#8c8c8c', fontSize: 12 }}>
                  <TeamOutlined />
                  <span>{root.employeeCount ?? 0}</span>
                </Space>
              </div>
            ),
            children: (
              <div style={{ background: '#fafafa', borderRadius: 8, padding: '4px 0' }}>
                {list.map(({ node, depth }) => (
                  <div
                    key={node.id}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0',
                      marginLeft: depth * 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'white',
                      margin: '4px 8px',
                      borderRadius: 6,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onClick={() => navigate(`/department/${node.id}`)}
                  >
                    <Space direction="vertical" size={2}>
                      <Space size={8}>
                        <Text style={{ fontSize: 14 }}>{node.name}</Text>
                        {node.deletedAt ? <Tag color="error">删</Tag> : null}
                      </Space>
                      {depth > 0 && (
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          层级: {depth + 1}
                        </Text>
                      )}
                    </Space>
                    <Space size={8}>
                      <Space size={4} style={{ color: '#8c8c8c', fontSize: 12 }}>
                        <TeamOutlined />
                        <span>{node.employeeCount ?? 0}</span>
                      </Space>
                      <RightOutlined style={{ fontSize: 12, color: '#bfbfbf' }} />
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
