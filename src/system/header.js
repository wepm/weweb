import Bus from './bus'
import actionSheet from 'actionsheet'
import {currentView} from './viewManage'
import storage from './sdk/storage'
import toast from './component/toast'
import * as util from './util'

let win = window.__wxConfig__['window']
let header = {
  dom: null,
  init:function(){
    this.state = {
      backgroundColor: win.navigationBarBackgroundColor,
      color: win.navigationBarTextStyle,
      title: win.navigationBarTitleText,
      loading: false,
      backText: '返回',
      back: false,
      sendText: false
    };
    if(!this.dom){
      this.dom = {
        head: this.$('.jshook-ws-head'),
        headBack: this.$('.jshook-ws-head-back'),
        headBackText: this.$('.jshook-ws-head-back-text'),
        headHome: this.$('.jshook-ws-head-home'),
        headTitle: this.$('.jshook-ws-head-title'),
        headOption: this.$('.jshook-ws-head-option')
      };
      this.dom.headBackSpan = this.dom.headBack.querySelector('span');
      this.dom.headTitleSpan = this.dom.headTitle.querySelector('span');
      this.dom.headBackI = this.dom.headBack.querySelector('i');
      this.dom.headHomeI = this.dom.headHome.querySelector('i');
      this.dom.headTitleI = this.dom.headTitle.querySelector('i');
      this.dom.headBack.onclick = this.onBack.bind(null);
      this.dom.headHome.onclick = this.onHome.bind(null);
      this.dom.headOption.onclick = this.onOptions.bind(null);
    }
    this.dom.head.style.display = 'block';
    Bus.on('route', this.reset.bind(this));
    this.setState();
  },
  $:function(name){
    return document.querySelector(name);
  },
  reset:function(){
    let d = {
      backgroundColor: win.navigationBarBackgroundColor,
      color: win.navigationBarTextStyle,
      title: win.navigationBarTitleText,
      loading: false,
      back: false
    }
    let curr = currentView()

    let winConfig = win.pages[curr.path] || {}
    let tabBar = window.__wxConfig__.tabBar

    let top = tabBar && tabBar.position == 'top'
    let hide = top && util.isTabbar(curr.url)
    if (curr.isMap) {
      this.setState({
        hide: false,
        backgroundColor: 'rgb(0, 0, 0)',
        color: '#ffffff',
        title: '位置',
        loading: false,
        backText: '取消',
        sendText: true
      })
    } else {
      this.setState({
        hide,
        backgroundColor: winConfig.navigationBarBackgroundColor || d.backgroundColor,
        color: winConfig.navigationBarTextStyle || d.color,
        title: winConfig.navigationBarTitleText || d.title,
        loading: false,
        backText: '返回',
        sendText: false,
        back: curr.pid != null
      })
    }
  },
  onBack:function(e) {
    e.preventDefault()
    Bus.emit('back')
  },
  onSend:function(e) {
    // TODO send location
    e.stopPropagation()
    Bus.emit('location', currentView().location)
    this.onBack(e)
  },
  onOptions:function(e) {
    e.preventDefault()
    actionSheet({
      refresh: {
        text: '回主页',
        callback: function () {
          window.sessionStorage.removeItem('routes')
          util.navigateHome()
        }
      },
      clear: {
        text: '清除数据缓存',
        callback: function () {
          if (window.localStorage != null) {
            storage.clear()
            toast('数据缓存已清除', {type: 'success'})
          }
        }
      },
      cancel: {
        text: '取消'
      }
    }).then(() => {
      header.sheetShown = true
    })
  },
  setTitle:function(title) {
    this.dom.headTitleSpan.innerHTML = title;
  },
  showLoading:function() {
    this.dom.headTitleI.style.display = 'inline-block';
  },
  hideLoading:function() {
    this.dom.headTitleI.style.display = 'none';
  },
  onHome:function() {
    util.navigateHome()
  },
  setState:function(data){
    if(data)Object.assign(this.state,data);
    let state = this.state;
    this.dom.head.style.backgroundColor = state.backgroundColor;
    this.dom.head.style.display = state.hide ? 'none' : 'flex';
    this.dom.headBack.style.display = state.back ? 'flex' : 'none';
    this.dom.headBackSpan.style.color = state.color;
    this.dom.headTitle.style.color = state.color;
    this.dom.headBackSpan.innerHTML = state.backText;
    this.dom.headTitleSpan.innerHTML = state.title;
    this.dom.headBackI.style.display = !state.sendText? 'inline-block' : 'none';
    this.dom.headTitleI.style.display = state.loading? 'inline-block' : 'none';
    this.dom.headBackI.style.borderLeft = `1px solid ${state.color}`;
    this.dom.headBackI.style.borderBottom = `1px solid ${state.color}`;
    this.dom.headHome.style.display = state.back ? 'none' : 'flex';
    this.dom.headHomeI.className = state.color == 'white'?'head-home-icon white':'head-home-icon';
    this.dom.headHomeI.style.display = state.back ? 'none' : 'flex';
    if(state.sendText){
      this.dom.headOption.innerHTML = '<div>发送</div>';
      this.dom.headOption.querySelector('div').onclick = this.onSend.bind(this);
    }else{
      this.dom.headOption.innerHTML = '<i class="head-option-icon'+(state.color == 'white'?' white':'')+'"></i>';
    }

  }
}
export default header;
