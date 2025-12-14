import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Input, message, Tag } from 'antd';
import { CloudUploadOutlined, CloudDownloadOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { backupApi } from '../services/backup';
import type { Backup } from '../services/backup';
import dayjs from 'dayjs';

const BackupManagement: React.FC = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [version, setVersion] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await backupApi.listBackups();
      setBackups(res.data);
    } catch (error) {
      message.error('加载备份列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!version.trim()) {
      message.warning('请输入版本号');
      return;
    }

    setCreating(true);
    try {
      const res = await backupApi.createBackup(version);
      message.success(`备份创建成功: ${res.data.filename}`);
      setShowCreateModal(false);
      setVersion('');
      loadBackups();
    } catch (error) {
      message.error('备份创建失败');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = (filename: string) => {
    Modal.confirm({
      title: '确认恢复数据',
      icon: <ExclamationCircleOutlined />,
      content: `确定要恢复备份文件 "${filename}" 吗？此操作将覆盖当前数据！`,
      okText: '确认恢复',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const res = await backupApi.restoreBackup(filename);
          message.success(`数据恢复成功，版本：${res.data.version}`);
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        } catch (error) {
          message.error('数据恢复失败');
        }
      }
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const columns = [
    {
      title: '备份文件',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => {
        const isRecent = dayjs().diff(dayjs(name.split('_')[1]), 'hour') < 24;
        return (
          <Space>
            <span>{name}</span>
            {isRecent && <Tag color="green">最新</Tag>}
          </Space>
        );
      }
    },
    {
      title: '文件大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => formatFileSize(size)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Backup) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CloudDownloadOutlined />}
            onClick={() => handleRestore(record.name)}
          >
            恢复
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>数据备份管理</h1>
        <Button
          type="primary"
          icon={<CloudUploadOutlined />}
          onClick={() => setShowCreateModal(true)}
        >
          创建备份
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={backups}
          rowKey="name"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="创建数据备份"
        open={showCreateModal}
        onOk={handleCreateBackup}
        onCancel={() => {
          setShowCreateModal(false);
          setVersion('');
        }}
        confirmLoading={creating}
      >
        <div style={{ marginBottom: 16 }}>
          <p style={{ color: '#666' }}>
            备份将包含所有核心数据（用户、工厂、员工等），请输入版本号用于标识此次备份。
          </p>
        </div>
        <Input
          placeholder="请输入版本号（如：1.0.1）"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          onPressEnter={handleCreateBackup}
        />
      </Modal>
    </div>
  );
};

export default BackupManagement;
