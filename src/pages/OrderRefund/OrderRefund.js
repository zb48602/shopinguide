import { getAllOrderDetail, refundOrder } from '../../services/orderdetail'
import { getUserInfo, navigateToLogin } from '../../services/account-tob.mjs'
require('./OrderRefund.less')

/**
 * 退款单选框选项
 * @type {*[]}
 */
const reasonMessages = [
  { code: 101, message: '买多了，买错了' },
  { code: 102, message: '拿到货后不满意' },
  { code: 103, message: '觉得不适合' },
  { code: 104, message: '其他' },
]

const transferToRefundData = (operator, data) => {
  // console.log(operator)
  // console.log(data)
  // console.log('-----------')
  return {
    ...data.userInfo,
    tradeCode: '7023',
    appId: 'ffan',
    operator: operator.name,
    operatorId: operator.uid,
    logInfo: data.refundReason,
    logTime: new Date().getTime(),
    productList: JSON.stringify(data.selectedProductList),
  }
}

Page({
  data: {
    orderNo:'',
    submitStatus: false,
    productList: [],
    selectedProductList: [],
    refundReason: "",
    reasonMessages: reasonMessages,
  },

  /**
   * 选择退货商品响应函数
   * @param e
   */
  onProductChange(e) {
    let selectedProduct = this.data.productList.find(product =>
      product.productId === e.detail.value)
    // TODO：接口不支持多个商品退款，但格式上须传入只包含一个商品的数组
    selectedProduct.count = selectedProduct.productCount
    selectedProduct.productNo = selectedProduct.productCode
    this.updateData({
      selectedProductList: [selectedProduct]
    })
  },

  /**
   * 选择退货理由响应函数
   * @param e
   */
  onReasonChange(e) {
    this.updateData({
      refundReason: e.detail.value
    })
  },

  /**
   * 退款数据提交函数
   */
  onSubmit() {
    getUserInfo().then(operator =>
      refundOrder(transferToRefundData(operator, this.data))
    ).then(res => {
      wx.redirectTo({
        url: '/pages/orderdetail/orderdetail?orderNo=' + res.refundNo + '&refundFlag=1'
      })
    }).catch(e => {
      console.log(e)
      wx.showModal({"title":e.toString() || ''})
    })

  },

  /**
   * 更新数据
   * @param params
   */
  updateData(params) {
    this.setData(params)
    this.setData({
      submitStatus: this.data.selectedProductList.length > 0 &&
        this.data.refundReason.trim()
    })
    if (__DEV__) {
      console.log(this.data)
    }
  },

  /**
   * 加载函数
   */
  onLoad(options) {

    if (__DEV__ && !options.orderNo) {
      options = {
        orderNo: '50292730438123',
      }
    }
    this.setData({
      orderNo: options.orderNo
    })

    navigateToLogin().then(() => {
      getAllOrderDetail(options.orderNo).then(res => {
        this.updateData({
          productList: res.productList,
          userInfo: {
            orderNo: options.orderNo,
            contactMobile: res.phoneNo,
            contactor: res.memberId,
            operatorType: 'FFAN'
          }
        })

      })
    })
  },
})
