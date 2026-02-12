import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentApi } from '../../services/department';
import type { Department } from '../../services/department';
import { useReadonly } from '../../contexts/ReadonlyContext';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [dept, setDept] = useState<Department | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await departmentApi.getDepartmentById(id);
        setDept(res.department);
      } catch (e: any) {
        message.error(e?.response?.data?.message || '获取部门详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const statusTag = useMemo(() => {
    if (!dept) return null;
    const enabled = dept.status === 1;
    return <Tag color={enabled ? 'success' : 'default'}>{enabled ? '正常' : '停用'}</Tag>;
  }, [dept]);

  return (
    <div className="page-container">
      <Card
        title={
          <Space size="middle">
            <span>部门详情</span>
            {statusTag}
          </Space>
        }
        extra={<Button onClick={() => navigate('/department')}>返回</Button>}
      >
        {isReadonly && (
          <Alert
            message="该业务操作请在电脑端网页完成"
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
          />
        )}

        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : !dept ? (
          <div>未找到该部门</div>
        ) : (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="部门名称">{dept.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="所属厂区">{dept.factoryId || '-'}</Descriptions.Item>
            <Descriptions.Item label="上级部门">{dept.parentId || '-'}</Descriptions.Item>
            <Descriptions.Item label="负责人ID">{dept.leaderId || '-'}</Descriptions.Item>
            <Descriptions.Item label="员工数量">{dept.employeeCount ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="创建时间">{dept.createdAt ? new Date(dept.createdAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{dept.updatedAt ? new Date(dept.updatedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default DepartmentDetail;

