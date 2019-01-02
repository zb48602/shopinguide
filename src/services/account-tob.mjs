import {get, getURIParams, isEmpty} from '../utils/simple-request'
import promisify from '../utils/promisify'

const loginSessionKey = 'LOGIN_SESSION_FFAN_TOB'
const checkSession = promisify(wx.checkSession)

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
 * 设置登录Session
 * @param value
 */
const setLoginSession = value => wx.setStorageSync(loginSessionKey, value)

/**
 * 获取登录信息
 */
export const getUserInfo = () => new Promise((resolve, reject) => {
  const userInfo = wx.getStorageSync(loginSessionKey)
  if (!isEmpty(userInfo)) {
    return resolve(userInfo)
  } else {
    return reject({
      status: 403,
      message: '未登录'
    })
  }
})

/**
 * 登录
 * @param mobile
 * @param password
 * @return {Promise<*>|Promise<any>}
 */
export const loginByPassword = ({mobile, password}) => {
  if (!checkMobile(mobile) || !password.trim()) {
    return reject('-- The parameter of mobile, password must be required')
  } else {
    return get('https://api.ffan.com/mapp/v1/login', {
      userName: mobile,
      password,
    }).then(value => {
      setLoginSession(value)
      return value
    })
  }
}
/**
*根据merchantId获取门店列表
*/
export const getStoresByMerchantId = (merchantId) => {
  let url = __DEV__? `https://api.sit.ffan.com/v1/cdaservice/stores/${merchantId}`:`https://api.ffan.com/v1/cdaservice/stores/${merchantId}`
  return get(`https://api.ffan.com/newmerchantxapi/v1/oauth/commonReq?url=`+url)
}

/**
 * 跳转到登录页面
 */
export const navigateToLogin = () => {
  return getUserInfo().catch(e => {
    wx.navigateTo({
      url: '/pages/login/login' + getURIParams({page: '/' + getCurrentPageUrl()})
    })
  })
}

export const getCurrentPageUrl = () => {
  if (typeof getCurrentPages === 'function') {
    return getCurrentPages().pop().route
  } else {
    // Throw Error
    return ''
  }
}
