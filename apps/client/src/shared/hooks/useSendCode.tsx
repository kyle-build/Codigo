import type { FormInstance } from "antd";
import { Button, Form, Input } from "antd";
import { useEffect, useState } from "react";
import { useRequest } from "ahooks";
import { getCaptcha, sendCode } from "@/modules/auth/api/user";
/**
 * 使用useSendCode函数
 *
 * @param form - 表单实例
 * @param type - 请求类型
 * @returns 返回使用sendCode函数的对象
 */
export function useSendCode(form: FormInstance, type: string) {
  // 设置倒计时并返回倒计时数值和设置倒计时的方法
  const [countDown, setCountDown] = useState(60);

  // 设置验证码图片源和设置验证码图片源的方法
  const [captchaSrc, setCaptchaSrc] = useState<string>("");

  // 是否需要图形验证码（默认不需要，命中风控才需要）
  const [captchaRequired, setCaptchaRequired] = useState(false);

  // 设置是否禁用和设置是否禁用的方法
  const [isDisable, setIsDisable] = useState(false);

  // 设置是否已经开始倒计时和设置是否已经开始倒计时的方法
  const [startedCountDown, setStartedCountDown] = useState(false);

  /**
   * 使用useRequest自定义hook来获取captcha图片
   *
   * @param type - 获取captcha图片的类型
   * @returns 返回getCaptcha请求的结果和请求是否正在加载的状态
   */
  const { run: refreshCaptcha, loading: loadingWithGetCaptcha } = useRequest(
    () => getCaptcha({ type }),
    {
      onSuccess: (result) => {
        setCaptchaSrc(result.data);
      },
    }
  );

  useEffect(() => {
    if (!captchaRequired) return;
    refreshCaptcha();
  }, [captchaRequired, refreshCaptcha]);

  /**
   * 使用useRequest自定义hook来发送sendCode请求
   * @param values - 发送的请求参数
   * @returns 返回sendCode请求的结果和请求是否正在加载的状态
   */
  const { run: execSendCode, loading: loadingWithGetSendCode } = useRequest(
    (values) => sendCode(values),
    {
      manual: true,
      onSuccess: () => {
        setStartedCountDown(true);
        setCaptchaRequired(false);
      },
      onError: (error: any) => {
        const code = error?.response?.data?.code;
        if (code === 602) {
          setCaptchaRequired(true);
          form.setFieldsValue({ captcha: "" });
        }
      },
    }
  );

  /**
   * 验证码倒计时的逻辑
   *
   * - 如果开始倒计时为false，则直接返回
   * - 设置isDisable为true
   * - 每秒执行一次倒计时逻辑
   * - 清除计时器并设置isDisable为false，同时重置countDown和startedCountDown的值
   */
  useEffect(() => {
    if (startedCountDown === false) return;

    setIsDisable(true);
    setCountDown(60);

    const timer = window.setInterval(() => {
      setCountDown((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          setIsDisable(false);
          setStartedCountDown(false);
          return 60;
        }
        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [startedCountDown]);

  /**
   * 获取验证码并进行验证
   */
  async function getCode() {
    try {
      await form.validateFields(
        captchaRequired ? ["phone", "captcha"] : ["phone"]
      );
    } catch {
      return;
    }
    const phone = form.getFieldsValue().phone as string;
    const captcha = form.getFieldsValue().captcha as string | undefined;
    if (!phone) return;
    if (captchaRequired && !captcha) return;

    // 验证码接口请求
    execSendCode({
      phone,
      type,
      ...(captchaRequired ? { captcha } : {}),
    });
  }

  /**
   * sendCode模板，包含captcha图片和发送验证码的按钮
   */
  const sendCodeTemplate = (
    <>
      {captchaRequired ? (
        <Form.Item
          label="图形验证码"
          name="captcha"
          rules={[{ required: true, message: "请输入图形验证码!" }]}
        >
          <div>
            <Input className="w-[122px]" disabled={loadingWithGetCaptcha} />
            <img
              onClick={refreshCaptcha}
              src={
                captchaSrc
                  ? `data:image/svg+xml;base64,${btoa(captchaSrc)}`
                  : "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="
              }
              className="w-[102px] h-[32px] inline-block rounded-md bg-slate-100"
            />
          </div>
        </Form.Item>
      ) : null}

      <Form.Item
        label="手机验证码"
        name="sendCode"
        rules={[{ required: true, message: "请输入手机验证码!" }]}
      >
        <div>
          <Input className="w-[111px] mr-2" />
          <Button onClick={getCode} disabled={isDisable} className="w-[105px]">
            {loadingWithGetSendCode
              ? "加载中"
              : isDisable
              ? `${countDown}秒后重发`
              : "获取验证码"}
          </Button>
        </div>
      </Form.Item>
    </>
  );

  return {
    refreshCaptcha,
    sendCodeTemplate,
  };
}









