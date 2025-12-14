import { useState, useEffect } from 'react';
import { Card, Form, Select, Radio, Switch, Button, message, Modal, Upload, Space, Input, Alert } from 'antd';
import { SettingOutlined, BarChartOutlined, FileTextOutlined, UndoOutlined, DownloadOutlined, UploadOutlined, RobotOutlined, ApiOutlined } from '@ant-design/icons';
import { settingsApi, type SystemPreferences } from '../services/settings';
import { aiApi, type AIConfig, type AIProvider } from '../services/ai';

const SystemSettings = () => {
  const [form] = Form.useForm();
  const [aiForm] = Form.useForm();
  const [preferences, setPreferences] = useState<SystemPreferences | null>(null);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    loadSettings();
    loadAIConfig();
    loadAIProviders();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsApi.getUserSettings();
      console.log('获取系统设置响应:', res);
      // response 直接是 data 对象
      if (res?.settings?.systemPreferences) {
        const prefs = res.settings.systemPreferences;
        setPreferences(prefs);
        form.setFieldsValue(prefs);
      } else {
        console.warn('系统设置为空，使用默认值');
        const defaultPrefs: SystemPreferences = {
          defaultPage: 'dashboard',
          tablePageSize: 10,
          theme: 'light',
          processMode: 'template',
          exportFormat: 'excel',
          autoRefreshInterval: 10,
          capacityDimension: 'daily',
          showComparison: true,
          hideZeroOutput: false,
          scheduleFields: 'core',
          highlightOvertime: true,
          showLeave: true,
          shareLinkExpiry: 7,
          allowEdit: false,
          maxFileSize: 10,
          allowedFormats: ['excel', 'csv']
        };
        setPreferences(defaultPrefs);
        form.setFieldsValue(defaultPrefs);
      }
    } catch (error: any) {
      console.error('加载设置失败:', error);
      const errMsg = error.response?.data?.message || error.message || '加载设置失败';
      message.error(errMsg);
    }
  };

  // 加载 AI 配置
  const loadAIConfig = async () => {
    try {
      const res = await aiApi.getConfig();
      // response 直接是 data 对象
      if (res?.config) {
        const config = res.config;
        setAiConfig(config);
        aiForm.setFieldsValue(config);
      } else {
        // 设置默认配置：通义千问（需要用户填写真实密钥）
        const defaultConfig: AIConfig = {
          provider: 'qwen',
          apiKey: 'sk-1a243ecb1bd44732af8e034f92482a4b', // 默认密钥
          apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
          enabled: true
        };
        setAiConfig(defaultConfig);
        aiForm.setFieldsValue(defaultConfig);
      }
    } catch (error: any) {
      console.error('加载 AI 配置失败:', error);
      const errMsg = error.response?.data?.message || error.message || '加载 AI 配置失败';
      console.warn(`AI 配置加载异常: ${errMsg}，使用默认配置`);
      // 设置默认配置：通义千问（需要用户填写真实密钥）
      const defaultConfig: AIConfig = {
        provider: 'qwen',
        apiKey: 'sk-1a243ecb1bd44732af8e034f92482a4b', // 默认密钥
        apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
        enabled: true
      };
      setAiConfig(defaultConfig);
      aiForm.setFieldsValue(defaultConfig);
    }
  };

  // 加载 AI 提供商列表
  const loadAIProviders = async () => {
    try {
      const res = await aiApi.getProviders();
      // response 直接是 data 对象
      if (res?.providers) {
        setAiProviders(res.providers);
      } else {
        console.warn('AI 提供商列表响应格式异常，使用默认配置');
        // 设置默认提供商列表
        setAiProviders([
          { value: 'qwen', label: '阿里云百炼', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus', keyGuide: '请在阿里云百炼平台获取，确保密钥已开通 qwen-plus 模型权限' },
          { value: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', keyGuide: '请在 DeepSeek 平台获取' },
          { value: 'doubao', label: '豆包', defaultUrl: 'https://api.doubao.com/v1/chat/completions', model: 'ep-20241213032015-xq9f6', keyGuide: '请在豆包开发者平台获取' }
        ]);
      }
    } catch (error: any) {
      console.error('加载 AI 提供商列表失败:', error);
      const errMsg = error.response?.data?.message || error.message || '加载提供商列表失败';
      console.warn(`AI 提供商列表加载异常: ${errMsg}，使用默认列表`);
      // 设置默认提供商列表
      setAiProviders([
        { value: 'qwen', label: '阿里云百炼', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus', keyGuide: '请在阿里云百炼平台获取，确保密钥已开通 qwen-plus 模型权限' },
        { value: 'deepseek', label: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat', keyGuide: '请在 DeepSeek 平台获取' },
        { value: 'doubao', label: '豆包', defaultUrl: 'https://api.doubao.com/v1/chat/completions', model: 'ep-20241213032015-xq9f6', keyGuide: '请在豆包开发者平台获取' }
      ]);
    }
  };

  // 更新单个配置项
  const handleFieldChange = async (field: keyof SystemPreferences, value: any) => {
    if (!preferences) return;
    
    const newPreferences = { ...preferences, [field]: value };
    setPreferences(newPreferences);
    
    try {
      await settingsApi.updateSystemPreferences(newPreferences);
      message.success('配置已生效');
    } catch (error) {
      message.error('更新失败');
      setPreferences(preferences);
    }
  };

  // 恢复默认系统设置
  const handleReset = () => {
    Modal.confirm({
      title: '确认恢复默认设置',
      content: '将恢复所有系统配置为默认值，是否继续？',
      onOk: async () => {
        try {
          await settingsApi.resetSystemPreferences();
          await loadSettings();
          message.success('已恢复默认系统设置');
        } catch (error) {
          message.error('恢复失败');
        }
      }
    });
  };

  // 导出配置
  const handleExport = async () => {
    try {
      const res = await settingsApi.exportSettings();
      // response 直接是 data 对象
      const dataStr = JSON.stringify(res?.settings || {}, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `zeno-settings-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      message.success('配置导出成功');
    } catch (error) {
      message.error('导出失败');
    }
  };

  // 导入配置
  const handleImport = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        await settingsApi.importSettings(data);
        await loadSettings();
        message.success('配置导入成功');
      } catch (error) {
        message.error('导入失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
    return false;
  };

  // 更新 AI 配置
  const handleAIConfigChange = async (field: keyof AIConfig, value: any) => {
    if (!aiConfig) return;
    
    // 密钥不允许修改，跳过
    if (field === 'apiKey') {
      return;
    }
    
    const newConfig = { ...aiConfig, [field]: value };
    setAiConfig(newConfig);
    
    try {
      await aiApi.updateConfig(newConfig);
      message.success('AI 配置已更新');
    } catch (error) {
      message.error('更新失败');
      setAiConfig(aiConfig);
    }
  };

  // 测试 AI 连接
  const handleTestConnection = async () => {
    try {
      const values = await aiForm.validateFields(['provider', 'apiKey', 'apiUrl']);
      setTestingConnection(true);
      
      const res = await aiApi.testConnection(values);
      
      // response 直接是 data 对象
      if (res?.success) {
        message.success(res.message || 'AI 接口连接成功');
      } else {
        message.error(res?.message || '连接失败');
      }
    } catch (error: any) {
      message.error(error.response?.data?.message || '连接测试失败');
    } finally {
      setTestingConnection(false);
    }
  };

  // 当切换 AI 提供商时，自动填充默认 URL
  const handleProviderChange = (provider: string) => {
    const providerInfo = aiProviders.find(p => p.value === provider);
    if (providerInfo && providerInfo.defaultUrl) {
      aiForm.setFieldValue('apiUrl', providerInfo.defaultUrl);
      handleAIConfigChange('apiUrl', providerInfo.defaultUrl);
    }
    handleAIConfigChange('provider', provider);
  };

  if (!preferences) {
    return <div>加载中...</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1>系统设置</h1>
        <Space>
          <Button icon={<DownloadOutlined />} onClick={handleExport}>
            导出配置
          </Button>
          <Upload showUploadList={false} beforeUpload={handleImport} accept=".json">
            <Button icon={<UploadOutlined />}>导入配置</Button>
          </Upload>
          <Button icon={<UndoOutlined />} onClick={handleReset}>
            恢复默认
          </Button>
        </Space>
      </div>

      <Form form={form} layout="vertical">
        {/* 界面与操作配置 */}
        <Card title={<><SettingOutlined /> 界面与操作配置</>} style={{ marginBottom: 24 }}>
          <Form.Item label="默认登录后展示页面" name="defaultPage">
            <Select
              onChange={(value) => handleFieldChange('defaultPage', value)}
              options={[
                { label: '控制面板', value: 'dashboard' },
                { label: '生产计划', value: 'capacity' },
                { label: '排班管理', value: 'schedule' }
              ]}
            />
          </Form.Item>

          <Form.Item label="表格默认每页展示条数" name="tablePageSize">
            <Select
              onChange={(value) => handleFieldChange('tablePageSize', value)}
              options={[
                { label: '10 条', value: 10 },
                { label: '20 条', value: 20 },
                { label: '50 条', value: 50 }
              ]}
            />
          </Form.Item>

          <Form.Item label="界面主题" name="theme">
            <Radio.Group onChange={(e) => handleFieldChange('theme', e.target.value)}>
              <Radio value="light">浅色</Radio>
              <Radio value="dark">深色</Radio>
              <Radio value="auto">跟随系统</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="生产计划工序生成方式" name="processMode">
            <Radio.Group onChange={(e) => handleFieldChange('processMode', e.target.value)}>
              <Radio value="template">优先选模板</Radio>
              <Radio value="auto">优先自动生成</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="计件表默认导出格式" name="exportFormat">
            <Radio.Group onChange={(e) => handleFieldChange('exportFormat', e.target.value)}>
              <Radio value="excel">Excel</Radio>
              <Radio value="csv">CSV</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="数据自动刷新间隔（分钟）" name="autoRefreshInterval">
            <Select
              onChange={(value) => handleFieldChange('autoRefreshInterval', value)}
              options={[
                { label: '5 分钟', value: 5 },
                { label: '10 分钟', value: 10 },
                { label: '30 分钟', value: 30 }
              ]}
            />
          </Form.Item>
        </Card>

        {/* 数据展示配置 */}
        <Card title={<><BarChartOutlined /> 数据展示配置</>} style={{ marginBottom: 24 }}>
          <h4>产能数据</h4>
          <Form.Item label="产能统计维度" name="capacityDimension">
            <Radio.Group onChange={(e) => handleFieldChange('capacityDimension', e.target.value)}>
              <Radio value="daily">按日</Radio>
              <Radio value="weekly">按周</Radio>
              <Radio value="monthly">按月</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="显示环比/同比数据" name="showComparison" valuePropName="checked">
            <Switch onChange={(checked) => handleFieldChange('showComparison', checked)} />
          </Form.Item>

          <Form.Item label="隐藏零产量记录" name="hideZeroOutput" valuePropName="checked">
            <Switch onChange={(checked) => handleFieldChange('hideZeroOutput', checked)} />
          </Form.Item>

          <h4 style={{ marginTop: 24 }}>排班数据</h4>
          <Form.Item label="排班表展示字段" name="scheduleFields">
            <Radio.Group onChange={(e) => handleFieldChange('scheduleFields', e.target.value)}>
              <Radio value="core">仅显示核心字段</Radio>
              <Radio value="all">显示全部字段</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="标注加班时段" name="highlightOvertime" valuePropName="checked">
            <Switch onChange={(checked) => handleFieldChange('highlightOvertime', checked)} />
          </Form.Item>

          <Form.Item label="显示请假人员" name="showLeave" valuePropName="checked">
            <Switch onChange={(checked) => handleFieldChange('showLeave', checked)} />
          </Form.Item>
        </Card>

        {/* 文件与分享配置 */}
        <Card title={<><FileTextOutlined /> 文件与分享配置</>}>
          <h4>分享规则</h4>
          <Form.Item label="计件表分享链接有效期（天）" name="shareLinkExpiry">
            <Select
              onChange={(value) => handleFieldChange('shareLinkExpiry', value)}
              options={[
                { label: '1 天', value: 1 },
                { label: '7 天', value: 7 },
                { label: '永久', value: 0 }
              ]}
            />
          </Form.Item>

          <Form.Item label="允许他人编辑分享的计件表" name="allowEdit" valuePropName="checked">
            <Switch onChange={(checked) => handleFieldChange('allowEdit', checked)} />
          </Form.Item>

          <h4 style={{ marginTop: 24 }}>文件上传</h4>
          <Form.Item label="计件表上传最大文件大小（MB）" name="maxFileSize">
            <Select
              onChange={(value) => handleFieldChange('maxFileSize', value)}
              options={[
                { label: '5 MB', value: 5 },
                { label: '10 MB', value: 10 },
                { label: '20 MB', value: 20 }
              ]}
            />
          </Form.Item>

          <Form.Item label="支持的文件格式" name="allowedFormats">
            <Select
              mode="multiple"
              onChange={(value) => handleFieldChange('allowedFormats', value)}
              options={[
                { label: 'Excel', value: 'excel' },
                { label: 'CSV', value: 'csv' }
              ]}
            />
          </Form.Item>
        </Card>
      </Form>

      {/* AI 服务配置 */}
      <Card title={<><RobotOutlined /> AI 服务配置</>} style={{ marginTop: 24 }}>
        <Alert
          description="AI 服务可在工序生成时，自动生成细致的生产工序列表"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />
        
        <Form form={aiForm} layout="vertical">
          <Form.Item 
            label="AI 提供商" 
            name="provider"
            rules={[{ required: true, message: '请选择 AI 提供商' }]}
          >
            <Select
              onChange={handleProviderChange}
              options={aiProviders.map(p => ({ label: p.label, value: p.value }))}
              placeholder="请选择 AI 提供商"
            />
          </Form.Item>

          <Form.Item 
            label="API 密钥" 
            name="apiKey"
            rules={[
              { required: aiConfig?.enabled, message: '请输入 API 密钥' }
            ]}
            extra={
              aiConfig?.provider && aiProviders.find(p => p.value === aiConfig.provider)?.keyGuide
            }
          >
            <Input.Password
              placeholder="已配置默认密钥"
              disabled
              value={aiConfig?.apiKey}
            />
          </Form.Item>

          <Form.Item 
            label="接口地址" 
            name="apiUrl"
            rules={[{ required: true, message: '请输入接口地址' }]}
          >
            <Input
              placeholder="API 接口地址"
              onChange={(e) => handleAIConfigChange('apiUrl', e.target.value)}
            />
          </Form.Item>

          {aiConfig?.provider === 'qwen' && (
            <Form.Item 
              label="模型版本"
              name="model"
              extra="请在阿里云百炼平台的 '默认业务空间' 中确认该模型已开通"
            >
              <Select
                defaultValue="qwen-plus"
                options={[
                  { label: 'qwen-plus（推荐）', value: 'qwen-plus' },
                  { label: 'qwen-turbo（免费）', value: 'qwen-turbo' },
                  { label: 'qwen-max', value: 'qwen-max' },
                  { label: 'qwen-long', value: 'qwen-long' }
                ]}
              />
            </Form.Item>
          )}

          <Form.Item label="启用 AI 服务" name="enabled" valuePropName="checked">
            <Switch onChange={(checked) => handleAIConfigChange('enabled', checked)} />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              icon={<ApiOutlined />} 
              onClick={handleTestConnection}
              loading={testingConnection}
              disabled={!aiConfig?.enabled}
            >
              测试连接
            </Button>
            <span style={{ marginLeft: 12, color: '#999' }}>
              {!aiConfig?.enabled && '请先启用 AI 服务'}
            </span>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettings;
