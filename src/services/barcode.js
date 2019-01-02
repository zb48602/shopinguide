import Promise from 'es6-promise'
import Request from '../utils/Request'

const promisefy = require('../utils/promisify')
const { post } = new Request()

/**
 * 二维码加密
 * @param {*} barcode 
 */
export const encrypt = barcode => {
  return post(`https://api.sit.ffan.com/shopin/v1/encrypt?path=${barcode}`)
}

/**
 * 二维码解密
 * @param {*} barcode 
 */
export const decrypt = barcode => {
  return post(`https://api.sit.ffan.com/shopin/v1/dispatch/${barcode}`)
}

export const getCryptCode = barcode => {
  console.log(barcode, 1)
  if (/https:\/\/h5.ffan.com\/shopin\/(.*)/.test(barcode)) {
    const r = /https:\/\/h5.ffan.com\/shopin\/(.*)/.exec(barcode)
    if (r && r[1]) {
      return r[1]
    }
  }
  return Promise.reject('未识别该商品')
}

export const parseNavigator = barcode => {
  console.log(barcode, 2)
  if (barcode) {
    return barcode.replace(
      /ffan:\/\/(goodsdetail)\/(\d+)/,
      '/pages/$1/$1?q=$2'
    )
  }
  return Promise.reject('未识别该商品')
}

export const scanCode = option => {
  const scanCode = promisefy(wx.scanCode)
  return scanCode(option).then(res => res.result)
}
