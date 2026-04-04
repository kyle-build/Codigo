import React, { useMemo } from 'react'
import { Checkbox } from 'antd'
import { getDefaultValueByConfig } from '../func'
import { type ICheckboxComponentProps, checkboxComponentDefaultConfig } from '.'

/**
 * 渲染复选框组物料，支持多选值回传与选项列表配置。
 */
export default function CheckboxComponent(_props: ICheckboxComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(checkboxComponentDefaultConfig), ..._props }
  }, [_props])

  return (
    <div className="space-y-2 p-4">
      <span className="text-lg font-bold">{props.title}</span>
      <br />
      <Checkbox.Group
        options={props.options.map(item => ({
          label: item.value,
          value: item.id,
        }))}
        value={props.defaultChecked}
        onChange={value => props.onUpdate?.(value)}
      />
    </div>
  )
}
