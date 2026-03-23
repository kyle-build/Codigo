import { Button, Form, Input } from "antd";
import { useLogin } from "@/modules/auth/hooks/useLogin";
export default function Account() {
  //  账号密码登录请求
  const { run, loading } = useLogin();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Form onFinish={run}>
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

          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码!" }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

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
      </div>
    </div>
  );
}












