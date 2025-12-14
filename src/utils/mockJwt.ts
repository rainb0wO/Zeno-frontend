// 模拟JWT生成工具（前端使用，与后端JWT_SECRET保持一致）

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

/**
 * 生成模拟JWT token
 * 注意：这是简化的实现，仅用于开发环境的管理员登录
 * 生产环境应使用真实的后端JWT
 */
export const generateToken = (payload: JwtPayload): string => {
  // Base64编码header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };
  const encodedHeader = btoa(JSON.stringify(header));
  
  // Base64编码payload，添加过期时间（7天）
  const now = Math.floor(Date.now() / 1000);
  const payloadWithExp = {
    ...payload,
    iat: now,
    exp: now + (7 * 24 * 60 * 60) // 7天后过期
  };
  const encodedPayload = btoa(JSON.stringify(payloadWithExp));
  
  // 简化签名（开发环境）
  // 注意：这不是真正的HMAC-SHA256签名，仅用于格式匹配
  const signature = btoa(`mock-signature-${payload.userId}-${payload.username}`);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};
