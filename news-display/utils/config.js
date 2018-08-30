"use strict"

const  env = 'dev'

const defaultAlertMessage = '好像哪里出了小问题~请再试一次~'

const defaultShareText = {
    en: '索拉里斯的默认分享文案'
}

const defaultBarTitle = {
    en: '索拉里斯默认Bar Title'
}

const defaultImg = {
    articleImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535620256651&di=0d6739dc6e0c44e422c3197ecd962e43&imgtype=0&src=http%3A%2F%2Fpic.qiantucdn.com%2F58pic%2F19%2F19%2F33%2F56842232435e7_1024.jpg',
    coverImg: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1535620256651&di=0d6739dc6e0c44e422c3197ecd962e43&imgtype=0&src=http%3A%2F%2Fpic.qiantucdn.com%2F58pic%2F19%2F19%2F33%2F56842232435e7_1024.jpg'
}

let core = {
    env,
    defaultBarTitle: defaultBarTitle['en'],
    defaultImg,
    defaultAlertMessage,
    defaultShareText: defaultShareText['en'],
    isDev: env === 'dev',
    idProduction: env === 'production'
}

export default core;