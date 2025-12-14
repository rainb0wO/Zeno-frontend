import React, { useState, useEffect } from 'react';
import { Modal, Table, Button, Form, InputNumber, Input, message, Upload, Space, Select } from 'antd';
import { UploadOutlined, DownloadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { pieceWorkApi } from '../services/pieceWork';
import type { PieceWork, CreatePieceWorkParams } from '../services/pieceWork';
import type { Process } from '../services/process';
import dayjs from 'dayjs';

interface PieceWorkManagerProps {
  visible: boolean;
  planId: string;
  processes: Process[];
  onCancel: () => void;
}

const PieceWorkManager: React.FC<PieceWorkManagerProps> = ({
  visible,
  planId,
  processes,
  onCancel
}) => {
  const [records, setRecords] = useState<PieceWork[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible && planId) {
      loadRecords();
    }
  }, [visible, planId]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res: any = await pieceWorkApi.getPieceWorksByPlan(planId);
      console.log('加载计件记录响应:', res);
      setRecords(res.data?.data || res.data || []);
    } catch (error) {
      console.error('加载计件记录失败:', error);
      message.error('加载计件记录失败');
    } finally {
      setLoading(false);
    }
  };

  // 新增记录
  const handleAdd = async (values: CreatePieceWorkParams) => {
    try {
      await pieceWorkApi.createPieceWork({
        ...values,
        planId,
        completedAt: values.completedAt || new Date().toISOString()
      });
      message.success('计件记录添加成功');
      setShowAddModal(false);
      form.resetFields();
      loadRecords();
    } catch (error) {
      message.error('添加失败');
    }
  };

  // 删除记录
  const handleDelete = async (id: string) => {
    try {
      await pieceWorkApi.deletePieceWork(id);
      message.success('删除成功');
      loadRecords();
    } catch (error) {
      message.error('删除失败');
    }
  };

  // 导出模板
  const handleExportTemplate = async () => {
    try {
      const res: any = await pieceWorkApi.generatePieceWorkTemplate(planId);
      const template = res.data?.data || res.data;
      
      // 生成CSV内容
      const headers = template.fields.map((f: any) => f.label).join(',');
      const csvContent = `data:text/csv;charset=utf-8,${headers}\n`;
      
      const link = document.createElement('a');
      link.setAttribute('href', encodeURI(csvContent));
      link.setAttribute('download', `计件表模板_${planId}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.success('模板导出成功');
    } catch (error) {
      console.error('导出失败:', error);
      message.error('导出失败');
    }
  };

  // Excel导入（简化版）
  const handleImport = async (_file: File) => {
    message.info('Excel导入功能需要安装xlsx库，当前仅支持手动添加');
    return false;
  };

  const columns = [
    {
      title: '员工ID',
      dataIndex: 'employeeId',
      key: 'employeeId'
    },
    {
      title: '工序',
      dataIndex: 'processId',
      key: 'processId',
      render: (processId: string) => {
        const process = processes.find(p => p.id === processId);
        return process?.name || processId;
      }
    },
    {
      title: '计件数量',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PieceWork) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      )
    }
  ];

  return (
    <>
      <Modal
        title="计件表管理"
        open={visible}
        onCancel={onCancel}
        width={900}
        footer={null}
      >
        <Space style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowAddModal(true)}>
            新增记录
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportTemplate}>
            导出模板
          </Button>
          <Upload
            accept=".xlsx,.xls,.csv"
            showUploadList={false}
            beforeUpload={handleImport}
          >
            <Button icon={<UploadOutlined />}>导入Excel</Button>
          </Upload>
        </Space>

        <Table
          columns={columns}
          dataSource={records}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Modal>

      {/* 新增记录弹窗 */}
      <Modal
        title="新增计件记录"
        open={showAddModal}
        onCancel={() => {
          setShowAddModal(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
      >
        <Form form={form} onFinish={handleAdd} layout="vertical">
          <Form.Item
            label="员工ID"
            name="employeeId"
            rules={[{ required: true, message: '请输入员工ID' }]}
          >
            <Input placeholder="请输入员工ID" />
          </Form.Item>
          <Form.Item
            label="工序"
            name="processId"
            rules={[{ required: true, message: '请选择工序' }]}
          >
            <Select placeholder="请选择工序">
              {processes.map(p => (
                <Select.Option key={p.id} value={p.id}>{p.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="计件数量"
            name="quantity"
            rules={[{ required: true, message: '请输入数量' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="备注" name="remark">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default PieceWorkManager;
