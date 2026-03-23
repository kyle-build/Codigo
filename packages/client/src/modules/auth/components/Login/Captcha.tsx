import { Button, Form, Input } from "antd";
import { useSendCode } from "@/shared/hooks/useSendCode";
import { usePhoneLogin } from "@/modules/auth/hooks/usePhoneLogin";

export default function Captcha() {
  const [form] = Form.useForm();
  const { sendCodeTemplate } = useSendCode(form, "login");
  const { run, loading } = usePhoneLogin();

  return (
    <Form onFinish={run} form={form}>
      <Form.Item
        label="账号"
        name="phone"
        rules={[
          { required: true, message: "请输入手机号!" },
          { pattern: /^1\d{10}$/, message: "请输入正确的手机号!" },
        ]}
      >
        <Input placeholder="请输入手机号" />
      </Form.Item>

      {sendCodeTemplate}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          className="w-full"
          loading={loading}
        >
          登录
        </Button>
      </Form.Item>
    </Form>
  );
}












