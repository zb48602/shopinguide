require('../../components/orderlist/orderlist.less')
import * as orderListSer from '../../services/orderlist'
import * as tradeService from '../../services/trade'
import * as barcodeService from '../../services/barcode'
import * as accountService from '../../services/account-tob.mjs'

Page({
  data: {
    active: '',
    offset: 0,
    limit: 10,
    total: 0,
    orderList: [],
    orderStatus: [],
    queryOrder: 1,
    name: '',
    memberId: '',
    showBlankPage:false
  },

  onShow: function(options) {
    accountService.getUserInfo().then(function(res) {
        console.log('success')
        const userInfo = res
        const { uid: memberId, storeId, name } = userInfo
        this.setData({
          active: '1',
          name: name,
          memberId: memberId
        })
        this.getOrderList()
      }.bind(this), function() {
        wx.navigateTo({
          url: '/pages/login/login'
        })
      })
      .catch(err => {
        console.log(err)
        wx.navigateTo({
          url: '/pages/login/login'
        })
      })
  },

  onReachBottom: function() {
    if (this.data.total > this.data.limit * (this.data.offset + 1)) {
      this.setData({
        offset: this.data.offset + 1,
      });
      this.getOrderList()
    }
  },

  onPullDownRefresh() {
    this.setData({
      orderList: [],
      offset: 0,
      currentNum: 0,
      total: 0
    })
    this.getOrderList()
  },

  //切换顶部菜单
  changeType: function(event) {
    let orderStatusArr = []
    let queryOrder = 1
    let type = event.currentTarget.dataset.type
    if (type == '1') {
      queryOrder = 1
    } else if (type == '3') {
      orderStatusArr.push('\'PAY_SUCCESS\'')
      queryOrder = 1
    } else if (type == '4') {
      orderStatusArr.push('\'TRADE_SUCCESS\'')
      orderStatusArr.push('\'TRADE_FINISHED\'')
      queryOrder = 1
    } else if (type == '5') {
      queryOrder = 2
      //orderStatus.push("PAY_SUCCESS")
    }
    this.setData({
      active: event.currentTarget.dataset.type,
      offset: 0,
      orderList: [],
      orderStatus: orderStatusArr,
      queryOrder: queryOrder
    })


    this.getOrderList()
  },

  getOrderList: function() {
    accountService.getUserInfo().then(
      res => {
        console.log('success')
        const userInfo = res
        const { uid: memberId } = userInfo
        const storeId = wx.getStorageSync("storeId")

        wx.showLoading({
          title: '加载中',
        })
        orderListSer.getAllOrderList(storeId, this.data.offset, this.data.limit, this.data.orderStatus, this.data.queryOrder).then(response => {
            // this.setData({
            //   orderList: this.data.orderList.concat(response.orders),
            //   total: response.totalSize
            // })
            for (var i in response.orders) {
              response.orders[i].isFold = true; // 添加新属性
              response.orders[i].productList.forEach((item, index) => {
                item.productInfoObj = JSON.parse(item.productInfo)
              })
              response.orders[i].originProductList = response.orders[i].productList
              response.orders[i].productList = response.orders[i].productList.slice(0, 2)
            };
            var tempOrderList = this.data.orderList.concat(response.orders)
            this.setData({
              orderList: tempOrderList,
              showBlankPage:tempOrderList.length>0?false:true,
              total: response.totalSize
            });

            wx.stopPullDownRefresh();
            wx.hideLoading()
          })
          .catch(err => {
            console.log(err)
            wx.showModal({ title: err && err.toString() || '获取列表失败' })
          })
      })
  },

  getRefundList: function() {
    let memberId = ''
    try {
      var jsonValue = wx.getStorageSync('USER_INFO')
      if (jsonValue) {
        memberId = jsonValue.uid
      }
    } catch (e) {
      console.log('找不到memberId')
    }
    wx.showLoading({
      title: '加载中',
    })
    orderListSer
      .getRefundList(memberId, this.data.offset, this.data.limit)
      .then(data => {
        this.setData({
          orderList: this.data.orderList.concat(data.orderInfos),
          total: data.totalSize
        })
        //this.data.orderlist.concat(data.orderInfos)
        wx.hideLoading()

      })
      .catch(err => wx.showModal({ title: err }))
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

  },

  toScan: function() {
    Promise.all([
      accountService.getUserInfo(),
      barcodeService.scanCode()
    ]).then(([userInfo, barCode]) => {
      return this.pickupByCode(barCode, userInfo)
    }).then(code => {
        wx.navigateTo({
          url: '/pages/orderdetail/orderdetail?orderNo=' + wx.getStorageSync('orderNo')
        })
        setTimeout(() => wx.showModal({
          title: '核销成功'
        }), 1000)
      }, err =>
      setTimeout(() => wx.showModal({
        title: err && err.toString() || ''
      }), 1000)).catch(err =>
      setTimeout(() => wx.showModal({
        title: err && err.toString() || ''
      }), 1000))
  },

  pickupByCode: (barCode, userInfo) => {
    const [pickupCode, orderNo, storeId] = barCode.split(",")
    const params = {
      pickupCode,
      orderNo,
      storeId,
      memberId: userInfo.uid
    }
    wx.setStorageSync('orderNo', orderNo)

    return orderListSer.pickUpByCode(params)
  },

  toSearchOrder: function() {
    wx.navigateTo({
      url: '/pages/searchorder/searchorder'
    })
  },

  changeCount: function() {
    wx.navigateTo({
      url: '/pages/login/login'
    })
  },

  flodFn: function(event) {
    var idx = event.currentTarget.dataset.idx; // 获取当前下标
    var key = "orderList[" + idx + "].isFold";
    //var key_productList = "orderList[" + idx + "].productList"
    console.log(idx);
    var value = this.data.orderList[idx].isFold;
    //var value_productList = []
    // if(value){
    //   value_productList = this.data.orderList[idx].productList.slice(0,2)
    // }else{
    //   value_productList = this.data.orderList[idx].productList
    // }
    console.log(key, value);
    this.setData({
      [key]: !value,
      // [key_productList]:value_productList
    });
  }
})
