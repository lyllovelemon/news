// pages/movies/more-movie/more-movie.js
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data: {
    movies: {},
    navigateTitle: "",
    requestUrl:"",
    totalCount:0,//在data绑定可实现totalCount在两个不同函数间传递
    isEmpty:true,//当前绑定数据是否为空
  },
  onLoad: function (options) {
    var category = options.category;
    this.data.navigateTitle = category;
    var dataUrl="";
    switch (category) {
      case "正在热映":
        dataUrl = app.globalData.doubanBase + "/v2/movie/in_theaters" + "?start=0&count=3";
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/coming_soon" + "?start=0&count=3";
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/top250" + "?start=0&count=3";
        break;
    }
    wx.setNavigationBarTitle({
      title:this.data.navigationTitle
    })
    this.data.requestUrl = dataUrl,
    util.http(dataUrl, this.processDoubanData)
  },
  onMovieTap:function(event){
    var movieId=event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: '../movie-detail/movie-detail?id='+movieId,
    })
  },
  onReachBottom:function(event){
    console.log("加载更多");
    var nextUrl=this.data.requestUrl+"?start="+this.data.totalCount+"&count=20";
    util.http(nextUrl, this.processDoubanData);
    wx.showNavigationBarLoading();
  },
  onPullDownRefresh:function(event){
  var refreshUrl=this.data.requestUrl+"?star=0&conut=20";
  this.data.movies={},
  this.data.isEmpty=true,
  this.data.totalCount=0,
  util.http(refreshUrl,this.processDouban);
  wx.showNavigationBarLoading();
  },
  processDoubanData: function (moviesDouban) {
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6)+"...";
      }
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      movies.push(temp)
    }
    var totalMovies={}
    if(!this.data.isEmpty){
totalMovies=this.data.movies.concat(movies);//将新加载数据和已经加载的数据绑定在一起(每加载一次添加20条电影)
    }
    else{
      totalMovies=movies;
      this.data.isEmpty=false;
    }
    this.setData({
      movies: totalMovies
    });
    this.data.totalCount += 20;
    wx.hideNavigationBarLoading();
    wx.stopPullDownRefresh();
  },
  onReady: function () {
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle
    })
  }
})