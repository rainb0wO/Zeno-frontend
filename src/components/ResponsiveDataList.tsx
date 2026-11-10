import React from 'react';
import { Table, List, Card, Grid, Space } from 'antd';
import type { ColumnType, ColumnsType, TablePaginationConfig } from 'antd/es/table';
import { useIsMobile } from '../hooks/useIsMobile';

export interface ResponsiveDataListProps<T extends object = any> {
  columns: ColumnsType<T>;
  dataSource: T[];
  rowKey: string | ((record: T) => string);
  loading?: boolean;
  pagination?: false | TablePaginationConfig;
  onRowClick?: (record: T) => void;
  mobileRenderItem?: (record: T) => React.ReactNode;
  listStyle?: React.CSSProperties;
}

function isLeafColumn<T extends object>(column: ColumnsType<T>[number]): column is ColumnType<T> {
  return !('children' in column);
}

function cellValue<T extends object>(record: T, column: ColumnType<T>) {
  const raw = (record as Record<string, unknown>)[column.dataIndex as string];
  return column.render ? (column.render as (value: unknown, record: T) => React.ReactNode)(raw, record) : raw;
}

function defaultMobileRender<T extends object>(
  record: T,
  columns: ColumnsType<T>
) {
  const leafColumns = (columns || []).filter(isLeafColumn);
  if (leafColumns.length === 0) return null;
  const primary = leafColumns[0];
  return (
    <Space direction="vertical" size={4} style={{ width: '100%' }}>
      <div style={{ fontWeight: 600 }}>{cellValue(record, primary) as React.ReactNode}</div>
      {leafColumns.slice(1, 4).map((col, index) => {
        const key = String(col.dataIndex ?? col.key ?? index);
        const value = cellValue(record, col);
        return (
          <div key={key} style={{ fontSize: 12, color: '#666' }}>
            {col.title as React.ReactNode}: {value as React.ReactNode}
          </div>
        );
      })}
    </Space>
  );
}

function ResponsiveDataList<T extends object = any>(props: ResponsiveDataListProps<T>) {
  const { columns, dataSource, rowKey, loading, pagination, onRowClick, mobileRenderItem, listStyle } = props;
  const screens = Grid.useBreakpoint();
  const isMobile = useIsMobile() || !screens.md; // fallback if hook not ready

  if (!isMobile) {
    return (
      <Table
        columns={columns}
        dataSource={dataSource}
        rowKey={rowKey as any}
        loading={loading}
        pagination={pagination}
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          onMouseDown: (e) => {
            const target = e.target as HTMLElement | null;
            if (!target) return;
            if (
              target.closest('a') ||
              target.closest('button') ||
              target.closest('[role="button"]') ||
              target.closest('.ant-btn') ||
              target.closest('.ant-dropdown-menu') ||
              target.closest('[data-row-click-ignore="true"]')
            ) {
              e.stopPropagation();
            }
          }
        })}
      />
    );
  }

  return (
    <List
      style={listStyle}
      dataSource={dataSource}
      loading={loading}
      renderItem={(item) => (
        <Card
          style={{ marginBottom: 12 }}
          hoverable={!!onRowClick}
          onClick={() => onRowClick?.(item)}
        >
          {mobileRenderItem ? mobileRenderItem(item) : defaultMobileRender(item, columns)}
        </Card>
      )}
    />
  );
}

export default ResponsiveDataList;

