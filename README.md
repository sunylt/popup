# 一个超简洁但实用的窗口工具

```
  好吧，其实跟网上其它弹窗没啥区别
```
## 用法

### 1. 基本使用方法
```js
var Popup = require('Popup');
var box = Popup.create({
  'id': 'sample',
  'title': '窗口标题', // 可以是字符串，HTML，设置 false 隐藏标题
  'content': '显示的内容', // 可以是字符串，HTML，DOM对象
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

### 2. 静态方法跟属性

* Popup.create(options)：创建一个窗口实例
* Popup.get(id)：查找相应 id 窗口实例，没有则返回 undefined
* Popup._CLASS_PREFIX：设置窗口 HTML 标签 class 前缀，默认为 x-popup
* Popup._MASK: 保存全局遮罩层，别动它吧
* Popup._DEFAULTS: 窗口默认设置，见源码 line 237 ~ 247

### 3. 对象方法
* instance.show(): 显示窗口
* instance.hide(): 隐藏窗口
* instance.remove(): 从页面中移除（销毁）窗口
* instance.title(title): 设置窗口标题
* instance.content(html): 设置窗口内容
* instance.button(config): 配置窗口按钮，也可以传入 HTML 或 文本
* instance.size(width, height): 设置窗口［内容区域］尺寸
* instance.position(): 当进行了任何变动窗口尺寸的操作后，可以通过此方法重新设置位置
* instance.setPost(x, y): 直接设置窗口的位置
* instance.setStyle(styleObj): 设置窗口外层样式
* instance.addEventListener(type, selecotr, fn): 为窗口中的元素绑定事件
* instance.find(selector): 从窗口中查找对应 HTML 元素

### 4. 应用展示
 略
