import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, Tag, message } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import personnelApi from '../../services/personnel';
import type { Employee } from '../../services/personnel';
import { useReadonly } from '../../contexts/ReadonlyContext';

const PersonnelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();

  const [loading, setLoading] = useState(false);
  const [employee, setEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await personnelApi.getEmployeeById(id);
        setEmployee(res.employee);
      } catch (e: any) {
        message.error(e?.response?.data?.message || '获取员工详情失败');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const statusTag = useMemo(() => {
    const s = (employee as any)?.status;
    if (!s) return null;
    const map: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: '在职' },
      probation: { color: 'processing', text: '试用' },
      inactive: { color: 'default', text: '离职' }
    };
    const cfg = map[s] || { color: 'default', text: String(s) };
    return <Tag color={cfg.color}>{cfg.text}</Tag>;
  }, [employee]);

  return (
    <div className="page-container">
      <Card
        title={
          <Space size="middle">
            <span>员工详情</span>
            {statusTag}
          </Space>
        }
        extra={<Button onClick={() => navigate('/personnel')}>返回列表</Button>}
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
        ) : !employee ? (
          <div>未找到该员工</div>
        ) : (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="员工ID">{employee.employeeId || '-'}</Descriptions.Item>
            <Descriptions.Item label="姓名">{employee.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{employee.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="部门">{employee.departmentName || '-'}</Descriptions.Item>
            <Descriptions.Item label="岗位">{employee.position || '-'}</Descriptions.Item>
            <Descriptions.Item label="入职日期">{employee.hireDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="工资类型">{employee.salaryType || '-'}</Descriptions.Item>
            <Descriptions.Item label="基础工资">{employee.baseSalary ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="计件单价">{employee.pieceRate ?? '-'}</Descriptions.Item>
            <Descriptions.Item label="地址">{employee.address || '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default PersonnelDetail;

