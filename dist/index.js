/*! build date: 2016-12-17 15:27 by Tony */
!function(a,b){"function"==typeof define?define("~/popup/1.0.0/index",["jquery"],function(a){var c=a("jquery");return b(c)}):a.Popup=b(a.jQuery||a.$)}(this,function(a){function b(){this._createPopup(),this._attachEvents()}var c=document,d=c.body,e=a(window),f=a(c),g=b.prototype;return g.init=function(c){var d=this,c="string"==typeof c?{content:c}:c,c=a.extend({},b._DEFAULTS,c);d.title(c.title),d.content(c.content),d.button(c.button),d.center()},g.title=function(a){var b=this.DOM.title;return a===!1?b.empty().hide():b.html(a).show(),this},g.content=function(a){return this.DOM.content.empty()["object"==typeof a?"append":"html"](a),this},g.button=function(){},g.center=function(){var a=this.DOM.main,b=this.fixed,c=b?0:f.scrollLeft(),d=b?0:f.scrollTop(),g=e.width(),h=e.height(),i=a.width(),j=a.height(),k=(g-i)/2+c,l=382*(h-j)/1e3+d,m=a[0].style;m.left=Math.max(parseInt(k),c)+"px",m.top=Math.max(parseInt(l),d)+"px"},g.hide=function(){this.DOM.main.hide()},g.show=function(){this.DOM.main.show()},g._createPopup=function(){var c={},e=b._CLASS_PREFIX+"-";main=a('<div class="'+e+'main" />'),a.each(["close","title","content","footer"],function(b,d){c[d]=a('<div class="'+e+d+'" />').appendTo(main)}),c.main=main.appendTo(d),c.close.text("×"),this.DOM=c},g._attachEvents=function(){var a=this,b=a.DOM;b.close.on("click",function(){a.hide()})},b._INSTANCES=[],b._DEFAULTS={id:b._CLASS_PREFIX+"-default",title:"",content:"",button:[],mask:!1,fixed:!1,width:"auto",height:"auto",closeButton:!0},b._CLASS_PREFIX="x-popup",b.create=function(a){var c=new b;return c.init(a),c},b.get=function(){},b.alert=function(){},b.confirm=function(){},b});