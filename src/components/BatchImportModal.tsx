import { useState } from 'react';
import { Modal, Upload, Button, message, Space, Typography, Progress, Table } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import personnelApi from '../services/personnel';
import type { BatchImportResult } from '../services/personnel';

const { Text, Link } = Typography;

interface BatchImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ErrorRow {
  key: number;
  row: number;
  message: string;
}

const BatchImportModal: React.FC<BatchImportModalProps> = ({ open, onClose, onSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorRows, setErrorRows] = useState<ErrorRow[]>([]);

  const resetState = () => {
    setUploading(false);
    setProgress(0);
    setErrorRows([]);
  };

  // 下载模板
  const handleDownloadTemplate = async () => {
    try {
      const blob = await personnelApi.downloadTemplate('xlsx');
      const url = window.URL.createObjectURL(blob as unknown as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '员工导入模板.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('下载模板失败', error);
      message.error('下载模板失败');
    }
  };

  // 自定义上传请求
  const customRequest = async (options: any) => {
    const { file, onProgress, onError, onSuccess: _onSuccess } = options;
    setUploading(true);
    setProgress(0);

    try {
      // 进度：模拟 20% 提交
      onProgress({ percent: 20 });

      const result: BatchImportResult = await personnelApi.batchImportEmployees(file as File);

      // 进度：80%
      onProgress({ percent: 80 });

      if (result.failureCount === 0) {
        message.success(`导入成功，共 ${result.successCount} 条`);
        _onSuccess(result, file);
        onSuccess();
        onClose();
      } else {
        message.warning(`成功 ${result.successCount} 条，失败 ${result.failureCount} 条`);
        setErrorRows(
          (result.errors || []).map((e, idx) => ({ key: idx, row: e.row, message: e.message }))
        );
      }

      // 完成 100%
      onProgress({ percent: 100 });
    } catch (err: any) {
      console.error('上传失败', err);
      message.error(err?.message || '上传失败');
      onError(err);
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    { title: '行号', dataIndex: 'row', key: 'row', width: 80 },
    { title: '错误信息', dataIndex: 'message', key: 'message' },
  ];

  return (
    <Modal
      title="批量导入员工"
      open={open}
      onCancel={() => {
        resetState();
        onClose();
      }}
      footer={null}
      destroyOnClose
      width={600}
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Text>
          1. 请先下载模板，按照要求填写 <Text strong>姓名（必填）</Text> 、联系电话（选填）。
        </Text>
        <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
          下载模板
        </Button>
        <Text>2. 填写完毕后，上传文件：</Text>
        <Upload
          accept=".xlsx,.csv"
          customRequest={customRequest}
          showUploadList={false}
          disabled={uploading}
        >
          <Button type="primary" icon={<UploadOutlined />} loading={uploading}>
            选择并上传文件
          </Button>
        </Upload>
        {uploading && <Progress percent={progress} />}
        {errorRows.length > 0 && (
          <Table
            columns={columns}
            dataSource={errorRows}
            pagination={{ pageSize: 5 }}
            scroll={{ y: 240 }}
            size="small"
          />
        )}
      </Space>
    </Modal>
  );
};

export default BatchImportModal;

