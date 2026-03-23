/**
 * 枚举状态码
 */

export enum Code {
  /** 成功 */
  success = 0,
  /* 失败 */
  Failed = -1,
  /** 未登录 */
  NotLogin = 401,
  /** 未授权 */
  NotAuthorized = 403,
  /** 密码错误 */
  LOGIN_ERROR = 400,
  /** 资源不存在 */
  NotFound = 404,
  /** 服务器错误 */
  ServerError = 500,
  /** 接口未实现 */
  NotImplemented = 501,
  /** 数据库错误 */
  DatabaseError = 502,
  /** 接口参数错误 */
  InvalidParams = 600,
  /** 接口参数缺失 */
  MissingParams = 601,
}
