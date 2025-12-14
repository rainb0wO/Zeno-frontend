import React, { useState } from 'react';
import { Modal, Form, DatePicker, Button, message } from 'antd';
import scheduleAPI from '../services/schedule';

const { RangePicker } = DatePicker;

interface SmartScheduleGeneratorProps {
  visible: boolean;
  planId?: string;
  factoryId: string;
  onCancel: () => void;
  onGenerated: () => void;
}

const SmartScheduleGenerator: React.FC<SmartScheduleGeneratorProps> = ({
  visible,
  planId,
  factoryId,
  onCancel,
  onGenerated
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (values: any) => {
    setLoading(true);
    try {
      const result = await scheduleAPI.generateSchedule({
        factoryId,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        planId,
      });

      message.success(result.message || 'AI排班生成成功');
      onGenerated();
      handleClose();
    } catch (error: any) {
      message.error(error.message || '生成排班失败');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="AI智能排班"
      open={visible}
      onCancel={handleClose}
      width={600}
      footer={null}
    >
      <Form form={form} onFinish={handleGenerate} layout="vertical">
        <Form.Item
          label="排班周期"
          name="dateRange"
          rules={[{ required: true, message: '请选择排班周期' }]}
        >
          <RangePicker style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            生成排班表
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default SmartScheduleGenerator;
