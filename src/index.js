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
  
  var style = doc.createElement('style');
  var defaultStyle = 'dialog{position:absolute;border:2px solid #000;background-color:#ffffff;z-index:8887;left:0;top:0;right:auto;display:none;padding:1em;}dialog .dialog-close{position:absolute;right:0.5em;top:0.5em;cursor:pointer;}dialog .dialog-content{padding:1em 0;}';

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
  
  var pt = Popup.prototype;
  
  // 默认不显示
  pt._visible = false;
  
  pt.init = function(config) {
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
  };
  
  pt.title = function(title) {
    var $title = this.DOM.title;
    title === false ? $title.empty().hide() : $title.html(title).show();
    return this;
  };
  
  pt.content = function(html) {
    this.DOM.content.empty()[typeof html === 'object' ? 'append' : 'html'](html);
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
  
  // 设置［内容区域］尺寸
  pt.size = function(w, h) {
    this.DOM.content.css({'width': w, 'height': h});
  };
  
  pt.setStyle = function(obj) {
    return this.DOM.main.css(obj);
  };
  
  // 左右居中处理
  pt.horizontalCenter = function() {
    var main = this.DOM.main,
        width = main.width();  
    main.css({
      'left': '50%',
      'marginLeft': -(width * 0.5)
    });
  };
  
  // 上下居中处理
  pt.verticalCenter = function() {
    var main = this.DOM.main,
        fixed = this.config.fixed,
        height = main.outerHeight();
    fixed && main.css('marginTop', - height * 0.5);
    main.css('top', fixed ? '50%' : ($win.height() - height) * 0.5 + $doc.scrollTop());
  };
  
  // 设定窗口位置
  pt.position = function() {
    var config = this.config,
        align = config.align,
        _align = $.isFunction(align) ? align.call(this) : align;
    
    config.fixed && this.setStyle({'position': 'fixed'});

    // 手动设定位置
    if ($.isArray(_align) && _align.length) {
      this.setPos(_align[0], _align[_align.length == 1 ? 0 : 1]);
    } else {
      this.horizontalCenter();
      this.verticalCenter();
    }
  };
  
  pt.setPos = function(x, y) {
    this.setStyle({'left': x, 'top': y});
    return this;
  },
  
  // 隐藏
  pt.hide = function() {
    this._visible = false;
    this.DOM.main.hide();
    setMask();
    return this;
  };
  
  // 显示
  pt.show = function() {
    this._visible = true;
    this.DOM.main[0].style.display = 'block'; // .show() 对dialog标签不起作用
    this.position();
    setMask();
    return this;
  };
  
  // 移除（销毁）窗口
  pt.remove = function() {
    var that = this,
      DOM = that.DOM;
    DOM.main.off().remove();
    delete _instances[that.config.id];
    setMask();
  };
  
  // 建议只通过此方法在窗口中绑定事件以备统一卸载
  pt.addEventListener = function(type, selector, fn) {
    this.DOM.main.on(type, selector, fn);
  };
  
  // 查找窗口内的 DOM 元素
  pt.find = function(selector) {
    return $(selector, this.DOM.main);
  };
  
  pt._createPopup = function() {
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
  };
  
  pt._attachEvents = function() {
    var that = this,
        prefix = '.' + Popup._CLASS_PREFIX + '-';
    
    that.addEventListener('click', prefix + 'close', function() {
      that.hide();
    });
    
    that.addEventListener('click', prefix + 'button', function() {
      var index = this.getAttribute('index');
      that._trigger(index);
    });
    
  };
  
  pt._trigger = function(i) {
    var fn = this.config._callbacks[i];
    return typeof fn !== 'function' || fn.call(this) !== false ? this.hide() : this;
  };
  
  // DOM HTML 类名，如需要可修改
  Popup._CLASS_PREFIX = 'dialog';
  
  // 公共遮罩层
  Popup._MASK = null;
  
  // 默认设置
  Popup._DEFAULTS = {
    id: Popup._CLASS_PREFIX + '-base',
    title: '',
    content: '',
    button: [],
    align: [],
    mask: false,
    fixed: true, // 默认固定定位
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
      ins._visible && ins.config.mask && n++;
    }
    if (n > 0) {
      if (!Popup._MASK) {
        Popup._MASK = createMask(Popup._CLASS_PREFIX + '-mask');      
      }
      Popup._MASK.show();
    } else {
      if (Popup._MASK) {
        Popup._MASK.hide();
      }
    }
  }
  
  function createMask(clsName) {
    var style = {'width': '100%', 'height': '100%', 'position': 'fixed', 'opacity': .3, 'background': '#000000', 'left': 0, 'top': 0, 'right': 0, 'bottom': 0},
      str = (clsName ? 'class="' + clsName + '"' : '');
    
    return $('<div '+ str +' />').css(style).appendTo(body);
  }
  
  return Popup;
  
});