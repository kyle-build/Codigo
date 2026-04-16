import { useEffect } from "react";
import { Form, Input, Modal } from "antd";

interface PublishTemplateModalProps {
  open: boolean;
  loading: boolean;
  initialValues: {
    name: string;
    key: string;
    desc: string;
    tags: string;
  };
  onCancel: () => void;
  onSubmit: (values: {
    name: string;
    key: string;
    desc: string;
    tags: string;
  }) => Promise<void>;
}

/**
 * 提供“发布为模板”所需的轻量信息录入表单。
 */
export function PublishTemplateModal({
  open,
  loading,
  initialValues,
  onCancel,
  onSubmit,
}: PublishTemplateModalProps) {
  const [form] = Form.useForm<PublishTemplateModalProps["initialValues"]>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
      return;
    }

    form.setFieldsValue(initialValues);
  }, [form, initialValues, open]);

  /**
   * 提交模板表单并交由外层执行业务请求。
   */
  async function handleOk() {
    const values = await form.validateFields();
    await onSubmit(values);
  }

  return (
    <Modal
      open={open}
      title="发布为模板"
      okText="立即发布"
      cancelText="取消"
      confirmLoading={loading}
      onCancel={onCancel}
      onOk={handleOk}
      destroyOnHidden
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="模板名称"
          name="name"
          rules={[{ required: true, message: "请输入模板名称" }]}
        >
          <Input maxLength={50} placeholder="例如：运营后台通用模板" />
        </Form.Item>
        <Form.Item
          label="模板 Key"
          name="key"
          extra="仅支持小写字母、数字和中划线"
          rules={[
            { required: true, message: "请输入模板 Key" },
            {
              pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
              message: "模板 Key 格式不正确",
            },
          ]}
        >
          <Input maxLength={60} placeholder="例如：operation-admin-template" />
        </Form.Item>
        <Form.Item
          label="模板描述"
          name="desc"
          rules={[{ required: true, message: "请输入模板描述" }]}
        >
          <Input.TextArea rows={3} maxLength={200} placeholder="描述该模板适用的页面场景" />
        </Form.Item>
        <Form.Item label="模板标签" name="tags" extra="多个标签用英文逗号分隔">
          <Input maxLength={120} placeholder="后台, 仪表盘, 管理系统" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
