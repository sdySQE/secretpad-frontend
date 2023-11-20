import { PushpinOutlined } from '@ant-design/icons';
import { Popover, Badge, Table, Typography, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { getProjectDatatable } from '@/services/secretpad/ProjectController';

import styles from './datatable-preview.less';
import { EdgeAuthWrapper } from './edge-wrapper-auth';
import { parse } from 'query-string';

interface DatatablePreviewInterface {
  // tableInfo: Record<string, any>;
  children: React.ReactElement;
  node: API.NodeVO & { nodeType?: 'embedded' };
  datatableId?: string;
}

export const DatatablePreview = (props: DatatablePreviewInterface) => {
  const { Link } = Typography;

  const [isFixed, setIsFixed] = useState(false);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const columns = [
    {
      title: '字段名称',
      dataIndex: 'colName',
    },
    {
      title: '类型',
      dataIndex: 'colType',
    },
    {
      title: '描述',
      dataIndex: 'colComment',
    },
  ];

  const [tableInfo, setTableInfo] = React.useState<Record<string, any>>();

  const getDatatableInfo = async (nodeId: string, datatableId: string) => {
    setLoading(true);
    const { search } = window.location;
    const { projectId } = parse(search);
    const { data } = await getProjectDatatable({
      nodeId,
      datatableId,
      projectId: projectId as string,
    });
    setLoading(false);
    if (data) {
      setTableInfo(data);
    }
  };

  useEffect(() => {
    if (popoverOpen) {
      getDatatableInfo(props.node?.nodeId || '', props?.datatableId || '');
    }
  }, [popoverOpen]);

  const content = (
    <>
      <Table
        size="small"
        dataSource={tableInfo?.configs || []}
        columns={columns}
        loading={loading}
        rowKey={(record) => record.colName as string}
      />
      {props.node.nodeType === 'embedded' && (
        <EdgeAuthWrapper>
          <Link
            onClick={() => {
              const a = document.createElement('a');
              a.href = `/node?nodeId=${props.node.nodeId}&tab=data-management`;
              a.target = '_blank';
              a.click();
            }}
          >
            查看全部
          </Link>
        </EdgeAuthWrapper>
      )}
    </>
  );

  const onOpenChange = (open: boolean) => {
    setPopoverOpen(open);
    if (isFixed) {
      setPopoverOpen(true);
    }
  };

  return (
    <Popover
      open={popoverOpen}
      content={content}
      placement="rightTop"
      overlayClassName={styles.nodePopover}
      onOpenChange={onOpenChange}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between ' }}>
          <div>
            <span className={styles.title}>{tableInfo?.datatableName}</span>
            <Badge status="success" text="可用" />
          </div>
          {isFixed ? (
            <Tooltip title="取消固定">
              <PushpinOutlined
                rotate={315}
                onClick={() => {
                  setIsFixed(false);
                  setPopoverOpen(false);
                }}
              />
            </Tooltip>
          ) : (
            <Tooltip title="固定弹窗">
              <PushpinOutlined
                onClick={() => {
                  setIsFixed(true);
                  setPopoverOpen(true);
                }}
              />
            </Tooltip>
          )}
        </div>
      }
    >
      {props.children}
    </Popover>
  );
};
