import { useEffect, useState } from 'react';
import { Alert, Button, Descriptions, Spin } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { readErrorMessage } from '../../domain/apiEnvelope';
import { personnelApi, type Employee } from '../../services/personnel';

const PersonnelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    let alive = true;
    personnelApi.get(id)
      .then((item) => { if (alive) setEmployee(item); })
      .catch((err) => { if (alive) setError(readErrorMessage(err, '找不到该员工')); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id]);

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h1>员工详情</h1>
        <Button onClick={() => navigate('/personnel')}>返回</Button>
      </div>
      {error && <Alert title={error} type="error" showIcon />}
      <Spin spinning={loading}>
        {employee && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="姓名">{employee.name}</Descriptions.Item>
            <Descriptions.Item label="主键">{employee.id}</Descriptions.Item>
            <Descriptions.Item label="工号">{employee.employeeId || '-'}</Descriptions.Item>
            <Descriptions.Item label="岗位">{employee.position || '-'}</Descriptions.Item>
            <Descriptions.Item label="薪资类型">{employee.salaryType || '-'}</Descriptions.Item>
            <Descriptions.Item label="计件单价">{employee.pieceRate ?? '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Spin>
    </div>
  );
};

export default PersonnelDetail;
