import './TouchDelete.less'

Component({
  properties: {
    buttonStyle: {
      type: 'Object',
      value: {
        width: 180,
        height: 80
      }
    }
  },
  data: {
    txtStyle: '',
    delBtnWidth: 0,
    buttonStyle: {}
  },
  ready: function() {
    this.initEleWidth()
    this.setData({ buttonStyle: this.properties.buttonStyle })
  },
  methods: {
    touchS: function(e) {
      if (e.touches.length == 1) {
        this.setData({
          //设置触摸起始点水平方向位置
          startX: e.touches[0].clientX
        })
      }
    },
    touchM: function(e) {
      if (e.touches.length == 1) {
        //手指移动时水平方向位置
        var moveX = e.touches[0].clientX
        //手指起始点位置与移动期间的差值
        var disX = this.data.startX - moveX
        var delBtnWidth = this.data.delBtnWidth
        var txtStyle = ''
        if (disX == 0 || disX < 0) {
          //如果移动距离小于等于0，文本层位置不变
          txtStyle = 'left:0px'
        } else if (disX > 0) {
          //移动距离大于0，文本层left值等于手指移动距离
          txtStyle = 'left:-' + disX + 'px'
          if (disX >= delBtnWidth) {
            //控制手指移动距离最大值为删除按钮的宽度
            txtStyle = 'left:-' + delBtnWidth + 'px'
          }
        }
        this.setData({
          txtStyle: txtStyle
        })
      }
    },

    touchE: function(e) {
      if (e.changedTouches.length == 1) {
        //手指移动结束后水平位置
        var endX = e.changedTouches[0].clientX
        //触摸开始与结束，手指移动的距离
        var disX = this.data.startX - endX
        var delBtnWidth = this.data.delBtnWidth
        //如果距离小于删除按钮的1/2，不显示删除按钮
        var txtStyle = disX > delBtnWidth / 2
          ? 'left:-' + delBtnWidth + 'px'
          : 'left:0px'
        this.setData({
          txtStyle
        })
      }
    },
    //获取元素自适应后的实际宽度
    getEleWidth: function(w) {
      var real = 0
      try {
        var res = wx.getSystemInfoSync().windowWidth
        var scale = 750 / 2 / (w / 2)
        // console.log(scale);
        real = Math.floor(res / scale)
        return real
      } catch (e) {
        return false
        // Do something when catch error
      }
    },
    initEleWidth: function() {
      const { buttonStyle: { width } } = this.properties
      const delBtnWidth = this.getEleWidth(width)
      this.setData({
        delBtnWidth: delBtnWidth
      })
    },
    //点击删除按钮事件
    delItem: function(e) {}
  }
})
