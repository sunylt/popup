(function(global, factory) {
  if (typeof define === 'function') {
    define(function(require) {
      var $ = require('jquery');
      return factory($);
    });
  } else {
    global.Popup = factory(global.jQuery || global.$);
  }
})(this, function($) {
    
  var doc = document,
      body = doc.body,
      $win = $(window),
      $doc = $(doc);
  
  // 储存所有创建的窗口
  var _instances = {};
  
  // 公共遮罩层
  var _mask = null;
  
  var style = doc.createElement('style');
  var defaultStyle = 
    'dialog{position:absolute;border:2px solid #000;background-color:#ffffff;z-index:8887;left:0;top:0;right:auto;display:none;padding:1em;}\r' + 
    'dialog .dialog-close{position:absolute;right:0.5em;top:0.5em;cursor:pointer;padding:0 0.3em;}\r' +
    'dialog .dialog-content{padding:1em 0;overflow:auto;}\r' +
    'dialog .dialog-button{text-decoration:none;margin-right:15px;font-size:14px;color:#333;}\r';

  if ('styleSheet' in style) {
    style.setAttribute('type', 'text/css');
    style.styleSheet.cssText = defaultStyle;
  } else {
    style.innerHTML = defaultStyle;
  }

  doc.getElementsByTagName('head')[0].appendChild(style);
    
  function Popup() {
    this._createPopup();
    this._attachEvents();
  }
  
  Popup.prototype = {
    
    _visible: false,     // 默认不显示
    
    init: function(config) {
      var that = this,
          DOM = that.DOM;
      
      DOM.main.attr('id', config.id);
      DOM.close[config.closeButton ? 'show' : 'hide']();
      that.config = config;
      that.title(config.title);
      that.content(config.content);
      that.button(config.button);
      that.size(config.width, config.height);
      return that;
    },
    
    title: function(title) {
      this.DOM.title.html(title)[title == false ? 'hide' : 'show']();
      return this;
    },
    
    content: function(html) {
      this.DOM.content.empty()[typeof html === 'object' ? 'append' : 'html'](html);
      return this;
    },
    
    button: function(config) {
      var that = this,
        footer = that.DOM.footer,
        config = config || [],
        html = '',
        prefix = Popup._CLASS_PREFIX;
        
      that.config._callbacks = [];
      footer[config.length ? 'show' : 'hide']();
      if (typeof config === 'string') {
        html = config;
      } else {
        $.each(config, function(i, val) {
          that.config._callbacks[i] = val.callback || '';
          var className = prefix + '-button' + (val.focus ? ' ' + prefix + '-button-focus' : '');
          html += '<a href="javascript:;" class="' + className + '" index="' + i + '">' + val.text + '</a>';
        });
      }
      footer.html(html);
      return that;
    },
    
    // 设置［内容区域］尺寸
    size: function(w, h) {
      this.DOM.content.css({'width': w, 'height': h});
    },
    
    setStyle: function(obj) {
      return this.DOM.main.css(obj);
    },
    
    // 左右居中处理
    horizontalCenter: function() {
      var main = this.DOM.main,
          width = main.width();  
      main.css({
        'left': '50%',
        'marginLeft': -(width * 0.5)
      });
    },
    
    // 上下居中处理
    verticalCenter: function() {
      var main = this.DOM.main,
          fixed = this.config.fixed,
          height = main.outerHeight();
      fixed && main.css('marginTop', - height * 0.5);
      main.css('top', fixed ? '50%' : ($win.height() - height) * 0.5 + $doc.scrollTop());
    },
    
    // 设定窗口位置
    position: function() {
      var that = this,
          config = that.config,
          align = config.align,
          _align = $.isFunction(align) ? align.call(that) : align;
      
      config.fixed && that.setStyle({'position': 'fixed'});
  
      // 手动设定位置
      if ($.isArray(_align) && _align.length) {
        that.setPos(_align[0], _align[_align.length == 1 ? 0 : 1]);
      } else {
        that.horizontalCenter();
        that.verticalCenter();
      }
    },
    
    setPos: function(x, y) {
      this.setStyle({'left': x, 'top': y});
      return this;
    },
    
    // 隐藏
    close: function() {
      var that = this,
          effect = that.config.effect,
          style = {};
      that._visible = false;
      if (effect) style['opacity'] = 0;
      that.DOM.main.animate(style, effect, function() {this.style.display = 'none'});
      setMask();
      return that;
    },
    
    // 显示
    open: function() {
      var that = this,
          effect = that.config.effect,
          style = {'display': 'block'};
      that._visible = true;
      if (effect) style['opacity'] = 0;
      that.DOM.main.css(style).animate(effect && {'opacity': 1}, effect);
      that.position();
      setMask();
      return that;
    },
    
    // 移除（销毁）窗口
    remove: function() {
      var that = this,
        DOM = that.DOM;
      DOM.main.off().remove();
      delete _instances[that.config.id];
      setMask();
    },
    
    // 建议只通过此方法在窗口中绑定事件以备统一卸载
    addEventListener: function(type, selector, fn) {
      this.DOM.main.on(type, selector, fn);
    },
    
    // 查找窗口内的 DOM 元素
    find: function(selector) {
      return $(selector, this.DOM.main);
    },
    
    _createPopup: function() {
      var DOM = {},
          classPrefix = Popup._CLASS_PREFIX + '-';
      
      var main = doc.createElement('dialog');
      var tags = ['close', 'title', 'content', 'footer'];
  
      $.each(tags, function(index, tag) {
        DOM[tag] = $('<div class="' + classPrefix + tag + '" />').appendTo(main);
      });
      
      DOM.close.text('×');
      DOM.main = $(main).appendTo(body);
  
      this.DOM = DOM;
    },
    
    _attachEvents: function() {
      var that = this,
          prefix = '.' + Popup._CLASS_PREFIX + '-';
      
      that.addEventListener('click', prefix + 'close', function() {
        that.close();
      });
      
      that.addEventListener('click', prefix + 'button', function() {
        var index = this.getAttribute('index');
        that._trigger(index);
      });
      
    },
    
    _trigger: function(i) {
      var fn = this.config._callbacks[i];
      return typeof fn !== 'function' || fn.call(this) !== false ? this.close() : this;
    }
  
  };
  
  // DOM HTML 类名，如需要可修改
  Popup._CLASS_PREFIX = 'dialog';
  
  // 默认设置
  Popup._DEFAULTS = {
    id: Popup._CLASS_PREFIX + '-base',
    title: '',
    content: '',
    button: [],
    align: [],
    mask: false,
    fixed: false,
    width: 'auto',
    height: 'auto',
    closeButton: true,
    effect: 0
  };
  
  // 快捷创建方式
  Popup.create = function(config) {
    var config = typeof config === 'string' ? {content: config} : config,
        config = $.extend({}, Popup._DEFAULTS, config),
        id = config.id || Popup._DEFAULTS.id,
        popup = Popup.get(id) || (_instances[id] = new Popup());
    config.id = id;
    popup.init(config);
    return popup;
  };
  
  Popup.get = function(id) {
    return _instances[id];
  };
  
  // Helper
  function setMask() {
    var n = 0;
    for(var id in _instances) {
      var ins = _instances[id];
      ins._visible && ins.config.mask && n++;
    }
    if (n > 0) {
      _mask = _mask || createMask(Popup._CLASS_PREFIX + '-mask');      
      _mask.fadeIn();
    } else {
      _mask && _mask.hide();
    }
  }
  
  function createMask(clsName) {
    var style = {'width': '100%', 'height': '100%', 'position': 'fixed', 'opacity': .3, 'background': '#000000', 'left': 0, 'top': 0, 'right': 0, 'bottom': 0, 'display': 'none'};
    
    return $('<div />').addClass(clsName).css(style).prependTo(body);
  }
  
  return Popup;
  
});