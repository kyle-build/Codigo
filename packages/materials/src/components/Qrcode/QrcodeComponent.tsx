import { QRCode } from 'antd'
import React, { useMemo } from 'react'
import { getDefaultValueByConfig } from '..'
import { qrcodeComponentDefaultConfig } from '.'
import type { IQrcodeComponentProps } from '.'

/**
 * 渲染二维码物料，直接透传二维码展示所需的配置属性。
 */
export default function QrcodeComponent(_props: IQrcodeComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(qrcodeComponentDefaultConfig), ..._props }
  }, [_props])

  return (
    <div className="flex items-center justify-center p-1">
      <QRCode {...props}></QRCode>
    </div>
  )
}
