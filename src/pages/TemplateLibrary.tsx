import { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Tag, message, Descriptions } from 'antd';
import { AppstoreOutlined, EyeOutlined } from '@ant-design/icons';
import { processApi } from '../services/process';
import type { ProcessTemplate } from '../services/process';

const TemplateLibrary = () => {
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [viewingTemplate, setViewingTemplate] = useState<ProcessTemplate | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res: any = await processApi.getTemplates();
      console.log('模板列表响应:', res);
      const data = res.data?.data || res.data;
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('加载模板失败:', error);
      message.error('加载模板失败');
    } finally {
      setLoading(false);
    }
  };

  const showViewModal = (template: ProcessTemplate) => {
    setViewingTemplate(template);
    setViewModalVisible(true);
  };

  const columns = [
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
      width: 250
    },
    {
      title: '服装类型',
      dataIndex: 'clothingType',
      key: 'clothingType'
    },
    {
      title: '工艺',
      dataIndex: 'craftType',
      key: 'craftType'
    },
    {
      title: '材质',
      dataIndex: 'material',
      key: 'material'
    },
    {
      title: '工序数量',
      key: 'processCount',
      render: (_: any, record: ProcessTemplate) => (
        <span>{record.processes.length} 个</span>
      )
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      render: (source: string) => {
        const colorMap: Record<string, string> = {
          PRESET: 'blue',
          AI_GENERATED: 'green',
          MANUAL: 'orange'
        };
        const textMap: Record<string, string> = {
          PRESET: '预设',
          AI_GENERATED: 'AI生成',
          MANUAL: '手动'
        };
        return <Tag color={colorMap[source] || 'default'}>{textMap[source] || source}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: ProcessTemplate) => (
        <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => showViewModal(record)}>
          查看
        </Button>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1><AppstoreOutlined /> 模板库管理</h1>
      </div>

      <Card>
        <Table 
          columns={columns} 
          dataSource={templates} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 查看模板详情 */}
      <Modal
        title="模板详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {viewingTemplate && (
          <div>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="模板名称" span={2}>
                {viewingTemplate.name}
              </Descriptions.Item>
              <Descriptions.Item label="服装类型">
                {viewingTemplate.clothingType}
              </Descriptions.Item>
              <Descriptions.Item label="工艺">
                {viewingTemplate.craftType}
              </Descriptions.Item>
              <Descriptions.Item label="材质">
                {viewingTemplate.material}
              </Descriptions.Item>
              <Descriptions.Item label="来源">
                <Tag color={
                  viewingTemplate.source === 'PRESET' ? 'blue' : 
                  viewingTemplate.source === 'AI_GENERATED' ? 'green' : 'orange'
                }>
                  {viewingTemplate.source === 'PRESET' ? '预设' : 
                   viewingTemplate.source === 'AI_GENERATED' ? 'AI生成' : '手动'}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginBottom: 12 }}>工序列表（共{viewingTemplate.processes.length}道工序）</h3>
            {viewingTemplate.processes.map((process, index) => (
              <Card key={index} size="small" style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  {index + 1}. {process.name}
                </div>
                {(process.equipment || process.standardTime || process.qualityRequirement || process.description) && (
                  <Descriptions size="small" column={1}>
                    {process.equipment && (
                      <Descriptions.Item label="设备">
                        <Tag color="blue">{process.equipment}</Tag>
                      </Descriptions.Item>
                    )}
                    {process.standardTime && (
                      <Descriptions.Item label="工时">
                        <Tag color="green">{process.standardTime}分钟</Tag>
                      </Descriptions.Item>
                    )}
                    {process.qualityRequirement && (
                      <Descriptions.Item label="质量要求">
                        {process.qualityRequirement}
                      </Descriptions.Item>
                    )}
                    {process.description && (
                      <Descriptions.Item label="描述">
                        {process.description}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                )}
              </Card>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplateLibrary;
