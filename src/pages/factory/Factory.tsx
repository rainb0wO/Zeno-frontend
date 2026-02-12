import { useState, useEffect } from 'react';
import { useFactoryStore } from '../../stores/factoryStore';
import { Card, Button, Table, Space, Modal, Form, Input, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { factoryApi } from '../../services/factory';
import type { Factory as FactoryType, CreateFactoryParams } from '../../services/factory';

const { Option } = Select;

const Factory = () => {
  const { setFactories: setGlobalFactories } = useFactoryStore();
  const [factories, setFactories] = useState<FactoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentFactory, setCurrentFactory] = useState<FactoryType | null>(null);
  const [form] = Form.useForm();

  // 初始化数据
  useEffect(() => {
    fetchFactories();
  }, []);

  const fetchFactories = async () => {
    setLoading(true);
    try {
      const response = await factoryApi.getFactories();
      setFactories(response.factories);
      setGlobalFactories(response.factories);
    } catch (error) {
      console.error('获取厂区列表失败:', error);
      message.error('获取厂区列表失败');
    } finally {
      setLoading(false);
    }
  };

  const showAddModal = () => {
    setIsEdit(false);
    setCurrentFactory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const showEditModal = (factory: FactoryType) => {
    setIsEdit(true);
    setCurrentFactory(factory);
    form.setFieldsValue(factory);
    setModalVisible(true);
  };

  const handleModalCancel = () => {
    setModalVisible(false);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (isEdit && currentFactory) {
        // 更新厂区
        await factoryApi.updateFactory(currentFactory.id, values);
        message.success('厂区更新成功');
      } else {
        // 创建厂区
        await factoryApi.createFactory(values as CreateFactoryParams);
        message.success('厂区创建成功');
      }
      
      setModalVisible(false);
      fetchFactories(); // 重新加载数据
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    }
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个厂区吗？删除后不可恢复。',
      onOk: async () => {
        try {
          await factoryApi.deleteFactory(id);
          message.success('厂区删除成功');
          fetchFactories(); // 重新加载数据
        } catch (error) {
          console.error('删除失败:', error);
          message.error('删除失败');
        }
      }
    });
  };

  const columns = [
    { title: '厂区名称', dataIndex: 'name', key: 'name' },
    { title: '地址', dataIndex: 'address', key: 'address' },
    { title: '联系人', dataIndex: 'contactPerson', key: 'contactPerson' },
    { title: '联系电话', dataIndex: 'contactPhone', key: 'contactPhone' },
    { title: '管理模式', dataIndex: 'managementMode', key: 'managementMode' },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', render: (text: string) => new Date(text).toLocaleDateString('zh-CN') },
    { 
      title: '操作', 
      key: 'action', 
      render: (_: any, record: FactoryType) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => showEditModal(record)}>编辑</Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>厂区管理</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
          新建厂区
        </Button>
      </div>
      
      <Card title="厂区列表" variant="outlined">
        <Table 
          columns={columns} 
          dataSource={factories} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }} 
        />
      </Card>
      
      <Modal
        title={isEdit ? '编辑厂区' : '新建厂区'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="厂区名称"
            rules={[{ required: true, message: '请输入厂区名称!' }]}
          >
            <Input placeholder="请输入厂区名称" />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="地址"
            rules={[{ required: true, message: '请输入厂区地址!' }]}
          >
            <Input.TextArea placeholder="请输入厂区地址" rows={3} />
          </Form.Item>
          
          <Form.Item
            name="contactPerson"
            label="联系人"
            rules={[{ required: true, message: '请输入联系人!' }]}
          >
            <Input placeholder="请输入联系人姓名" />
          </Form.Item>
          
          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[{ required: true, message: '请输入联系电话!' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码!' }]}
          >
            <Input placeholder="请输入联系电话" />
          </Form.Item>
          
          <Form.Item
            name="managementMode"
            label="管理模式"
            rules={[{ required: true, message: '请选择管理模式!' }]}
          >
            <Select placeholder="请选择管理模式">
              <Option value="standard">标准模式</Option>
              <Option value="lean">精益模式</Option>
              <Option value="agile">敏捷模式</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Factory;
