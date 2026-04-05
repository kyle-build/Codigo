import { LockOutlined, MobileOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, message } from "antd";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import type { LoginWithPasswordRequest } from "@codigo/schema";
import { useAuth } from "@/shared/auth/AuthProvider";
import { resolveAdminDefaultRoute } from "@/modules/admin/config/navigation";
import { useAdminAccess } from "@/modules/admin/hooks/useAdminAccess";

export default function LoginPage() {
  const { login, loading, user } = useAuth();
  const { hasAdminPermission } = useAdminAccess();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return (
      <Navigate
        to={resolveAdminDefaultRoute(hasAdminPermission)}
        replace
      />
    );
  }

  const handleFinish = async (values: LoginWithPasswordRequest) => {
    setSubmitting(true);
    try {
      const nextUser = await login(values);
      const isAdmin =
        nextUser.global_role === "ADMIN" || nextUser.global_role === "SUPER_ADMIN";
      if (!isAdmin) {
        throw new Error("当前账号没有后台权限");
      }
      navigate("/", { replace: true });
    } catch (error: unknown) {
      const nextMessage =
        error instanceof Error ? error.message : "登录失败，请稍后重试";
      message.error(nextMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-[420px] rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-lg font-bold text-blue-600">
            C
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Codigo 管理后台</h1>
          <p className="mt-2 text-sm text-slate-500">
            使用管理员账号登录，集中治理用户、页面与组件资产
          </p>
        </div>
        <Alert
          className="mb-6"
          type="info"
          showIcon
          message="仅管理员与超级管理员可以访问后台"
        />
        <Form layout="vertical" onFinish={(values) => void handleFinish(values)}>
          <Form.Item
            label="手机号"
            name="phone"
            rules={[
              { required: true, message: "请输入手机号" },
              { pattern: /^1\d{10}$/, message: "请输入正确的手机号" },
            ]}
          >
            <Input prefix={<MobileOutlined />} placeholder="请输入管理员手机号" />
          </Form.Item>
          <Form.Item
            label="密码"
            name="password"
            rules={[{ required: true, message: "请输入密码" }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入登录密码"
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            className="mt-2 h-10 w-full"
            loading={submitting || loading}
          >
            进入后台
          </Button>
        </Form>
      </div>
    </div>
  );
}
