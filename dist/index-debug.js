(function(global, factory) {
    if (typeof define === "function") {
        define("~/popup/1.0.0/index-debug", [ "jquery-debug" ], function(require) {
            var $ = require("jquery-debug");
            return factory($);
        });
    } else {
        global.Popup = factory(global.jQuery || global.$);
    }
})(this, function($) {
    // <div class="x-main">
    //    <button class="x-close"></button>
    //    <div class="title">提示</div>
    //    <div class="content">窗体内容</div>
    //    <div class="footer">按钮区域</div>
    // </div>
    var doc = document, body = doc.body, $win = $(window), $doc = $(doc);
    function createEle(e) {
        return doc.createElement(e);
    }
    function Popup() {
        this._createPopup();
        this._attachEvents();
    }
    var pt = Popup.prototype;
    pt.init = function(config) {
        var that = this, config = typeof config === "string" ? {
            content: config
        } : config, config = $.extend({}, Popup._DEFAULTS, config);
        that.title(config.title);
        that.content(config.content);
        that.button(config.button);
        that.center();
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
    pt.button = function() {};
    // 居中
    pt.center = function() {
        var popup = this.DOM.main;
        var fixed = this.fixed;
        var dl = fixed ? 0 : $doc.scrollLeft();
        var dt = fixed ? 0 : $doc.scrollTop();
        var ww = $win.width();
        var wh = $win.height();
        var ow = popup.width();
        var oh = popup.height();
        var left = (ww - ow) / 2 + dl;
        var top = (wh - oh) * 382 / 1e3 + dt;
        // 黄金比例
        var style = popup[0].style;
        style.left = Math.max(parseInt(left), dl) + "px";
        style.top = Math.max(parseInt(top), dt) + "px";
    };
    // 隐藏
    pt.hide = function() {
        this.DOM.main.hide();
    };
    pt.show = function() {
        this.DOM.main.show();
    };
    pt._createPopup = function() {
        var DOM = {}, classPrefix = Popup._CLASS_PREFIX + "-";
        main = $('<div class="' + classPrefix + 'main" />');
        $.each([ "close", "title", "content", "footer" ], function(index, tag) {
            DOM[tag] = $('<div class="' + classPrefix + tag + '" />').appendTo(main);
        });
        DOM.main = main.appendTo(body);
        DOM.close.text("×");
        this.DOM = DOM;
    };
    pt._attachEvents = function() {
        var that = this, dom = that.DOM;
        dom.close.on("click", function() {
            that.hide();
        });
    };
    // 储存所有创建的窗口
    Popup._INSTANCES = [];
    // 默认设置
    Popup._DEFAULTS = {
        id: Popup._CLASS_PREFIX + "-default",
        title: "",
        content: "",
        button: [],
        mask: false,
        fixed: false,
        width: "auto",
        height: "auto",
        closeButton: true
    };
    // DOM HTML 类名，如需要可修改
    Popup._CLASS_PREFIX = "x-popup";
    // 快捷创建方式
    Popup.create = function(config) {
        var popup = new Popup();
        popup.init(config);
        return popup;
    };
    Popup.get = function(id) {};
    Popup.alert = function(config) {};
    Popup.confirm = function(config) {};
    return Popup;
});
