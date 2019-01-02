import Request from '../utils/Request'

const { post, get } = new Request()

/**
 * 获取订单列表
 * @param {*} memberId 
 */
export const getOrderList = (memberId, offset, limit, orderStatus) => {
  return get('https://api.sit.ffan.com/ffan/v6/orders?limit=' + limit + '&memberId=' + memberId + '&offset=' + offset + '&tradeSrc=2030&orderType=all&orderStatus=[' + orderStatus + ']')
}

/**
 * 获取订单列表
 * @param {*} memberId 
 */
export const getRefundList = (memberId, offset, limit) => {
  return get('https://api.sit.ffan.com/shtrade/v1/common/refunds?limit=' + limit + '&memberId=' + memberId + '&offset=' + offset + '&appId=ffan')
}

/**
 * 获取订单列表(含订单和退单)
 * @param {*} memberId 
 */
export const getAllOrderList = (storeId, offset, limit, orderStatus, queryOrder) => {
  return get("https://api.sit.ffan.com/shopin/v1/bOrders?storeId=" + storeId + "&limit=" + limit + "&offset=" + offset + "&tradeSrc=2030&orderType=all&orderStatus=" + orderStatus + "&queryOrder=" + queryOrder)
}

/**
 * 核销接口
 * @param {*} memberId 
 */
export const pickUpByCode = ({ pickupCode, orderNo, memberId, storeId }) => {
  let url = __DEV__ ? "https://api.sit.ffan.com/pickup/v1/use/" + pickupCode + "/" + memberId : "https://api.ffan.com/pickup/v1/use/" + pickupCode + "/" + memberId
  return post("https://api.ffan.com/shopin/v1/oauth/commonPost?url=" + url + "&json=" + JSON.stringify({
    signNo: pickupCode,
    operator: memberId,
    orderNo: orderNo,
    storeId: storeId
    //storeId:'10556481',
  }))
}
