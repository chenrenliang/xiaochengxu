'use strict'

import util from '../../utils/index';
import config from '../../utils/config'

import WxParse from '../../lib/wxParse/wxParse'
import HtmlFormater from '../../lib/htmlFormater'

let app = getApp()

Page({
    data: {
        scrollTop: 0,
        detailData: {

        }
    },

    onLoad(option){
        let id = option.contentId || 0;

        this.setData({
            isFromShare: !!option.share
        })

        this.init(id)

    },

    goTop(){
        this.setData({
            scrollTop: 0
        })
    },
    next(){
        this.requestNextContentId()
            .then(data => {
                let contentId = data && data.contentId || 0;
                this.init(contentId)
            })
    },

    requestNextContentId(){
        let pubDate = this.data.detailData && this.data.detailData.lastUpdateTime || '';
        let contentId = this.data.detailData && this.data.detailData.contentId || 0;
        return util.request({
            url: 'detail',
            mock: true,
            data: {
                tag: '微信热门',
                pubDate,
                contentId,
                langs: config.appLang || 'en'
            }
        }).then(res => {
            if(res && res.status === 0 && res.data && res.data.contentId){
                util.log(res)
                return res.data 
            }else{
                util.alert('提示', '没有更多文章了')
                return null;
            }
        })
    },

    init(contentId){
        if(contentId){
            this.goTop();
            this.requestDetail(contentId)
                .then(data => {
                    // util.log(data)
                    this.configPageData(data)
                }).then(() => {
                    this.articleRevert()
                })
        }
    },

    articleRevert(){
        let htmlContent = this.data.detailData && this.data.detailData.content;

        WxParse.wxParse('article', 'html', htmlContent, this, 0)
    },

    configPageData(data){
        if(data){
            this.setData({
                detailData: data
            })
            let title = this.data.detailData.title || config.defaultBarTitle

            wx.setNavigationBarTitle({
                title: title
            })

        }

    },

    requestDetail(contentId){
        return util.request({
            url: 'detail',
            mock: true,
            data: {
                source: 1
            }
        }).then(res => {
            // return res
            let formateUpdateTime = this.formateTime(res.data.lastUpdateTime)

            res.data.formateUpdateTime = formateUpdateTime

            return res.data
        })
    },
    formateTime(timeStr = ''){
        let year = timeStr.slice(0, 4),
            month = timeStr.slice(5, 7),
            day = timeStr.slice(8, 10);

        return `${year}/${month}/${day}`    
    },
    onshareAppMessage(){
        let title = this.data.detailData && this.data.detailData.title || config.defaultShareText;
        let contentId = this.data.detailData && this.data.detailData.contentId || 0;

        return {
            title,
            path: `/pages/detail/detail?share=1&contentId=${contentId}`,

            success(res){

            },
            fail(res){

            }
        }
    },
    notSupportShare(){
        let device = app.globalData.deviceInfo;
        let sdkVersion = device && device.SDKVersion || '1.0.0'
        return  /1\.0\.0|1\.0\.1|1\.1\.0|1\.1\.1/.test(sdkVersion);
    },
    share(){
        if(this.notSupportShare()){
            wx.showModal({
                title:'提示',
                content: '您的微信版本较低,请点击右上角分享'
            })
        }
    },
    back(){
        if(this.data.isFromShare){
            wx.navigateTo({
                url: '../index/index'
            })
        }else{
            wx.navigateBack()
        }
    }

})