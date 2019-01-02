import Request from '../utils/Request'

const { post, get } = new Request()
/**
 * 添加购物车
 * @param {*} memberId 
 * @param {*} productVo 
 */
export const addCart = (memberId, { skuId, num, storeId, checkType = 1 }) => {
  return post('https://api.sit.ffan.com/trade/v1/cart/addItem', {
    data: {
      memberId,
      productVo: JSON.stringify({ skuId, num, storeId, checkType })
    }
  })
}

/**
 * 获取购物车列表
 * @param {*} memberId 
 */
export const getCart = memberId => {
  return get('https://api.sit.ffan.com/shopin/v1/trade/cartItems', {
    data: {
      memberId
    }
  })
}

/**
 * 购物车下单接口
 * @param {*} param0 
 */
export const cartOrder = ({ memberId, storeId, phoneNo, productInfos }) => {
  return post('https://api.sit.ffan.com/shopin/v1/trade/createCartOrder', {
    data: {
      memberId,
      storeId,
      phoneNo,
      productInfos: JSON.stringify(productInfos)
    }
  })
}
export const check = (memberId, products) => {
  return post('https://api.sit.ffan.com/trade/v1/cart/checkItem', {
    data: {
      memberId,
      products: JSON.stringify(products)
    }
  })
}

export const pay = ({ memberId, puid, payOrderNos }) => {
  return post('https://api.sit.ffan.com/shopin/v1/trade/pay', {
    data: {
      memberId,
      puid,
      payOrderNos
    }
  })
}
