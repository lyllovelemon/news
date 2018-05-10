var postsData = require("../../../data/posts-data.js");
var app = getApp();
Page({
  data: {
    isPlayingMusic: false
  },
  onLoad: function (option) {
    var globalData = app.globalData;
    var postId = option.id;
    this.data.currentPostId = postId;
    var postCollected="";
    var postData = postsData.postList[postId];
    //如果在onLoad方法中，不是异步的去执行一个数据绑定
    //则不需要使用this.setData方法
    //只需要对this.setData赋值即可实现数据绑定
    this.setData({
      postData: postData
    })
    var postsCollected = wx.getStorageSync("posts_Collected");
    if (postsCollected) {
      var postcollected = postsCollected[postId];
      this.setData({
        collected: postCollected
      })
    }
    else {
      var postsCollected = {};
      postsCollected[postId] = false;
      wx.setStorageSync("posts_Collected", postsCollected);
    }
    if (app.globalData.g_isPlayingMusic && app.globalData.g_currentMusicPostId === postId) {
      this.setData({
        isPlayingMusic: true
      })
    }
    this.setMusicMonitor();
  },
  setMusicMonitor: function () {
    var that = this;
    wx.onBackgroundAudioPlay(function (event) {
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      if (currentPage.data.currentPostId === that.data.currentPostId) {
        that.setData({
          isPlayingMusic: true
        });
      }

      app.globalData.g_isPlayingMusic = true;
      // app.globalData.g_currentMusicPostId = that.data.currentPostId;
    })
    wx.onBackgroundAudioPause(function () {
      var pages = getCurrentPages();
      var currentPage = pages[pages.length - 1];
      if (currentPage.data.currentPostId === that.data.currentPostId) {
        if (app.globalData.g_currentMusicPostId == that.data.currentPostId) {
          that.setData({
            isPlayingMusic: false
          })
        }
      }

      app.globalData.g_isPlayingMusic = false;
      // app.globalData.g_currentMusicPostId = null;
    });
    wx.onBackgroundAudioStop(function () {
      that.setData({
            isPlayingMusic: false
          })
     app.globalData.g_isPlayingMusic = false;
     app.globalData.g_currentMusicPostId = null;
    })
  },
  onCollectionTap: function (event) {
    this.getPostsCollectedSyc();
    // this.getPostsCollectedAsy();
  },
  getPostsCollectedAsy: function () {
    var that = this;
    wx.getStorage({
      key: "posts_collected",
      success: function (res) {
        var postsCollected = res.data;
        var postCollected = postsCollected[that.data.currentPostId];
        postCollected = !postCollected;
        postsCollected[that.data.currentPostId] = postCollected;
        //更新文章的缓存值

        that.showToast(postsCollected, postCollected);
      }
    })
  },
  getPostsCollectedSyc: function () {
    var postsCollected = wx.getStorageSync("posts_Collected");
    var postCollected = postsCollected[this.data.currentPostId];
    postCollected = !postCollected;
    postsCollected[this.data.currentPostId] = postCollected;
    //更新文章的缓存值

    this.showToast(postsCollected, postCollected);
  },
  showToast: function (postsCollected, postCollected) {
    // 更新文章是否的缓存值
    wx.setStorageSync('posts_collected', postsCollected);
    // 更新数据绑定变量，从而实现切换图片
    this.setData({
      collected: postCollected
    })
    wx.showToast({
      title: postCollected ? '收藏成功' : "取消收藏",
      duration: 1000
    })
  },
  showModal: function (postsCollected, postCollected) {
    var that = this;
    wx.showModal({
      title: '收藏',
      content: postCollected ? '收藏该文章?' : "取消收藏该文章",
      showCancel: "true",
      confirmText: "确认",
      confirmColor: "blue",
      cancelText: "取消",
      cancelColor: "#333",
      success: function (res) {
        if (res.confirm) {
          wx.setStorageSync("posts_Collected", postsCollected);

          that.setData({
            collected: postCollected
          })
        }
      }
    })
  }

  , onShareTap: function (event) {
    var itemList = [
      "分享给微信好友",
      "分享到朋友圈",
      "分享到QQ",
      "分享到微博"
    ];
    wx.showActionSheet({
      itemList: itemList,
      itemColor: "#405f80",
      success: function (res) {
        //res.cancel用户是不是点击了取消按钮
        //res.tapIndex 数组元素的序号，从0开始
        wx.showModal({
          title: '用户分享到了' + itemList[res.tapIndex],
          content: "用户是否取消?" + res.cancel + '现在无法实现分享',
        })
      }
    })
  },
  onMusicTap: function (event) {
    var currentPostId = this.data.currentPostId;
    var postData = postsData.postList[currentPostId];
    var isPlayingMusic = this.data.isPlayingMusic;
    if (isPlayingMusic) {
      wx.pauseBackgroundAudio();
      this.setData({
        isPlayingMusic: false
      })
      app.globalData.g_isPlayingMusic = false;
    }
    else {
      wx.playBackgroundAudio({
        dataUrl: postData.music.url,
        title: postData.music.title,
        coverImgUrl: postData.music.coverImg
      })
      this.setData({
        isPlayingMusic: true
      })
      app.globalData.g_currentMusicPostId = this.data.currentPostId;
      app.globalData.g_isPlayingMusic = true;
    }


  }
})