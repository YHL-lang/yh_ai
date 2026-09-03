import jwt from 'jsonwebtoken'
const secret = 'secret819!$';
export default [
  {
    //401
    url: '/api/repo',
    method: 'GET',
    response: req => {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return {
          code: 401,
          message: '未登录'
        }
      }
      const token = authHeader.split(' ')[1];
      console.log(token);
      try {
        let decode = jwt.verify(token, secret);
        console.log(decode);
        return {
          code: 0,
          data: decode.user
        }
      } catch (err) {
        return {
          code: 401,
          message: 'token验证失败'
        }
      }
    }
  },
  {
    url: '/api/login',
    method: 'POST',
    timeout: 2000,
    response: (req, res) => {
      const body = req.body;
      console.log(body);
      if (body.username !== 'admin' || body.password !== '123456') {
        return {
          code: -1,
          message: '用户名或密码错误'
        }
      }
      // 模拟服务器端 给用户颁发token
      // user json 放入 J
      // web stateless W
      // token 加密算法 颁发的令牌 加盐 秘密的Key
      const token = jwt.sign(
        {
          user: body.username,
          role: 'admin'
        },
        secret,
        {
          expiresIn: 86400
        }
      )
      return {
        code: 0,// 未出现错误
        user: {
          username: body.username
        },
        token: token
      }
    }
  }
]