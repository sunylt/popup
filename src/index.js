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
      
  var IS_IE6 = navigator.userAgent.indexOf('MSIE 6.0') > 0;
  
  // 储存所有创建的窗口
  var _instances = {};
  
  // 公共遮罩层
  var _mask = null;
  
  var style = doc.createElement('style');
  var defaultStyle = 
    'dialog{position:absolute;_position:absolute !important;border:2px solid #000;background-color:#ffffff;z-index:8887;left:0;top:0;right:auto;display:none;padding:1em;}\r' + 
    '.dialog-close{position:absolute;right:0.5em;top:0.5em;cursor:pointer;padding:0 0.3em;font-size:1.3em;}\r' +
    '.dialog-content{padding:1em 0;overflow:auto;}\r' +
    '.dialog-button{text-decoration:none;margin-right:15px;color:#0167ff;}\r' +
    '.dialog-mask{width:100%;height:100%;position:fixed;_position:absolute !important;opacity:.3;_filter:alpha(opacity=30) !important;background:#000000;left:0;top:0;right:0;bottom:0;display:none}';

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
    
    // 居中处理
    center: function() {
      var that = this,
          main = that.DOM.main,
          fixed = that.config.fixed,
          width = main.outerWidth(),
          height = main.outerHeight();
      
      var style = {'left': '50%', 'marginLeft': - width * 0.5};
      style['marginTop'] = fixed ? - height * 0.5 : '';
      style['top'] = fixed ? '50%' : ($win.height() - height) * 0.5 + $doc.scrollTop();
      
      main.css(style);
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
        that.center();
      }
      return that;
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
      that.hasModal = false;
      setMask();
      return that;
    },
    
    // 显示
    show: function(ignoreMask) {
      var that = this,
          effect = that.config.effect,
          style = {'display': 'block'};
      if (that._visible) return that;
      that._visible = true;
      if (effect) style['opacity'] = 0;
      that.DOM.main.css(style).animate(effect && {'opacity': 1}, effect);
      that.position();
      !ignoreMask && setMask();
      return that;
    },
    
    showModal: function() {
      this.hasModal = true;
      setMask();
      return this.show(true); // 为避免 mask 设置混乱，调用showModal 的时候忽略 config 的 mask 设置
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
    addEventListener: function(types, selector, fn) {
      this.DOM.main.on(types, selector, fn);
      return this;
    },
    
    removeEventListener: function(types, selector, fn) {
      this.DOM.main.off(types, selector, fn);
      return this;
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
  
  Popup.confirm = function(title, msg, ok_fn, config) {
    var options = {
      'id': 'confirm-box',
      'title': title,
      'content': msg,
      'closeButton': false,
      'fixed': true,
      'mask': true,
      'button': [
        {'text': '确 定', 'focus': true, 'callback': ok_fn},
        {'text': '取 消'}
      ]
    };
    options = $.extend(options, config || {});
    return Popup.create(options).show();
  };
  
  // Helper
  function setMask() {
    var n = 0;
    for(var id in _instances) {
      var ins = _instances[id];
      if (ins._visible && ins.config.mask || ins.hasModal) {
        n++
      }
    }
    if (n > 0) {
      var style = IS_IE6 ? {'height': Math.max($win.height(), $doc.height()), 'display': 'block'} : '';
      _mask = _mask || createMask(Popup._CLASS_PREFIX + '-mask');
      _mask[IS_IE6 ? 'css' : 'fadeIn'](style);
    } else {
      _mask && _mask[IS_IE6 ? 'hide' : 'fadeOut']();
    }
  }
  
  function createMask(clsName) {
    return $('<div />').addClass(clsName).prependTo(body);
  }
  
  return Popup;
  
});