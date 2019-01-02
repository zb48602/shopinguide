const account = require('../../services/account-tob.mjs')
require('./login.less')

Page({
  data: __DEV__ ? {
    mobile: '13910178317',
    password: 'wanda123',
    submitStatus: true,
    error: ''
  } : {
    mobile: '',
    password: '',
    submitStatus: false,
    error: ''
  },
  /**
   * 校验手机号码
   * @param params
   */
  checkMobile: params => /^1[34578]\d{9}$/.test(params.mobile),

  /**
   * 校验验证码
   * @param params
   */
  checkPassword: params => params.password.toString().trim().length >= 6,

  /**
   * 设置帐号信息
   * @param params
   */
  setAccountData(params) {
    params = {
      ...this.data,
      ...params
    }
    params = {
      ...params,
      submitStatus: this.checkMobile(params) && this.checkPassword(params),
      sendCodeStatus: this.checkMobile(params)
    }
    this.setData(params)
  },

  /**
   * 电话输入框绑定事件
   * @param e
   */
  bindPhoneInput: function(e) {
    this.setAccountData({ mobile: e.detail.value })
  },

  /**
   * 验证码输入框绑定事件
   * @param e
   */
  bindCodeInput: function(e) {
    this.setAccountData({ password: e.detail.value })
  },

  /**
   * 提交表单
   * @param e
   */
  formSubmit: function() {
    __DEV__ && console.log('-- submit, data：', this.data)
    wx.showLoading({
      title: '加载中'
    })
    this.setData({
      submitStatus: false
    })
    account.loginByPassword(this.data).then(
        res => {
          return account.getStoresByMerchantId(res.merchantId)
        }).then(resp => {
        console.log("resp", resp)
        wx.hideLoading()

        if (__DEV__) {
          wx.setStorageSync("storeId", "10556481")
        } else {
          wx.setStorageSync("storeId", resp[0].storeId)
        }
        wx.navigateTo({
          url: this.data.backURL || '/pages/orderlist/orderlist'
        })
      })
      .catch(err => {
        wx.hideLoading()
        console.log(err)
        wx.showModal({ "title": err && err.message || '' })
      })
  },

  /**
   * 重置表单
   */
  formReset: function() {
    this.setData({
      mobile: '',
      password: '',
      submitStatus: false
    })
    console.log('-- reset --')
  },

  /**
   * 登出
   */
  logout: account.logout,

  /**
   * 初始化函数
   */
  onLoad: function(options) {
    if (options.page) {
      this.setData({ backURL: options.page })
    }
  },

  deletePhone: function() {
    this.setData({
      mobile: '',
      submitStatus: false
    })
  },

  deleteCode: function() {
    this.setData({
      password: '',
      submitStatus: false
    })
  }
})
