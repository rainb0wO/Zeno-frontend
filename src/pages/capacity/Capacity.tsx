import { useState, useEffect } from 'react';
import { Card, Button, Space, Modal, Form, Input, Select, DatePicker, message, Row, Col, Statistic, Progress, Tag } from 'antd';
import { PlusOutlined, BarChartOutlined, ToolOutlined, FileTextOutlined, CalendarOutlined } from '@ant-design/icons';
import BizAction from '../../components/BizAction';
import { useReadonly } from '../../contexts/ReadonlyContext';
import { capacityApi } from '../../services/capacity';
import type { ProductionPlan, CreateProductionPlanParams, CapacityStatistics } from '../../services/capacity';
import { useFactoryStore } from '../../stores/factoryStore';
import { processApi } from '../../services/process';
import type { Process } from '../../services/process';
import ProcessGenerator from '../../components/ProcessGenerator';
import PieceWorkManager from '../../components/PieceWorkManager';
import SmartScheduleGenerator from '../../components/SmartScheduleGenerator';
import ResponsiveDataList from '../../components/ResponsiveDataList';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const Capacity = () => {
  const { isReadonly, showTip } = useReadonly();
  const navigate = useNavigate();
  const { currentFactory } = useFactoryStore();
  const [productionPlans, setProductionPlans] = useState<ProductionPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<ProductionPlan | null>(null);
  const [statistics, setStatistics] = useState<CapacityStatistics | null>(null);
  const [form] = Form.useForm();

  // 新增：工序、计件、排班弹窗状态
  const [showProcessGenerator, setShowProcessGenerator] = useState(false);
  const [showPieceWorkManager, setShowPieceWorkManager] = useState(false);
  const [showScheduleGenerator, setShowScheduleGenerator] = useState(false);
  const [selectedPlanForProcess, setSelectedPlanForProcess] = useState<ProductionPlan | null>(null);
  const [processes, setProcesses] = useState<Process[]>([]);

  useEffect(() => {
    if (currentFactory) {
      console.log('[Capacity] 页面加载/工厂切换，刷新数据:', currentFactory.id);
      fetchProductionPlans();
      fetchStatistics();
    }
  }, [currentFactory]);

  // 监听页面可见性，页面重新可见时刷新数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentFactory) {
        console.log('[Capacity] 页面重新可见，刷新数据');
        fetchProductionPlans();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentFactory]);

  const fetchProductionPlans = async () => {
    if (!currentFactory) return;
    setLoading(true);
    try {
      console.log('[Capacity] 开始获取生产计划:', currentFactory.id);
      const response = await capacityApi.getProductionPlans({ factoryId: currentFactory.id });
      console.log('[Capacity] 获取生产计划响应:', response);
      // response 直接是 data 对象，不需要 .data
      setProductionPlans(response?.productionPlans || []);
    } catch (error) {
      console.error('[Capacity] 获取生产计划失败:', error);
      message.error('获取生产计划失败');
      setProductionPlans([]); // 错误时清空
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!currentFactory) return;
    try {
      const response = await capacityApi.getCapacityStatistics({ factoryId: currentFactory.id });
      // response 直接是 data 对象
      setStatistics(response?.statistics || null);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setStatistics(null);
    }
  };

  const showAddModal = () => {
    if (isReadonly) {
      showTip();
      return;
    }
    setIsEdit(false);
    setCurrentPlan(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (plan: ProductionPlan) => {
    setIsEdit(true);
    setCurrentPlan(plan);
    form.setFieldsValue({
      ...plan,
      dateRange: [dayjs(plan.startDate), dayjs(plan.endDate)]
    });
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalOk = async () => {
    if (!currentFactory) return;
    try {
      const values = await form.validateFields();
      const [startDate, endDate] = values.dateRange;
      
      const params = {
        productName: values.productName,
        targetQty: Number(values.targetQty),
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        factoryId: currentFactory.id,
        status: values.status || 'PENDING'
      };

      if (isEdit && currentPlan) {
        const res = await capacityApi.updateProductionPlan(currentPlan.id, params);
        console.log('[Capacity] 生产计划更新成功:', res);
        message.success('生产计划更新成功');
      } else {
        const res = await capacityApi.createProductionPlan(params as CreateProductionPlanParams);
        console.log('[Capacity] 生产计划创建成功:', res?.productionPlan);
        message.success('生产计划创建成功');
      }
      
      setModalVisible(false);
      form.resetFields();
      
      // 等待短暂延迟后刷新，确保数据库写入完成
      setTimeout(() => {
        fetchProductionPlans();
        fetchStatistics();
      }, 200);
    } catch (error: any) {
      console.error('操作失败:', error);
      // 添加更详细的错误处理
      if (error.response?.status === 403) {
        message.error('权限不足：您没有创建或修改生产计划的权限');
      } else if (error.response?.status === 401) {
        message.error('登录已过期，请重新登录');
      } else {
        message.error(error.response?.data?.message || '操作失败');
      }
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个生产计划吗？',
      onOk: async () => {
        try {
          await capacityApi.deleteProductionPlan(id);
          message.success('删除成功');
          fetchProductionPlans();
          fetchStatistics();
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'default', text: '待开始' },
      IN_PROGRESS: { color: 'processing', text: '进行中' },
      COMPLETED: { color: 'success', text: '已完成' },
      DELAYED: { color: 'error', text: '延期' },
    };
    const status_config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={status_config.color}>{status_config.text}</Tag>;
  };

  const columns = [
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '目标产量', dataIndex: 'targetQty', key: 'targetQty' },
    { 
      title: '实际产量', 
      dataIndex: 'actualQty', 
      key: 'actualQty',
      render: (qty: number) => qty || 0
    },
    { 
      title: '完成进度', 
      dataIndex: 'progress', 
      key: 'progress', 
      render: (progress: number) => (
        <Progress 
          percent={progress || 0} 
          size="small" 
          status={progress >= 100 ? 'success' : progress >= 80 ? 'active' : 'normal'}
        />
      )
    },
    {
      title: '优先级',
      dataIndex: 'priorityLevel',
      key: 'priorityLevel',
      render: (level: string, record: any) => {
        if (!level) return <Tag color="default">未计算</Tag>;
        const priorityMap: Record<string, { color: string; text: string }> = {
          HIGH: { color: 'red', text: '高优先级' },
          MEDIUM: { color: 'orange', text: '中优先级' },
          LOW: { color: 'green', text: '低优先级' },
        };
        const config = priorityMap[level] || { color: 'default', text: level };
        return (
          <div>
            <Tag color={config.color}>{config.text}</Tag>
            {record.isManualPriority && <Tag color="blue">手动</Tag>}
          </div>
        );
      },
    },
    {
      title: '优先级分数',
      dataIndex: 'priorityScore',
      key: 'priorityScore',
      render: (score: number) => score ? `${score}分` : '-',
    },
    { title: '开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束日期', dataIndex: 'endDate', key: 'endDate' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, record: ProductionPlan) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              showEditModal(record);
            }}
          >
            编辑
          </Button>
          <Button 
            type="link" 
            danger 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
          >
            删除
          </Button>
          <Button 
            type="link" 
            icon={<ToolOutlined />} 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlanForProcess(record);
              setShowProcessGenerator(true);
            }}
          >
            工序
          </Button>
          <Button 
            type="link" 
            icon={<FileTextOutlined />} 
            size="small" 
            onClick={async (e) => {
              e.stopPropagation();
              // 加载工序
              try {
                const res: any = await processApi.getProcessesByPlan(record.id);
                console.log('获取工序响应:', res);
                setProcesses(res.data.data || res.data || []);
                setSelectedPlanForProcess(record);
                setShowPieceWorkManager(true);
              } catch (error) {
                console.error('加载工序失败:', error);
                message.error('加载工序失败');
              }
            }}
          >
            计件
          </Button>
          <Button 
            type="link" 
            icon={<CalendarOutlined />} 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPlanForProcess(record);
              setShowScheduleGenerator(true);
            }}
          >
            排班
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>产能管理</h1>
        <BizAction type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          新建生产计划
        </BizAction>
      </div>
      
      {/* 统计卡片 */}
      {statistics && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总计划数"
                value={statistics.totalPlans}
                prefix={<BarChartOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="进行中"
                value={statistics.inProgressPlans}
                styles={{ content: { color: '#1890ff' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="已完成"
                value={statistics.completedPlans}
                styles={{ content: { color: '#52c41a' } }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="产能利用率"
                value={statistics.capacityUtilization}
                precision={2}
                suffix="%"
                styles={{ content: { color: statistics.capacityUtilization >= 80 ? '#52c41a' : '#faad14' } }}
              />
            </Card>
          </Col>
        </Row>
      )}
      
      <Card title="生产计划列表" variant="outlined">
        <ResponsiveDataList
          columns={columns}
          dataSource={productionPlans}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          onRowClick={(record) => {
            // 只有移动端（或只读模式）才跳详情页
            if (isReadonly) {
              navigate(`/capacity/${record.id}`);
            }
          }}
          mobileRenderItem={(record) => (
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 600 }}>{record.productName}</div>
                {getStatusTag(record.status)}
              </Space>
              <Progress percent={record.progress || 0} size="small" />
              <div style={{ fontSize: 12, color: '#666' }}>
                目标/实际：{record.targetQty} / {record.actualQty || 0}
              </div>
              <div style={{ fontSize: 12, color: '#666' }}>
                时间：{record.startDate} ~ {record.endDate}
              </div>
            </Space>
          )}
        />
      </Card>
      
      <Modal
        title={isEdit ? '编辑生产计划' : '新建生产计划'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="productName"
            label="产品名称"
            rules={[{ required: true, message: '请输入产品名称!' }]}
          >
            <Input placeholder="请输入产品名称" />
          </Form.Item>
          
          <Form.Item
            name="targetQty"
            label="目标产量"
            rules={[{ required: true, message: '请输入目标产量!' }]}
          >
            <Input type="number" placeholder="请输入目标产量" />
          </Form.Item>
          
          <Form.Item
            name="dateRange"
            label="生产时间"
            rules={[{ required: true, message: '请选择生产时间!' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          
          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态!' }]}
          >
            <Select placeholder="请选择状态">
              <Option value="PENDING">待开始</Option>
              <Option value="IN_PROGRESS">进行中</Option>
              <Option value="COMPLETED">已完成</Option>
              <Option value="DELAYED">延期</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 工序生成器 */}
      <ProcessGenerator
        visible={showProcessGenerator}
        onCancel={() => {
          setShowProcessGenerator(false);
          setSelectedPlanForProcess(null);
        }}
        onGenerate={async (processes) => {
          if (selectedPlanForProcess) {
            try {
              await processApi.createProcesses({
                planId: selectedPlanForProcess.id,
                processes
              });
              message.success('工序创建成功');
            } catch (error) {
              message.error('工序创建失败');
            }
          }
        }}
      />

      {/* 计件表管理 */}
      {selectedPlanForProcess && (
        <PieceWorkManager
          visible={showPieceWorkManager}
          planId={selectedPlanForProcess.id}
          processes={processes}
          onCancel={() => {
            setShowPieceWorkManager(false);
            setSelectedPlanForProcess(null);
            setProcesses([]);
          }}
        />
      )}

      {/* 智能排班生成器 */}
      {selectedPlanForProcess && currentFactory && (
        <SmartScheduleGenerator
          visible={showScheduleGenerator}
          planId={selectedPlanForProcess.id}
          factoryId={currentFactory.id}
          onCancel={() => {
            setShowScheduleGenerator(false);
            setSelectedPlanForProcess(null);
          }}
          onGenerated={() => {
            message.success('排班生成成功');
            setShowScheduleGenerator(false);
            setSelectedPlanForProcess(null);
          }}
        />
      )}
    </div>
  );
};

export default Capacity;
