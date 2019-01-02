const promisify = require('../utils/promisify')
const fixDomain = require('../utils/domain').fixDomain

const login = promisify(wx.login)
const checkSession = promisify(wx.checkSession)
const request = promisify(wx.request)

const loginSessionKey = 'LOGIN_SESSION_FFAN'
const loginUserInfo = 'USER_INFO'

/**
 * 校验手机号码
 * @param mobile
 */
const checkMobile = mobile => /^1[34578]\d{9}$/.test(mobile)

/**
 * 异步返回值的封装函数
 * @param params
 * @return {Promise.<*>|Promise<any>}
 */
const reject = params => {
  if (__DEV__) {
    console.error(`-- reject, params: ${JSON.stringify(params)}`)
  }
  return Promise.reject(params)
}

/**
 * 通用 POST API 方法
 * @param url
 * @param data
 * @param options
 * @return {Promise}
 */
const post = (url = '', data = {}, options = {}) => {
  if (!url.trim()) {
    return reject('-- The url of POST is empty')
  }

  return new Promise((resolve, reject) => {
    request({
      ...{
        url: fixDomain(url, __ENV__),
        method: 'POST',
        data,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        ...options
      }
    }).then(
      res => {
        res = res['data']
        if (res['status'] === 200) {
          resolve(res['data'])
        } else {
          reject(res)
        }
      },
      err => {
        reject(err)
      }
    )
  })
}

/**
 * 设置登录Session
 * @param value
 */
const setLoginSession = value => wx.setStorageSync(loginSessionKey, value)

/**
 * 获取登录Session信息
 * @return {*|Promise<any>}
 */
const getLoginSession = () => {
  try {
    const session = wx.getStorageSync(loginSessionKey)
    if (!session) {
      return getRemoteSession()
    } else {
      return Promise.resolve(session)
    }
  } catch (e) {
    return getRemoteSession()
  }
}

/**
 * 获取服务端登录接口
 * @param code
 * @return {*|Promise<any>}
 */
const getRemoteLogin = code =>
  post('https://api.sit.ffan.com/microapp/v1/wxLogin', { jsCode: code, appId: 'wxb7cce62bced42205' })

/**
 * 获取服务端session
 * @return {*|Promise<any>}
 */
const getRemoteSession = () => {
  return login()
    .then(res => {
      return getRemoteLogin(res.code)
    })
    .then(res => {
      setLoginSession(res['wxFfanToken'])
      return res['wxFfanToken']
    })
    .catch(err => {
      console.log('login err', err)
    })
}

/**
 * 获取第三方Session
 * @return {*|Promise<any>}
 */
const getSession = () => {
  return checkSession().then(getLoginSession, err => {
    console.log('-- refresh session --', err)
    return getRemoteSession()
  })
}

exports.getSession = getSession

/**
 * 静默绑定飞凡帐号
 * @param encryptedData
 * @param iv
 * @param params
 * @return {*|Promise<any>}
 */
exports.bindAccountBySilent = ({ encryptedData, iv, ...params } = {}) =>
  getSession().then(res => {
    if (!encryptedData || !iv) {
      return reject(
        `-- The params of wx.getUserInfo() is invalid,
      \n -- which reference: 
      \n https://mp.weixin.qq.com/debug/wxadoc/dev/api/open.html`
      )
    } else {
      return post('https://api.sit.ffan.com/microapp/v1/ffanSlientLogin', {
        ...{
          encryptedData,
          iv,
          wxFfanToken: res,
          plazaId: 0,
          source: 'MINA'
        },
        ...params
      })
    }
  }).then(res => {
    wx.setStorageSync(loginUserInfo, res)
    return res
  })

/**
 * 动码绑定飞凡账户
 * @param mobile
 * @param verifyCode
 * @param params
 * @return {*|Promise<any>}
 */
exports.bindAccountByCode = ({ mobile = '', verifyCode = '', ...params } = 0) =>
  getSession().then(res => {
    if (!checkMobile(mobile) || !verifyCode.trim()) {
      return reject('-- The parameter of mobile, verifyCode must be required')
    } else {
      return post('https://api.sit.ffan.com/microapp/v1/ffanLogin', {
        ...{
          mobile,
          verifyCode,
          plazaId: 0,
          source: 'MINA',
          wxFfanToken: res
        },
        ...params
      })
    }
  })

/**
 * 获取用户信息
 * @param isForceRefresh
 * @return {*|Promise<any>}
 */
exports.getUserInfo = (isForceRefresh = 0) =>
  getSession().then(res =>
    post('https://api.sit.ffan.com/microapp/v1/userInfo', {
      wxFfanToken: res,
      forceRefresh: isForceRefresh ? 1 : 0
    })
  )

/**
 * 获取验证码
 * @param mobile
 * @return {*|Promise<any>}
 */
exports.sendVerifyCode = mobile => {
  if (!checkMobile(mobile)) {
    return reject('-- The parameter of mobile must be required')
  } else {
    return post(
      'https://api.sit.ffan.com/wechatxmt/v1/member/verifyCode?sign=xcx', { mobile }
    )
  }
}

/**
 * 注销帐号
 * @type {*|Promise<any>|Promise.<TResult>}
 */
exports.logout = () =>
  getSession().then(
    session =>
      new Promise((resolve, reject) => {
        post(`https://api.ffan.com/microapp/v1/logOut/${session}`).then(res => {
          try {
            setLoginSession('')
            if (__DEV__) {
              console.log('--logout--')
            }
            return resolve({
              message: '-- Logout: ' + JSON.stringify(res)
            })
          } catch (e) {
            return reject({
              message: `-- Clean local storage error: ${JSON.stringify(getLoginSession())}`,
              error: e
            })
          }
        }, err => reject)
      })
  )
