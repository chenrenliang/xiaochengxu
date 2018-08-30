'use strict'

import util from '../../utils/index'
import config from '../../utils/config'

let app = getApp()

let isDev = config.isDev

let handler = {  //来初始化页面组件
  //数据绑定 Model
  data: {
    page: 1,
    days: 3,
    pageSize: 4,
    totalSize: 0,
    hasMore: true,  //判断下拉加载更多内容
    articleList: [],  //存放文章列表数据， 与视图相关联
    defaultImg: config.defaultImg
  },


  //获取列表的数据
  onLoad(options){
    /// 刚进入列表页面，就展示loading组件，数据加载完成后隐藏
    this.setData({
      hiddenLoading: false
    })
    this.requestArticle()
  },
  //// 列表渲染完成后，隐藏 loading组件
  renderArticle(data){
    if(data && data.length){
      let newList = this.data.articleList.concat(data)
      this.setData({
        articleList: newList,
        hiddenLoading: true
      })
    }
  },

  requestArticle(){ 
    util.request({
      url: 'list', 
      mock: true,
      data: {
        tag: '微信热门',
        start: this.data.page || 1,
        days: this.data.days || 3,
        pageSize: this.data.pageSize,
        langs: config.appLang || 'en'
      }
    }).then(res => {
      // console.log(res)
      // 容错处理
      if(res && res.status === 0 && res.data && res.data.length){
        // console.log(res)
        let articleData = res.data;

        let formatData = this.formatArticleData(articleData)

      
        // console.log(formatData)
        this.renderArticle(formatData)
       
      }else if(this.data.page === 1 && res.data && res.data.length === 0){
         /*
      * 如果加载第一页就没有数据，说明数据存在异常情况
      * 处理方式：弹出异常提示信息（默认提示信息）并设置下拉加载功能不可用
      */ 
        util.alert()
        this.setData({
          hasMore: false
        })

      }else if(this.data.page !== 1 && res.data && res.data.length === 0){
         /*
      * 如果非第一页没有数据，那说明没有数据了，停用下拉加载功能即可
      */ 
        this.setData({
          hasMore: false
        })
      } else {
         /*
      * 返回异常错误
      * 展示后端返回的错误信息，并设置下拉加载功能不可用
      */ 
        util.alert('提示', res)  
        this.setData({
          hasMore: false
        })
        return null;
      }

     
  
     
    })
  },
  formatArticleData(data){
    let formatData = undefined;
    if(data && data.length){
      formatData = data.map(group => {
        group.formateDate = this.dateConvert(group.date)
        if(group && group.articles){
          let formatArticleItems = group.articles.map(item => {
            item.hasVisited = this.isVisited(item.contentId)

            return item
          }) || [];

          group.articles = formatArticleItems;
        }

        return group;
      })
    }

    return formatData;
  },

   /*
    * 每次触发，我们都会先判断是否还可以『加载更多』
    * 如果满足条件，那说明可以请求下一页列表数据，这时候把 data.page 累加 1
    * 然后调用公用的请求函数
    */
  onReachBottom(){
    if(this.data.hasMore){
      let nextPage = this.data.page + 1;
      this.setData({
        page: nextPage
      })

      this.requestArticle()
    }

  },
  /**
   * 回调函数 onShareAppMessage，
   * 它返回一个对象，对象中定义了分享的各种信息及分享成功和分享失败的回调
   */
  onShareAppMessage(){
      let title = config.defaultShareText || ''
      return {
        title,
        path: `/pages/index/index`,
        success(res){

        },
        fail(res){

        }
      }
  },
//只需要在跳转到文章详情之前，把此篇文章的 contentId 缓存起来

showDetail(e){
  let dataset = e.currentTarget.dataset
  let item = dataset && dataset.item 
  let contentId = item.contentId || 0

  //调用实现阅读标识的函数
  this.markRead(contentId)

  wx.navigateTo({
    url: `../detail/detail?contentId=${contentId}`
  })
},
  /*
    * 通过点击事件，我们可以获取到当前的节点对象
    * 同样也可以获取到节点对象上绑定的 data-X 数据
    * 获取方法： e.currentTarget.dataset
    * 此处我们先获取到 item 对象，它包含了文章 id
    * 然后带着参数 id 跳转到详情页面
    */
  //  ，增加处理标识功能的函数 markRead
markRead(contentId){
  /*
    * 如果我们只是把阅读过的文章contentId保存在globalData中，则重新打开小程序后，记录就不存在了
    * 所以，如果想要实现下次进入小程序依然能看到阅读标识，我们还需要在缓存中保存同样的数据
    * 当进入小程序时候，从缓存中查找，如果有缓存数据，就同步到 globalData 中
    */
 //先从缓存中查找 visited 字段对应的所有文章 contentId 数据
 util.getStorageData('visited', data => {
   
    let newStorage = data 
    if(data){
      if(data.indexOf(contentId) === -1){
        newStorage = `${data},${contentId}`
      }
    } else {
      newStorage = `${contentId}`
    }

    if(data !== newStorage){
      if(app.globalData){
        app.globalData.visitedArticles = newStorage
        
      }

      util.setStorageData('visited', newStorage, () => {
        this.resetArticles()
      })
    }

 })


},

resetArticles(){
  let old = this.data.articleList
  let newArticles = this.formatArticleData(old)
  this.setData({
    articleList: newArticles
  })

},

  dateConvert (dateStr) {
    if (!dateStr) {
        return '';
    }
    let today = new Date(),
        todayYear = today.getFullYear(),
        todayMonth = ('0' + (today.getMonth() + 1)).slice(-2),
        todayDay = ('0' + today.getDate()).slice(-2);
    let convertStr = '';
    let originYear = +dateStr.slice(0,4);
    let todayFormat = `${todayYear}-${todayMonth}-${todayDay}`;
    if (dateStr === todayFormat) {
        convertStr = '今日';
    } else if (originYear < todayYear) {
        let splitStr = dateStr.split('-');
        convertStr = `${splitStr[0]}年${splitStr[1]}月${splitStr[2]}日`;
    } else {
        convertStr = dateStr.slice(5).replace('-', '月') + '日'
    }
    return convertStr;
},
/*
* 判断文章是否访问过
* @param contentId
*/
isVisited (contentId) {
    let visitedArticles = app.globalData && app.globalData.visitedArticles || '';
    // console.log(visitedArticles)
    return visitedArticles.indexOf(`${contentId}`) > -1;
}

}

Page(handler)