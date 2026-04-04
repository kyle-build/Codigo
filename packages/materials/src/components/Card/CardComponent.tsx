import React, { useMemo } from 'react'
import { Card } from 'antd'
import { getDefaultValueByConfig } from '..'
import type { ICardComponentProps } from '.'
import { cardComponentDefaultConfig } from '.'

const { Meta } = Card

/**
 * 渲染基础卡片物料，展示封面、标题与描述信息。
 */
export default function CardComponent(_props: ICardComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(cardComponentDefaultConfig), ..._props }
  }, [_props])

  return (
    <Card
      hoverable
      cover={<img alt="cover_img" src={props.coverImg} />}
    >
      <Meta title={props.title} description={props.description} />
    </Card>
  )
}
