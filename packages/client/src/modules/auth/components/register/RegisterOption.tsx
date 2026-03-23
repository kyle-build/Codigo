import { Button, Checkbox, Form, Input } from "antd";
import { useSendCode } from "@/shared/hooks/useSendCode";
import { useRegister } from "@/modules/auth/hooks/useRegister";

export default function RegisterCaptcha() {
  const [form] = Form.useForm();
  const { sendCodeTemplate } = useSendCode(form, "register");
  const { run, loading } = useRegister(form);

  return (
    <Form form={form} onFinish={run} initialValues={{ remember: true }}>
      <Form.Item
        label="手机号码"
        name="phone"
        rules={[{ required: true, message: "请输入手机号码!" }]}
      >
        <Input />
      </Form.Item>

      {sendCodeTemplate}

      <Form.Item
        label="密码"
        name="password"
        rules={[{ required: true, message: "请输入密码!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        label="确认密码"
        name="confirm"
        rules={[{ required: true, message: "请输入确认密码!" }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="remember"
        valuePropName="checked"
        rules={[
          {
            validator: (_, value) =>
              value
                ? Promise.resolve()
                : Promise.reject(new Error("请同意协议!")),
          },
        ]}
      >
        <Checkbox>同意Codigo《隐私策略》</Checkbox>
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          loading={loading}
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );
}












