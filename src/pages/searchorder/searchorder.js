require('./searchorder.less')
import * as orderDetailSer from '../../services/orderdetail'
import * as accountService from '../../services/account-tob.mjs'

Page({
  data: {
    searchValue: '',
    orderDetail: {},
    isSearchPage: true
  },

  onLoad: function(options) {

  },

  searchOrder: function() {
    wx.showLoading({
      title: '加载中',
    })

    orderDetailSer.getAllOrderDetail(this.data.searchValue).then(response => {
        wx.hideLoading()
        var orderObj = response
        if (orderObj.productList) {
          orderObj.productList.forEach(function(item, index) {
            item.productInfoObj = JSON.parse(item.productInfo)
          })
        }
        this.setData({
          orderDetail: orderObj
        })
      })
      .catch(err => {
        console.log(err)
      })
  },
  bindConfirm:function (e) {
    this.searchOrder()
  },
  bindKeyInput: function(e) {
    this.setData({
      searchValue: e.detail.value
    })
  },

  jumpToDetail: function(event) {
    //TODO 退款处理
    if (event.currentTarget.dataset.isorder == 0) {
      var orderNo = event.currentTarget.dataset.orderno
      var refundFlag = 1
      wx.navigateTo({
        url: '/pages/orderdetail/orderdetail?orderNo=' + orderNo + '&refundFlag=' + refundFlag
      })
    } else {
      var orderNo = event.currentTarget.dataset.orderno
      wx.navigateTo({
        url: '/pages/orderdetail/orderdetail?orderNo=' + orderNo
      })
    }

  }
})
