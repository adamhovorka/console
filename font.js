/*
**  font.js - v1.0.0
**
**  A bitmapped font loader/handler
**  [a] With just a hint of syntactic sugar.
**
**  Copyleft @ 2014 Adam Hovorka - All Rights Reversed
*/

var Font = (function() {
  // {{{ Private methods

  // {{{ bind
  function bind(fn, scope) {
    return function () {
      fn.apply(scope, arguments);
    };
  } // }}}
  // {{{ load
  function load(url, cb) {
    var img = new Image();
    img.onload = function() {
      cb(toChars(toBits(getPX(this))));
    }; img.src = url;
  }; // }}}
  // {{{ getPX
  //  -= Turn an image object into a canvas data array
  function getPX(img) {
    var c = document.createElement("canvas");
        c.height = 256; c.width = 256;
    var cx = c.getContext("2d");

    cx.drawImage(img, 0, 0);
    return cx.getImageData(0,0,256,256).data;
  }; // }}}
  // {{{ toBits
  //  -= Turn a canvas data array into a smaller array of bits
  function toBits(d) {
    var o = [];
    for (var i=0;i<d.length;i+=4) o[i/4] = d[i]/d[i];
    return o;
  }; // }}}
  // {{{ toChars
  //  -= Turn an array of bits into a formatted array of character "sprites"
  function toChars(d) {
    var o = [];
    for (var i=0;i<16;i++) {
    for (var j=0;j<16;j++) {
      var c = [];
      for (var y=0;y<12;y++) { c.push([]);
      for (var x=0;x< 6;x++) {
        c[y].push(d[(i*16+y)*256+(j*16+x)]);
      }} o.push(c);
    }} return o;
  }; // }}}

  // }}}
  // {{{ Public methods
  return function(url, cb) {

    // {{{ height, width
    this.height = 12;
    this.width  =  6;
    // }}}

    // {{{ load
    this.load = function(url, cb) {
      this.url = url;
      this.loaded = false;
      load(url, bind(function(d) {
        this.loaded = true;
        this._data = d;
        if (cb && (typeof cb == "function")) cb(this);
      }, this));
    }; // }}}
    // {{{ get
    this.get = function(id) {
      if (!this.loaded) return false;
      if (typeof id == "string") { id = parseInt(id, 16);
      } else if (typeof id != "number") { throw new Error("Invalid character id"); }
      return this._data[id];
    }; // }}}

    // {{{ Initialization
    this.loaded = false;
    if (url) this.load(url, cb);
    // }}}

  }; // }}}
})();
