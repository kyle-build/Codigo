import { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Form, Input, Button, Card, Tabs, message, Avatar } from "antd";
import {
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useStoreAuth } from "@/shared/hooks/use-store-auth";
import { updateProfile, updatePassword } from "@/modules/auth/api/user";
import { useNavigate } from "react-router-dom";
import { ProfilePageHeader } from "./components/profile-page-header";

type ProfileProps = {
  isModal?: boolean;
  onUpdateSuccess?: () => void;
};

function Profile({
  isModal = false,
  onUpdateSuccess,
}: ProfileProps) {
    const { store, fetchUserInfo, updateLocalUserInfo } = useStoreAuth();
    const [profileForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
      if (!store.token) {
        navigate("/?modal=login");
        return;
      }
      if (store.details) {
        profileForm.setFieldsValue({
          username: store.details.username,
          head_img: store.details.head_img,
        });
        setSelectedAvatar(store.details.head_img || "");
      } else {
        fetchUserInfo();
      }
    }, [store.details, store.token, profileForm, navigate]);

    const handleUpdateProfile = async (values: any) => {
      setLoading(true);
      const currentHeadImg =
        selectedAvatar || profileForm.getFieldValue("head_img");
      try {
        await updateProfile({
          username: values.username,
          head_img: currentHeadImg,
        });
        updateLocalUserInfo({
          username: values.username,
          head_img: currentHeadImg,
        });
        message.success("个人信息更新成功");
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
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
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } catch (error: any) {
        message.error(error.message || "密码修改失败");
      } finally {
        setLoading(false);
      }
    };

    const avatarOptions = [
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Jasper",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Coco",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Buster",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Luna",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Milo",
      "https://api.dicebear.com/7.x/avataaars/svg?seed=Simba",
    ];

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
              <Form.Item label="选择头像">
                <div className="flex flex-wrap gap-4">
                  <Form.Item name="head_img" noStyle>
                    <Input type="hidden" />
                  </Form.Item>
                  {avatarOptions.map((url) => (
                    <div
                      key={url}
                      className={`cursor-pointer rounded-full p-1 border-2 transition-all ${
                        selectedAvatar === url
                          ? "border-emerald-500 bg-emerald-50 scale-110"
                          : "border-transparent hover:bg-slate-100 hover:scale-105"
                      }`}
                      onClick={() => {
                        profileForm.setFieldValue("head_img", url);
                        setSelectedAvatar(url);
                      }}
                    >
                      <Avatar size={64} src={url} />
                    </div>
                  ))}
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

    const content = (
      <Card
        className="shadow-sm rounded-xl border-slate-200"
        bordered={!isModal}
      >
        {!isModal && (
          <h2 className="text-2xl font-bold text-slate-800 mb-6">个人中心</h2>
        )}
        <Tabs defaultActiveKey="1" items={items} />
      </Card>
    );

    if (isModal) {
      return <div className="p-4">{content}</div>;
    }

    return (
      <div className="min-h-screen bg-slate-50">
        <ProfilePageHeader
          onBack={() => navigate(-1)}
          onHome={() => navigate("/")}
        />
        <div className="pb-10 pt-10">
          <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
            {content}
          </div>
        </div>
      </div>
    );
}

const ProfileComponent = observer(Profile);

export default ProfileComponent;
