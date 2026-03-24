import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Form, Input, Button, Card, Tabs, message, Avatar, Upload } from "antd";
import {
  UserOutlined,
  UploadOutlined,
  LockOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { updateProfile, updatePassword } from "@/modules/auth/api/user";
import { BASE_URL } from "@/shared/utils/request";
import { useNavigate } from "react-router-dom";
import { HomeHeader } from "@/modules/home/components/homeHeader/homeHeader";

const Profile = observer(() => {
  const { store, fetchUserInfo } = useStoreAuth();
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!store.token) {
      navigate("/login");
      return;
    }
    if (store.details) {
      profileForm.setFieldsValue({
        username: store.details.username,
        head_img: store.details.head_img,
      });
    } else {
      fetchUserInfo();
    }
  }, [store.details, store.token, profileForm, navigate, fetchUserInfo]);

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      await updateProfile({
        username: values.username,
        head_img: values.head_img,
      });
      message.success("个人信息更新成功");
      await fetchUserInfo();
    } catch (error: any) {
      message.error(error.message || "更新失败");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error("两次输入的新密码不一致");
      return;
    }
    setLoading(true);
    try {
      await updatePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      message.success("密码修改成功，请重新登录");
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.message || "密码修改失败");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    name: "file",
    action: `${BASE_URL}/resources`,
    headers: {
      Authorization: store.token || "",
    },
    data: {
      type: "image",
    },
    onChange(info) {
      if (info.file.status === "done") {
        const url = info.file.response?.data?.url;
        if (url) {
          profileForm.setFieldValue("head_img", url);
          // 强制更新视图
          setLoading((prev) => !prev);
          message.success("头像上传成功");
        }
      } else if (info.file.status === "error") {
        message.error("头像上传失败");
      }
    },
  };

  const items = [
    {
      key: "1",
      label: (
        <span>
          <UserOutlined />
          基本信息
        </span>
      ),
      children: (
        <div className="max-w-md mt-6">
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Form.Item label="头像" name="head_img">
              <div className="flex items-center gap-4">
                <Form.Item name="head_img" noStyle>
                  <Input type="hidden" />
                </Form.Item>
                <Avatar
                  size={80}
                  src={profileForm.getFieldValue("head_img")}
                  icon={<UserOutlined />}
                />
                <Upload {...uploadProps} showUploadList={false}>
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </div>
            </Form.Item>
            <Form.Item
              label="昵称"
              name="username"
              rules={[{ required: true, message: "请输入昵称" }]}
            >
              <Input placeholder="请输入昵称" size="large" />
            </Form.Item>
            <Form.Item label="手机号" extra="手机号暂不支持修改">
              <Input value={store.details?.phone} disabled size="large" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <span>
          <LockOutlined />
          修改密码
        </span>
      ),
      children: (
        <div className="max-w-md mt-6">
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleUpdatePassword}
          >
            <Form.Item
              label="原密码"
              name="oldPassword"
              rules={[{ required: true, message: "请输入原密码" }]}
            >
              <Input.Password placeholder="请输入原密码" size="large" />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: "请输入新密码" },
                { min: 6, message: "密码长度不能少于6位" },
              ]}
            >
              <Input.Password placeholder="请输入新密码" size="large" />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              rules={[
                { required: true, message: "请再次输入新密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致!"));
                  },
                }),
              ]}
            >
              <Input.Password placeholder="请再次输入新密码" size="large" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                更新密码
              </Button>
            </Form.Item>
          </Form>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <HomeHeader />
      <div className="pt-20 pb-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mt-10">
          <Button
            type="link"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="mb-4 text-slate-500 hover:text-slate-800"
          >
            返回
          </Button>
          <Card className="shadow-sm rounded-xl border-slate-200">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">个人中心</h2>
            <Tabs defaultActiveKey="1" items={items} />
          </Card>
        </div>
      </div>
    </div>
  );
});

export default Profile;
