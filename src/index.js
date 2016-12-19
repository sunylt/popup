
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
  
  function Popup() {
    this._createPopup();
    this._attachEvents();
  }
  
  var pt = Popup.prototype;
  
  // 默认显示
  pt._isVisible = true;
  
  pt.init = function(config) {
    var that = this;
    
    that.config = config;
    that.title(config.title);
    that.content(config.content);
    that.button(config.button);
    that.setStyle({'width': config.width, 'height': config.height});
    that.setId();
    that.position();
    that.DOM.close[config.closeButton ? 'show' : 'hide']();
    setMask();
    
    return that;
  };
  
  pt.title = function(title) {
    var $title = this.DOM.title;
    title === false ? $title.empty().hide() : $title.html(title).show();
    return this;
  };
  
  pt.content = function(html) {
    this.DOM.content.empty()[typeof html === "object" ? "append" : "html"](html);
    return this;
  };
  
  pt.button = function(config) {
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
  };
  
  pt.setStyle = function(obj) {
    return this.DOM.main.css(obj);
  };
  
  pt.setId = function() {
    this.DOM.main.attr('id', this.config.id);
  };
  
  // 居中
  pt.center = function() {
    var $main = this.DOM.main,
        fixed = this.config.fixed;
    
    var width = $main.width(),
        height = $main.height(),
        winHeight = $win.height();
        
    var style = {
      'left': '50%',
      'margin-left': -(width * 0.5)
    };
    
    style.top = fixed ? '50%' : (winHeight - height) * 0.5 + $doc.scrollTop();
    style.marginTop = fixed ? - (height * 0.5) : 0;
    style.position = fixed ? 'fixed' : 'absolute';
    
    this.__sProp = {'top': this.config.fixed ? 0 : $doc.scrollTop(), 'opacity': 0};
    this.__eProp = {'top': style.top, 'opacity': 1};
    $main.css(style);
  };
    
  pt.position = function() {
    var align = this.config.align,
        align = $.isFunction(align) ? align.call(this) : align;
        
    if ($.isArray(align) && align.length) {
      this.DOM.main.css({
        left: align[0],
        top: align[1]
      });
    } else {
      this.center();
    }
  };
  
  pt.setPos = function(x, y) {
    this.DOM.main.css({
      left: x,
      top: y
    });
    return this;
  },
  
  // 隐藏
  pt.hide = function() {
    var that = this,
        effect = that.config.effect,
        main = that.DOM.main;
    that._isVisible = false;
    if (effect === 'fade') {
      main.fadeOut(600);
    } else if (effect === 'fadeY') {
      main.animate(that.__sProp, 600, function() {this.style.display = 'none'});
    } else {
      main.hide();
    }
    setMask();
    return that;
  };
  
  // 显示
  pt.show = function() {
    var effect = this.config.effect,
        main = this.DOM.main;
    this._isVisible = true;
    if (effect === 'fade') {
      main.fadeIn(600);
    } else if (effect === 'fadeY') {
      main.css($.extend({}, this.__sProp, {'display': 'block'}));
      main.animate(this.__eProp, 600);
    } else {
      main.show();
    }
    setMask();
    return this;
  };
  
  // 移除
  pt.remove = function() {
    var that = this,
      DOM = that.DOM;
    DOM.main.off().remove();
    setMask();
    delete _instances[that.config.id];
  };
  
  pt._createPopup = function() {
    var DOM = {},
        classPrefix = Popup._CLASS_PREFIX + '-',
        defaultStyle = 'position: fixed;border: 1px solid #cccccc;background-color: #ffffff;z-index: 8887;left: 0;top: 0;display: none;';
        main = $('<div class="' + classPrefix + 'main" style="' + defaultStyle + '" />');
    
    $.each(['close', 'title', 'content', 'footer'], function(index, tag) {
      DOM[tag] = $('<div class="' + classPrefix + tag + '" />').appendTo(main);
    });
    
    DOM.close.text('×');
    DOM.main = main.appendTo(body);

    this.DOM = DOM;
  };
  
  pt._attachEvents = function() {
    var that = this,
        $main = that.DOM.main,
        classPrefix = '.' + Popup._CLASS_PREFIX + '-';
    
    $main.on('click', classPrefix + 'close', function() {
      that.hide();
    });
    
    $main.on('click', classPrefix + 'button', function() {
      var index = this.getAttribute('index');
      that._trigger(index);
    });
    
  };
  
  pt._trigger = function(i) {
    var fn = this.config._callbacks[i];
    return typeof fn !== 'function' || fn.call(this) !== false ? this.hide() : this;
  };
  
  // DOM HTML 类名，如需要可修改
  Popup._CLASS_PREFIX = 'x-popup';
  
  // 公共遮罩层
  Popup._MASK = null;
  
  // 默认设置
  Popup._DEFAULTS = {
    id: Popup._CLASS_PREFIX + '-default',
    title: '',
    content: '',
    button: [],
    align: [],
    mask: false,
    fixed: true,
    width: 'auto',
    height: 'auto',
    closeButton: true,
    effect: ''
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
      ins._isVisible && ins.config.mask && n++;
    }
    if (n > 0) {
      if (!Popup._MASK) {
        Popup._MASK = createMask();      
      }
      Popup._MASK.show();
    } else {
      if (Popup._MASK) {
        Popup._MASK.hide();
      }
    }
  }
  
  function createMask(clsName) {
    var style = {'width': '100%', 'height': '100%', 'position': 'fixed', 'opacity': .5, 'background-color': '#000000', 'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
      str = (clsName ? 'class="' + clsName + '"' : '');
    
    return $('<div '+ str +' />').css(style).appendTo(body);
  }
  
  return Popup;
  
});