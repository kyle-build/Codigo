import React, { useMemo } from 'react'
import { Empty } from 'antd'
import { getDefaultValueByConfig } from '..'
import type { IEmptyComponentProps } from '.'
import { emptyComponentDefaultConfig } from '.'

/**
 * 渲染空状态物料，支持自定义描述、图片与图片尺寸。
 */
export default function EmptyComponent(_props: IEmptyComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(emptyComponentDefaultConfig), ..._props }
  }, [_props])

  return (
    <Empty
      className="flex flex-col items-center justify-center"
      description={props.description || '暂无状态'}
      image={props.image || Empty.PRESENTED_IMAGE_DEFAULT}
      imageStyle={{ height: `${props.imageHeight}px`, width: `${props.imageWidth}px`, objectFit: props.imageObjectFit }}
    />
  )
}
