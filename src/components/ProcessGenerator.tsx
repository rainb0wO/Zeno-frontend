import React, { useState, useEffect } from 'react';
import { Modal, Radio, Select, Form, Input, Button, List, message, Descriptions, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { processApi } from '../services/process';
import type { ProcessTemplate, TemplateOptions, ProcessStep } from '../services/process';

interface ProcessGeneratorProps {
  visible: boolean;
  onCancel: () => void;
  onGenerate: (processes: ProcessStep[]) => void;
}

const ProcessGenerator: React.FC<ProcessGeneratorProps> = ({
  visible,
  onCancel,
  onGenerate
}) => {
  const [mode, setMode] = useState<'template' | 'manual'>('template');
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [options, setOptions] = useState<TemplateOptions>({
    clothingTypes: [],
    craftTypes: [],
    materials: []
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [generatedProcesses, setGeneratedProcesses] = useState<ProcessStep[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<ProcessStep | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      loadData();
    }
  }, [visible]);

  const loadData = async () => {
    try {
      const [templatesRes, optionsRes]: any[] = await Promise.all([
        processApi.getTemplates(),
        processApi.getTemplateOptions()
      ]);
      console.log('模板数据:', templatesRes, optionsRes);
      setTemplates(templatesRes.data?.data?.templates || templatesRes.data?.templates || []);
      setOptions(optionsRes.data?.data || optionsRes.data || {
        clothingTypes: [],
        craftTypes: [],
        materials: []
      });
    } catch (error) {
      console.error('加载模板数据失败:', error);
      message.error('加载模板数据失败');
    }
  };

  // 模板选择
  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setGeneratedProcesses([...template.processes]);
    }
  };

  // 手动生成
  const handleManualGenerate = async () => {
    try {
      const values = await form.validateFields();
      
      // 处理 tags 模式返回的数组值，取第一个值
      const params = {
        clothingType: Array.isArray(values.clothingType) ? values.clothingType[0] : values.clothingType,
        craftType: Array.isArray(values.craftType) ? values.craftType[0] : values.craftType,
        material: Array.isArray(values.material) ? values.material[0] : values.material
      };
      
      // 显示加载状态
      message.loading({ content: '正在生成工序...', key: 'generating' });
      
      const res: any = await processApi.generateProcesses(params);
      console.log('生成工序响应:', res);
      const processData = res.data?.data || res.data;
      setGeneratedProcesses([...(processData.processes || [])]);
      
      message.destroy('generating');
      
      // 根据来源显示不同提示
      if (processData.source === 'PRESET') {
        message.success('工序生成成功（匹配预设模板）');
      } else if (processData.source === 'AI_GENERATED') {
        message.success({ 
          content: 'AI搜索成功！工序已生成并自动保存至模板库',
          duration: 3
        });
      } else if (!processData.matched) {
        message.warning('未找到精确匹配模板，AI已生成通用工序');
      } else {
        message.success('工序生成成功');
      }
    } catch (error: any) {
      message.destroy('generating');
      console.error('生成工序失败:', error);
      
      // 详细错误提示
      const errorMsg = error.response?.data?.message || error.message || '网络错误';
      
      if (errorMsg.includes('未启用')) {
        message.error('请先在系统设置中启用并配置 AI 服务');
      } else if (errorMsg.includes('认证') || errorMsg.includes('401')) {
        message.error('AI 密钥验证失败，请检查系统设置中的 API 密钥');
      } else if (errorMsg.includes('权限') || errorMsg.includes('403')) {
        message.error('模型权限不足，请在阿里云百炼平台开通 qwen-plus 模型');
      } else if (errorMsg.includes('网络')) {
        message.error('网络连接失败，请检查网络连接后重试');
      } else {
        message.error(`生成工序失败: ${errorMsg}`);
      }
    }
  };

  // 新增工序
  const handleAddProcess = () => {
    const newProcess: ProcessStep = {
      name: `工序${generatedProcesses.length + 1}`,
      equipment: '',
      standardTime: 0,
      qualityRequirement: '',
      description: ''
    };
    setGeneratedProcesses([...generatedProcesses, newProcess]);
  };

  // 开始编辑
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue({ ...generatedProcesses[index] });
  };

  // 保存编辑
  const saveEdit = (index: number) => {
    if (editValue && editValue.name.trim()) {
      const updated = [...generatedProcesses];
      updated[index] = { ...editValue };
      setGeneratedProcesses(updated);
    }
    setEditingIndex(null);
    setEditValue(null);
  };

  // 删除工序
  const handleDelete = (index: number) => {
    const updated = generatedProcesses.filter((_, i) => i !== index);
    setGeneratedProcesses(updated);
  };

  // 确认生成
  const handleConfirm = () => {
    if (generatedProcesses.length === 0) {
      message.warning('请先生成工序');
      return;
    }
    onGenerate(generatedProcesses);
    handleClose();
  };

  const handleClose = () => {
    setMode('template');
    setSelectedTemplate('');
    setGeneratedProcesses([]);
    setEditingIndex(null);
    setEditValue(null);
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="生成工序名"
      open={visible}
      onCancel={handleClose}
      onOk={handleConfirm}
      width={700}
      okText="确认生成"
      cancelText="取消"
    >
      <div style={{ marginBottom: 24 }}>
        <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
          <Radio value="template">模板选择</Radio>
          <Radio value="manual">手动输入</Radio>
        </Radio.Group>
      </div>

      {mode === 'template' ? (
        <div>
          <Select
            placeholder="请选择工序模板"
            style={{ width: '100%', marginBottom: 16 }}
            value={selectedTemplate}
            onChange={handleTemplateSelect}
            options={templates.map(t => ({
              label: t.name,
              value: t.id
            }))}
          />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            label="服装类型"
            name="clothingType"
            rules={[{ required: true, message: '请输入或选择服装类型' }]}
          >
            <Select
              showSearch
              allowClear
              mode="tags"
              maxCount={1}
              placeholder="请输入或选择服装类型"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options.clothingTypes.map(t => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Form.Item
            label="工艺"
            name="craftType"
            rules={[{ required: true, message: '请输入或选择工艺' }]}
          >
            <Select
              showSearch
              allowClear
              mode="tags"
              maxCount={1}
              placeholder="请输入或选择工艺"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options.craftTypes.map(t => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Form.Item
            label="材质"
            name="material"
            rules={[{ required: true, message: '请输入或选择材质' }]}
          >
            <Select
              showSearch
              allowClear
              mode="tags"
              maxCount={1}
              placeholder="请输入或选择材质（如：棉、涤纶、丝绸）"
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={options.materials.map(t => ({ label: t, value: t }))}
            />
          </Form.Item>
          <Button type="primary" onClick={handleManualGenerate}>
            生成工序
          </Button>
        </Form>
      )}

      {generatedProcesses.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 600 }}>生成的工序列表（共{generatedProcesses.length}道工序）</span>
            <Button type="link" icon={<PlusOutlined />} onClick={handleAddProcess}>
              新增工序
            </Button>
          </div>
          <List
            size="small"
            bordered
            dataSource={generatedProcesses}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  editingIndex === index ? (
                    <Button type="link" size="small" onClick={() => saveEdit(index)}>
                      保存
                    </Button>
                  ) : (
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => startEdit(index)}
                    >
                      编辑
                    </Button>
                  ),
                  <Button
                    type="link"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(index)}
                  >
                    删除
                  </Button>
                ]}
              >
                {editingIndex === index ? (
                  <div style={{ width: '100%' }}>
                    <Input
                      placeholder="工序名称"
                      value={editValue?.name || ''}
                      onChange={(e) => setEditValue({ ...editValue!, name: e.target.value })}
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      placeholder="所需设备（可选）"
                      value={editValue?.equipment || ''}
                      onChange={(e) => setEditValue({ ...editValue!, equipment: e.target.value })}
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      type="number"
                      placeholder="标准工时/分钟（可选）"
                      value={editValue?.standardTime || ''}
                      onChange={(e) => setEditValue({ ...editValue!, standardTime: Number(e.target.value) })}
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      placeholder="质量要求（可选）"
                      value={editValue?.qualityRequirement || ''}
                      onChange={(e) => setEditValue({ ...editValue!, qualityRequirement: e.target.value })}
                      style={{ marginBottom: 8 }}
                    />
                    <Input
                      placeholder="工序描述（可选）"
                      value={editValue?.description || ''}
                      onChange={(e) => setEditValue({ ...editValue!, description: e.target.value })}
                    />
                  </div>
                ) : (
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                      {index + 1}. {item.name}
                    </div>
                    {(item.equipment || item.standardTime || item.qualityRequirement || item.description) && (
                      <Descriptions size="small" column={1} style={{ fontSize: 12 }}>
                        {item.equipment && (
                          <Descriptions.Item label="设备">
                            <Tag color="blue">{item.equipment}</Tag>
                          </Descriptions.Item>
                        )}
                        {item.standardTime && (
                          <Descriptions.Item label="工时">
                            <Tag color="green">{item.standardTime}分钟</Tag>
                          </Descriptions.Item>
                        )}
                        {item.qualityRequirement && (
                          <Descriptions.Item label="质量要求">
                            {item.qualityRequirement}
                          </Descriptions.Item>
                        )}
                        {item.description && (
                          <Descriptions.Item label="描述">
                            {item.description}
                          </Descriptions.Item>
                        )}
                      </Descriptions>
                    )}
                  </div>
                )}
              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default ProcessGenerator;
