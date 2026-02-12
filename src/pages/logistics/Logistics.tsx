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
import './Logistics.css';

const { Option } = Select;
const { Title, Paragraph } = Typography;

const Logistics = () => {
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

  const columns = [
    { 
      title: '类型', 
      dataIndex: 'type', 
      key: 'type', 
      width: 120,
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
      width: 120,
      render: (qty: number) => (
        <span className="quantity">{qty} 件</span>
      )
    },
    { 
      title: '目的地', 
      dataIndex: 'destination', 
      key: 'destination',
      width: 200,
      ellipsis: true,
      tooltip: (record: any) => record.destination
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
      width: 120,
      render: (status: string) => {
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
      }
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 140,
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small"
            className="edit-btn"
          >
            编辑
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            className="delete-btn"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
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
      <Row gutter={[24, 24]} className="logistics-stats">
        {/* Total Records */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card total-card">
            <Statistic
              title="总记录数"
              value={totalRecords}
              prefix={<BarChartOutlined />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        
        {/* Delivered */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card delivered-card">
            <Statistic
              title="已完成"
              value={deliveredRecords}
              prefix={<CheckCircleOutlined />}
              styles={{ content: { color: '#52c41a' } }}
              suffix={totalRecords > 0 ? `(${Math.round((deliveredRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
        
        {/* In Transit */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card transit-card">
            <Statistic
              title="运输中"
              value={inTransitRecords}
              prefix={<ClockCircleOutlined />}
              styles={{ content: { color: '#faad14' } }}
              suffix={totalRecords > 0 ? `(${Math.round((inTransitRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
        
        {/* Pending */}
        <Col xs={24} sm={12} md={6}>
          <Card className="stat-card pending-card">
            <Statistic
              title="待处理"
              value={pendingRecords}
              prefix={<ExclamationCircleOutlined />}
              styles={{ content: { color: '#ff7875' } }}
              suffix={totalRecords > 0 ? `(${Math.round((pendingRecords / totalRecords) * 100)}%)` : '(0%)'}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Type Distribution */}
      <Card className="distribution-card">
        <div className="distribution-content">
          <h3 className="distribution-title">物流类型分布</h3>
          <div className="distribution-stats">
            <div className="distribution-item inbound">
              <div className="distribution-icon">
                <InboxOutlined />
              </div>
              <div className="distribution-info">
                <div className="distribution-value">{inboundRecords}</div>
                <div className="distribution-label">入库记录</div>
              </div>
            </div>
            <div className="distribution-item outbound">
              <div className="distribution-icon">
                <InboxOutlined />
              </div>
              <div className="distribution-info">
                <div className="distribution-value">{outboundRecords}</div>
                <div className="distribution-label">出库记录</div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Filters */}
      <Card className="filters-card" variant="outlined">
        <div className="filters-content">
          <div className="filter-group">
            <div className="filter-item">
              <Input
                placeholder="搜索产品/来源/目的地"
                prefix={<SearchOutlined />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ width: 240 }}
              />
            </div>
            
            <div className="filter-item">
              <Select 
                placeholder="选择类型" 
                style={{ width: 120 }}
                value={selectedType}
                onChange={setSelectedType}
              >
                <Option value="all">全部类型</Option>
                <Option value="inbound">入库</Option>
                <Option value="outbound">出库</Option>
              </Select>
            </div>
            
            <div className="filter-item">
              <Select 
                placeholder="选择状态" 
                style={{ width: 120 }}
                value={selectedStatus}
                onChange={setSelectedStatus}
              >
                <Option value="all">全部状态</Option>
                <Option value="pending">待处理</Option>
                <Option value="in_transit">运输中</Option>
                <Option value="delivered">已完成</Option>
              </Select>
            </div>
            
            <div className="filter-item">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                className="add-btn"
              >
                新建入库/出库记录
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Logistics Records Table */}
      <Card className="records-card" variant="outlined">
        <div className="table-header">
          <h3>物流记录列表</h3>
          <span className="record-count">共 {filteredRecords.length} 条记录</span>
        </div>
        <Table 
          columns={columns} 
          dataSource={filteredRecords} 
          rowKey="id" 
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100']
          }} 
          className="logistics-table"
          scroll={{ x: 1000 }}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default Logistics;
