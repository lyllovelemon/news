Page({
  onTap: function () {
    // wx.navigateTo({
    //   url:"../posts/posts"
    // });
    wx.switchTab({//navigateTo无法跳转带有tab选项栏的页面
      url: '../posts/posts'
    })
  }
})