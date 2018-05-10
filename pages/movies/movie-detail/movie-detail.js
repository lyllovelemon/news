import {Movie } from "class/Movie.js"//引入Movie.js文件
var app=getApp();
Page({
  data: {
    movies:{},
  },
  onLoad: function (options) {
  var movieId=options.id;
  var url = app.globalData.doubanBase + "/v2/movie/subject/" + movieId;
  var movie = new Movie(url);
  //(1.同步获取movieData  var movieData=movie.getMovieData();)
  // var that =this;
  // movie.getMovieData(function(movie){
  //   that.setData({
  //     movie:movie
  //   })
  // })2.异步获取movieData
  //c#、java、python lambda
  movie.getMovieData((movie)=>{
    this.setData({
      movie: movie
    })
  })
  util.http(url,this.processDoubanData);
  },
  processDoubanData:function(data){
    if(!data){
      return;
    }
    var director={
      avatar:"",
      name:"",
      id:""
    }
    if(data.directors[0]!=null){
      if(data.directors[0].avatar!=null){
        director.avatar=data.directors[0].avatars.large
      }
      director.name = data.directors[0].name;
        director.id = data.directors[0].id;
    }
    var movie={
      movieImg:data.images?data.images.large:"",
      country:data.countries[0],
      title:data.title,
      originalTitle:data.original_title,
      WishCount:data.wish_count,
      commentCount:data.comments_count,
      year:data.year,
      generes:data.genres.join("、"),
      stars: util.convertToStarsArray(data.rating.stars),
      score:data.rating.average,
      director:director,
      casts: util.convertToCastString(data.casts),
      castsInfo:util.convertToCastInfos(data.casts),
      summary:data.summary
    }
    this.setData({
      movie: movie
    })
  },
  viewMoviePostImg:function(e){
    var src=e.currentTarget.dataset.src;
    wx.previewImage({
      current: src,//当前显示图片的http链接
      urls: [src]//需要预览的图片的http链接列表
    })
  }
})