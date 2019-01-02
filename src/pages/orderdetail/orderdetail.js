import './orderdetail.less'
import * as orderDetailSer from '../../services/orderdetail'
import { pickUpByCode } from '../../services/orderlist'
import { navigateToLogin, getUserInfo } from '../../services/account-tob.mjs'

var util = require('../../utils/index.js')
Page({
  data: {
    orderDetail: {},
    signDetail: {},
    orderNo: '',
  },

  onLoad(option) {
    // console.log(option)
    // if (__DEV__) {
    //   option = {
    //     ...option,
    //     orderNo: '50292730137730',
    //     memberId: '15000000001057730',
    //     action: 'refund',
    //   }
    // }

    navigateToLogin().then(userInfo => {
      return orderDetailSer.getAllOrderDetail(option.orderNo)
    }).then(order => {
      order.orderCreateTime = util.formatTime(order.orderCreateTime)
      order.payTime = util.formatTime(order.payTime)
      order.productList.forEach((item, index) => {
        item.productInfoObj = JSON.parse(item.productInfo)
      })
      this.setData({
        orderDetail: order,
      })
    }).catch(e => {
      console.log(e)
    })


    // 获取登录状态

    // 获取订单状态
    //
    //
    // const userInfo = wx.getStorageSync('USER_INFO')
    // const {uid: memberId} = userInfo
    // let orderNo = option.orderNo
    // let refundFlag = option.refundFlag
    // //退款详情或者订单详情
    // if (refundFlag != '1') {
    //   this.setData({
    //     orderNo: orderNo
    //   })
    //   orderDetailSer.getOrderDetail(memberId, orderNo).then(res => {
    //     let orderObj = res
    //     orderObj.createTime = util.formatTime(res.createTime)
    //     orderObj.productTotalNum = 0showToast:fail
    //     orderObj.productList.forEach(function (item, index) {
    //       item.productInfoObj = JSON.parse(item.productInfo)
    //       orderObj.productTotalNum += item.productCount
    //     })
    //     this.setData({
    //       orderDetail: orderObj
    //     })
    //
    //     let status = this.data.orderDetail.orderStatus
    //     if (status == 'PAY_SUCCESS' || status == 'TRADE_SUCCESS' || status == 'TRADE_FINISHED' || status == 'TRADE_FEFUND') {
    //       orderDetailSer.getSign(orderNo)
    //         .then(res => {
    //           this.setData({
    //             signDetail: res
    //           })
    //         })
    //         .catch(err => {
    //           console.log(err)
    //           wx.showToast({title: err})
    //         })
    //     }
    //   })
    //     .catch(err => wx.showToast({title: err}))
    // } else {
    //   this.getRefundDetail(orderNo)
    // }

  },
  //
  // cancelOrder: function () {
  //   var self = this
  //   wx.showModal({
  //     content: '确定要取消订单？',
  //     cancelText: '再想想',
  //     confirmText: '确定取消',
  //     success: function (res) {
  //       if (res.confirm) {
  //         console.log('用户点击确定')
  //         const userInfo = wx.getStorageSync('USER_INFO')
  //         const {uid: memberId} = userInfo
  //         let orderNo = self.data.orderNo
  //         orderDetailSer.cancelOrder({memberId, orderNo}).then(res => {
  //
  //         })
  //       } else if (res.cancel) {
  //         console.log('用户点击取消')
  //       }
  //     }
  //   })
  // },

  // payOrder: function () {
  //   const userInfo = wx.getStorageSync('USER_INFO')
  //   const {uid: memberId, member: {puid, mobile}} = userInfo
  //   console.log('this.data.orderDetail.', this.data.orderDetail)
  //   let payOrderNos = this.data.orderDetail.paySequenceNo
  //   tradeService.pay({memberId, puid, payOrderNos})
  //     .then(pay => {
  //       const url = JSON.parse(pay.url)
  //       wx.requestPayment(url)
  //     })
  //     .catch(err => wx.showToast({title: err}))
  // },
  //
  // getRefundDetail: function (orderNo) {
  //   orderDetailSer.getRefundDetail(orderNo).then(res => {
  //     let orderObj = res
  //     orderObj.createTime = util.formatTime(res.createTime)
  //     orderObj.productList.forEach(function (item, index) {
  //       item.productInfoObj = JSON.parse(item.productInfo)
  //     })
  //     this.setData({
  //       orderDetail: orderObj
  //     })
  //   })
  //     .catch(err => console.log(err))
  // }
  pickupOrder: function() {
    wx.showModal({
      content: '确认要核销订单？',
      success: res=>{
        if (res.confirm) {
          var orderNo = this.data.orderDetail.orderNo
          Promise.all([
            getUserInfo(),
            orderDetailSer.getSign(orderNo)
          ]).then(([userInfo, barCode]) => {
            let storeId = this.data.orderDetail.storeId
            const params = {
              pickupCode: barCode.sign,
              orderNo,
              storeId,
              memberId: userInfo.uid
            }
            return pickUpByCode(params)
          }).then(code => {
            return this.getAllOrderDetail(orderNo)
          }, err => {
            wx.showModal({
              title: err.toString() || ''
            })
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },

  getAllOrderDetail: function(orderNo) {
    orderDetailSer.getAllOrderDetail(orderNo)
      .then(order => {
        order.orderCreateTime = util.formatTime(order.orderCreateTime)
        order.payTime = util.formatTime(order.payTime)
        order.productList.forEach((item, index) => {
          item.productInfoObj = JSON.parse(item.productInfo)
        })
        console.log(order)
        this.setData({
          orderDetail: order,
        })
      }).catch(e => {
        console.log(e)
      })
  },

  refundOrder: function(event) {
    let orderNo = event.currentTarget.dataset.orderno
    wx.navigateTo({
      url: '/pages/OrderRefund/OrderRefund?orderNo=' + orderNo
    })
  }

})
