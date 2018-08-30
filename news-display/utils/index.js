'use strict'
import Promise from '../lib/promise'
import config from './config'
import * as Mock from './mock'

const DEFAULT_REQUEST_OPTIONS = {
    url: '',
    data: {},
    header: {
        "Content-Type": "application/json"
    },
    method: 'GET',
    dataType: 'json'
}

//调用
/**
 * util.request({
 * url: 'list',
 * mock: true,
 * data: {
 *  tag: '微信热门',
 *  start: 1,
 *  days: 3,
 *  pageSize: 5,
 *  langs: 'en'
 * 
 * }
 * 
 * }).then(res => {
 *   // do something
 * 
 * })
 * 
 */

 //无限列表加载的原理:
 //将所有的数据分成一页一页的展示给用户看。我们每次只请求一页数据
//当我们判断用户阅读完了这一页之后，立马请求下一页的数据，然后渲染出来给用户看，这样在用户看来，就感觉一直有内容可看。
//，处理好请求时的 加载状态

/**
 *  静默加载
    标记已读
    提供分享

wx:for 的用法
onReachBottom 的用法
wx.storage 的用法
wx.request 的用法
Promise
onShareAppMessage 的用法

 * 
 */


let util = {
    isDev: config.isDev,
    //wx.request封装
    request(opt){
        // let {url, data, header, method, dataType} = opt

        //传入值  默认值 归并
        let options = Object.assign({}, DEFAULT_REQUEST_OPTIONS, opt)

        //本地开发调试
        let {url, data, header, method, dataType, mock = false} = options

        let self = this


        return new Promise((resolve, reject) => {

            //如果请求接口调用时候，包含有参数 mock = true，会自动调用相应的 mock 数据
            if(mock){
                let res = {
                    statusCode: 200,
                    // data: mock[url]
                    data: Mock[url]
                }

                if(res && res.statusCode == 200 && res.data){
                    resolve(res.data) //直接用模拟数据
                }else{
                    self.alert('提示', res)
                    reject(res)
                }
            }else{

                wx.request({
                    url,
                    data,
                    header, 
                    method,
                    dataType,
                    success(res){
                        if(res && res.statusCode == 200 && res.data){
                            resolve(res.data)
                        }else{
                            self.alert('提示', res)
                            reject(res)
                        }
                    },
                    fail(err){
                        self.log(err)
                        self.alert('提示', err)
                        reject(err)
                    }
    
    
                })
            }


     
        })
    },


    log(){ //dev环境 打印参数内容
        this.isDev && console.log(...arguments)
    },
    //封装alert弹出窗口
    alert(title = '提示', content = config.defaultAlertMessage){
        if('object' === typeof content){
            content = this.isDev && JSON.stringify(content) || config.defaultAlertMessage
        }
        wx.showModal({
            title,
            content
        })
    },
    //封装本地缓存数据的读取功能
    getStorageData(key, cb){
        let self = this;

        //将数据存储在本地缓存中指定的key中，会覆盖掉原来的该key对应
        //内容， 这是一个异步接口

        wx.getStorage({
            key,
            success(res){
                cb && cb(res)
            },
            fail(err){
                let msg = err.errMsg || ''
                if(/getStorage:fail/.test(msg)){
                    self.setStorageData(key)
                }
            }
        })
    },
    setStorageData(key, value = '', cb){
        wx.setStorage({
            key,
            data: value,
            success(){
                cb && cb()
            }
        })
    }
}

export default util