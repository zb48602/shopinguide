import Request from '../utils/Request'

const {post, get} = new Request()
/**
 * 获取提货码
 */
export const getSign = orderNo => {
  let url = __DEV__? `https://api.sit.ffan.com/pickup/v1/pickupCode/${orderNo}`:`https://api.ffan.com/pickup/v1/pickupCode/${orderNo}`
  return get(`https://api.ffan.com/newmerchantxapi/v1/oauth/commonReq?url=`+url)
  //return get(`https://api.sit.ffan.com/pickup/v1/pickupCode/${orderNo}`)
}

/**
 * 获取所有种类订单详情页
 * @param {*} memberId
 */
export const getAllOrderDetail = (orderNo) => {
  return get(`https://api.sit.ffan.com/shopin/v1/orderDetail?orderNo=${orderNo}`)
}

/**
 * 获取订单详情
 * @param {*} memberId
 */
export const getOrderDetail = (memberId, orderNo) => {
  return get(`https://api.sit.ffan.com/trade/v1/common/orders/${orderNo}?memberId=${memberId}`)
}

/**
 * 退款订单详情
 * @param {*} memberId
 */
export const getRefundDetail = (orderNo) => {
  return get(`https://api.sit.ffan.com/trade/v1/common/refunds/${orderNo}?appId=ffan`)
}

/**
 * 发起退款
 * @param params
 */
export const refundOrder = params => post(
  'https://api.sit.ffan.com/ffan/v4/refund', {data: params})

/**
 * 取消订单
 * @param {*} param0
 */
export const cancelOrder = ({orderNo, memberId}) => {
  return post('https://api.sit.ffan.com/shtrade/v1/ffan/orders/cancel', {
    data: {
      orderNo,
      operatorType: 'FFAN',
      operatorId: memberId,
      operator: memberId,
      logInfo: '用户请求取消订单'
    }
  })
}

/**
 * 取消提货码二维码
 * @param {*} param0
 */
export const getSignQCode = (url) => {
  return get('https://api.sit.ffan.com/shopin/v1/pickup/QRCode?url=' + url)
}
