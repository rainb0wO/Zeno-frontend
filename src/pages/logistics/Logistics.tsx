import { Card, Button, Table, Space, Select, Typography, Row, Col, Statistic, Input, Tag, message } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  InboxOutlined,
  SearchOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logisticsApi from '../../services/logistics';
import BizAction from '../../components/BizAction';
import ResponsiveDataList from '../../components/ResponsiveDataList';
import { useReadonly } from '../../contexts/ReadonlyContext';
import './Logistics.css';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const Logistics = () => {
  const { isReadonly } = useReadonly();
  const navigate = useNavigate();
  // State for logistics records
  const [logisticsRecords, setLogisticsRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // State for filters
  const [selectedType, setSelectedType] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  // State for statistics
  const [totalRecords, setTotalRecords] = useState(0);
  const [deliveredRecords, setDeliveredRecords] = useState(0);
  const [inTransitRecords, setInTransitRecords] = useState(0);
  const [pendingRecords, setPendingRecords] = useState(0);
  const [inboundRecords, setInboundRecords] = useState(0);
  const [outboundRecords, setOutboundRecords] = useState(0);

  // Fetch logistics records from API
  const fetchLogisticsRecords = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (selectedType !== 'all') {
        params.type = selectedType;
      }
      
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      
      if (searchKeyword) {
        params.productName = searchKeyword;
      }
      
      const response = await logisticsApi.getLogisticsRecords(params);
      setLogisticsRecords(response?.logisticsRecords || []);
    } catch (error) {
      message.error('获取物流记录失败');
      console.error('Error fetching logistics records:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch logistics statistics
  const fetchLogisticsStats = async () => {
    try {
      const response = await logisticsApi.getLogisticsStats();
      
      setTotalRecords(response?.totalRecords || 0);
      setDeliveredRecords(response?.deliveredRecords || 0);
      setInTransitRecords(response?.inTransitRecords || 0);
      setPendingRecords(response?.pendingRecords || 0);
      setInboundRecords(response?.inboundRecords || 0);
      setOutboundRecords(response?.outboundRecords || 0);
    } catch (error) {
      message.error('获取物流统计数据失败');
      console.error('Error fetching logistics stats:', error);
    }
  };

  // Filter data based on selected filters
  const filteredRecords = logisticsRecords;

  // Delete logistics record
  const handleDelete = async (id: string) => {
    try {
      await logisticsApi.deleteLogisticsRecord(id);
      message.success('物流记录删除成功');
      fetchLogisticsRecords();
      fetchLogisticsStats();
    } catch (error) {
      message.error('删除物流记录失败');
      console.error('Error deleting logistics record:', error);
    }
  };

  // Initial fetch and refresh on filter changes
  useEffect(() => {
    fetchLogisticsRecords();
    fetchLogisticsStats();
  }, [selectedType, selectedStatus, searchKeyword]);

  const getStatusTag = (status: string) => {
    let statusConfig: any = {
      text: status,
      color: '#d9d9d9',
      icon: <ExclamationCircleOutlined />
    };
    
    switch(status) {
      case 'PENDING': 
        statusConfig = {
          text: '待处理',
          color: 'warning',
          icon: <ExclamationCircleOutlined />
        };
        break;
      case 'IN_TRANSIT': 
        statusConfig = {
          text: '运输中',
          color: 'processing',
          icon: <ClockCircleOutlined />
        };
        break;
      case 'DELIVERED': 
        statusConfig = {
          text: '已完成',
          color: 'success',
          icon: <CheckCircleOutlined />
        };
        break;
      case 'CANCELLED': 
        statusConfig = {
          text: '已取消',
          color: 'default',
          icon: <ExclamationCircleOutlined />
        };
        break;
    }
    
    return (
      <Tag color={statusConfig.color} icon={statusConfig.icon}>
        {statusConfig.text}
      </Tag>
    );
  };

  const columns = [
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type', 
      width: 100,
      render: (type: string) => {
        const isInbound = type === 'INBOUND';
        return (
          <Tag 
            color={isInbound ? 'success' : 'error'} 
            icon={<InboxOutlined />}
          >
            {isInbound ? '入库' : '出库'}
          </Tag>
        );
      }
    },
    { 
      title: '产品名称', 
      dataIndex: 'productName', 
      key: 'productName',
      width: 160,
      render: (name: string) => (
        <div className="product-name">
          <strong>{name}</strong>
        </div>
      )
    },
    { 
      title: '数量', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      width: 100,
      render: (qty: number) => (
        <span className="quantity">{qty} 件</span>
      )
    },
    { 
      title: '目的地', 
      dataIndex: 'destination', 
      key: 'destination',
      width: 200,
      ellipsis: true
    },
    { 
      title: '创建时间', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      width: 160,
      render: (date: string) => {
        const formattedDate = new Date(date).toLocaleString('zh-CN');
        return <span>{formattedDate}</span>;
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 110,
      render: (status: string) => getStatusTag(status)
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 140,
      render: (_: any, record: any) => (
        <Space size="middle">
          <BizAction 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            className="edit-btn"
            onClick={(e) => {
              e?.stopPropagation();
              // 原有编辑逻辑
            }}
          >
            编辑
          </BizAction>
          <BizAction 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            className="delete-btn"
            onClick={(e) => {
              e?.stopPropagation();
              handleDelete(record.id);
            }}
          >
            删除
          </BizAction>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container logistics-container">
      {/* Header */}
      <div className="logistics-header">
        <div className="logistics-title-section">
          <Title level={2} className="logistics-title">
            物流管理平台
          </Title>
          <Paragraph className="logistics-subtitle">
            实时监控物流状态，优化供应链管理
          </Paragraph>
        </div>
      </div>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="logistics-stats">
        {/* Total Records */}
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card total-card" size="small">
            <Statistic
              title="总记录数"
              value={totalRecords}
              prefix={<BarChartOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: '20px' }}
            />
          </Card>
        </Col>
        
        {/* Delivered */}
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card delivered-card" size="small">
            <Statistic
              title="已完成"
              value={deliveredRecords}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '20px' }}
              suffix={totalRecords > 0 ? `(${Math.round((deliveredRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
        
        {/* In Transit */}
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card transit-card" size="small">
            <Statistic
              title="运输中"
              value={inTransitRecords}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: '20px' }}
              suffix={totalRecords > 0 ? `(${Math.round((inTransitRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
        
        {/* Pending */}
        <Col xs={12} sm={12} md={6}>
          <Card className="stat-card pending-card" size="small">
            <Statistic
              title="待处理"
              value={pendingRecords}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff7875', fontSize: '20px' }}
              suffix={totalRecords > 0 ? `(${Math.round((pendingRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Filters */}
      <Card className="filters-card" variant="outlined" style={{ marginBottom: 16 }}>
        <div className="filters-content">
          <div className="filter-group" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <Input
              placeholder="产品名称/目的地"
              prefix={<SearchOutlined />}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              style={{ width: 200 }}
            />
            <Select 
              placeholder="选择类型" 
              style={{ width: 110 }}
              value={selectedType}
              onChange={setSelectedType}
            >
              <Option value="all">全部类型</Option>
              <Option value="inbound">入库</Option>
              <Option value="outbound">出库</Option>
            </Select>
            <Select 
              placeholder="选择状态" 
              style={{ width: 110 }}
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              <Option value="all">全部状态</Option>
              <Option value="pending">待处理</Option>
              <Option value="in_transit">运输中</Option>
              <Option value="delivered">已完成</Option>
            </Select>
            <BizAction 
              type="primary" 
              icon={<PlusOutlined />}
              className="add-btn"
            >
              新建记录
            </BizAction>
          </div>
        </div>
      </Card>
      
      {/* Logistics Records Table */}
      <Card title="物流记录列表" variant="outlined">
        <ResponsiveDataList
          columns={columns}
          dataSource={filteredRecords}
          rowKey="id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`
          }}
          onRowClick={(record) => {
            if (isReadonly) {
              navigate(`/logistics/${record.id}`);
            }
          }}
          mobileRenderItem={(record) => (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space>
                  <Tag color={record.type === 'INBOUND' ? 'success' : 'error'} size="small">
                    {record.type === 'INBOUND' ? '入库' : '出库'}
                  </Tag>
                  <strong style={{ fontSize: 15 }}>{record.productName}</strong>
                </Space>
                {getStatusTag(record.status)}
              </Space>
              <div style={{ fontSize: 13, color: '#666' }}>
                数量：<span style={{ color: '#1890ff', fontWeight: 600 }}>{record.quantity}</span> 件
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>
                目的地：{record.destination || '-'}
              </div>
              <div style={{ fontSize: 12, color: '#999' }}>
                创建时间：{new Date(record.createdAt).toLocaleString('zh-CN')}
              </div>
            </Space>
          )}
        />
      </Card>
    </div>
  );
};

export default Logistics;

