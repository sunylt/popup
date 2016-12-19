# 一个超简洁但实用的窗口工具

```
  跟网上其它弹窗没啥区别
```
## 用法

### 1. 基本使用方法
```js
var Popup = require('Popup');
var box = Popup.create({
  'id': 'sample',
  'title': '窗口标题', // 可以是字符串，HTML，设置 false 隐藏标题
  'content': '现实的内容', // 可以是字符串，HTML，DOM对象
  'button': [{'text': '确 定'}, {'text': '取消'}], // 按钮组
  'closeButton': flase, // false 则无关闭按钮，默认 true
  'mask': false, // 是否需要遮罩层，默认 false
  'width': 'auto', // 设置［内容区域］宽度
  'height': 'auto', // 设置 ［内容区域］高度
  'fixed': true, // 是否固定定位现实
  'align':[left, top], // 设置窗口位置，不设置则按上下左右居中处理，可以设置为函数，注意返回数组
  'effect': '', // 设置窗口显示隐藏动效，默认没有，fade为淡出，fadeY为由上下淡出
}).show(); // .create()方法创建的窗口默认隐藏，需要调用.show()方法显示出来
```
