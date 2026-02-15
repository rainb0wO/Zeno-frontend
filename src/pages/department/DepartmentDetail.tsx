import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Descriptions, Space, Spin, Tag, message, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentApi } from '../../services/department';
import type { Department } from '../../services/department';
import { useReadonly } from '../../contexts/ReadonlyContext';
import { useDepartmentStore } from '../../stores/departmentStore';
import { useFactoryStore } from '../../stores/factoryStore';
import personnelApi from '../../services/personnel';

const { Text } = Typography;

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isReadonly } = useReadonly();
  const { departments } = useDepartmentStore();
  const { currentFactory } = useFactoryStore();

  const [loading, setLoading] = useState(false);
  const [dept, setDept] = useState<Department | null>(null);
  const [leaderName, setLeaderName] = useState<string>('');

  // 扁平化部门树用于查询
  const deptMap = useMemo(() => {
    const map = new Map<string, Department>();
    const flatten = (list: Department[]) => {
      list.forEach((item) => {
        map.set(item.id, item);
        if (item.children) flatten(item.children);
      });
    };
    flatten(departments);
    return map;
  }, [departments]);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await departmentApi.getDepartmentById(id);
        setDept(res.department);
        
        // 如果有负责人ID，获取负责人姓名
        if (res.department.leaderId) {
          try {
            const employeesRes = await personnelApi.getEmployees();
            const leader = (employeesRes.employees || []).find((e: any) => e.id === res.department.leaderId);
            if (leader) setLeaderName(leader.name);
          } catch (e) {
            console.error('获取负责人信息失败', e);
          }
        }
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

  // 计算路径 (岗位/组/部门)
  const deptPath = useMemo(() => {
    if (!dept || !id) return '-';
    const path: string[] = [];
    let current = deptMap.get(id);
    while (current) {
      path.unshift(current.name);
      current = current.parentId ? deptMap.get(current.parentId) : undefined;
    }
    return path.join(' / ');
  }, [dept, id, deptMap]);

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
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center' }}>
            <Spin />
          </div>
        ) : !dept ? (
          <div>未找到该部门</div>
        ) : (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="部门名称">{dept.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="所属厂区">{currentFactory?.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="部门路径">
              <Text type="secondary" style={{ fontSize: 12 }}>{deptPath}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="上级部门">
              {dept.parentId ? deptMap.get(dept.parentId)?.name || '未知部门' : '无'}
            </Descriptions.Item>
            <Descriptions.Item label="负责人">{leaderName || (dept.leaderId ? '加载中...' : '-')}</Descriptions.Item>
            <Descriptions.Item label="员工数量">
              <Text strong>{dept.employeeCount ?? 0}</Text> 人
            </Descriptions.Item>
            <Descriptions.Item label="下级部门数">
              {dept.children?.length ?? 0} 个
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">{dept.createdAt ? new Date(dept.createdAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
            <Descriptions.Item label="更新时间">{dept.updatedAt ? new Date(dept.updatedAt).toLocaleString('zh-CN') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default DepartmentDetail;

