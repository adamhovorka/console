/*
**  terminal.js - v2.0.0-rc.1
**
**  A pixel-perfect JavaScript terminal
**  [>] Because I wanted one.
**
**  (i) Requires Dot >=2.1.1: https://github.com/adamhovorka/dot
**  (i) Requires font.js (included in repository)
**
**  Copyleft @ 2014 Adam Hovorka - All Rights Reversed
*/

Terminal = (function() {
  // {{{ Private variables

  // {{{ Colors
  var color = [
    "#000000", // 0 - Black
    "#cd0000", // 1 - Dark Red
    "#00cd00", // 2 - Dark Green
    "#cdcd00", // 3 - Dark Yellow
    "#0000ee", // 4 - Dark Blue
    "#cd00cd", // 5 - Dark Magenta
    "#00cdcd", // 6 - Dark Cyan
    "#e5e5e5", // 7 - Light Grey
    "#7f7f7f", // 8 - Dark Grey
    "#ff0000", // 9 - Red
    "#00ff00", // a - Green
    "#ffff00", // b - Yellow
    "#5c5cff", // c - Blue
    "#ff00ff", // d - Magenta
    "#00ffff", // e - Cyan
    "#ffffff", // f - White
  ]; // }}}
  // {{{ Character lookup tables
  var lookup = {
    " ":"20","!":"21",'"':"22","#":"23","$":"24","%":"25","&":"26","'":"27",
    "(":"28",")":"29","*":"2a","+":"2b",",":"2c","-":"2d",".":"2e","/":"2f",
    "0":"30","1":"31","2":"32","3":"33","4":"34","5":"35","6":"36","7":"37",
    "8":"38","9":"39",":":"3a",";":"3b","<":"3c","=":"3d",">":"3e","?":"3f",
    "@":"40","A":"41","B":"42","C":"43","D":"44","E":"45","F":"46","G":"47",
    "H":"48","I":"49","J":"4a","K":"4b","L":"4c","M":"4d","N":"4e","O":"4f",
    "P":"50","Q":"51","R":"52","S":"53","T":"54","U":"55","V":"56","W":"57",
    "X":"58","Y":"59","Z":"5a","[":"5b","\\":"5c","]":"5d","^":"5e","_":"5f",
    "`":"60","a":"61","b":"62","c":"63","d":"64","e":"65","f":"66","g":"67",
    "h":"68","i":"69","j":"6a","k":"6b","l":"6c","m":"6d","n":"6e","o":"6f",
    "p":"70","q":"71","r":"72","s":"73","t":"74","u":"75","v":"76","w":"77",
    "x":"78","y":"79","z":"7a","{":"7b","|":"7c","}":"7d","~":"7e",

    //"0":"30",
  };

  var reverseLookup = {};
  for (i in lookup) reverseLookup[lookup[i]] = i; // }}}
  // {{{ Frame configuration
  var blankCell = {c:"00", k:"07"};
  // }}}

  // }}}
  // {{{ Private methods

  // {{{ bind
  function bind(fn, scope) {
    return function () {
      fn.apply(scope, arguments);
    };
  } // }}}
  // {{{ Deep cloner 'cause JavaScript...
  function clone(obj) {
    // What follows is, apparently, the most efficient way to deep-clone an object
    return JSON.parse(JSON.stringify(obj)); } // }}}
  // {{{ Raw character drawing function
  function drawChar(y, x, c, fg, bg, dot, font) {
    var w = font.width, h = font.height;
    c = font.get(parseInt(c, 16));
    dot.setColor(color[bg])
      .rectf(x*w,y*h,x*w+w-1,y*h+h-1)
      .setColor(color[fg]);
    for (var v=0;v<c.length;v++) {
    for (var u=0;u<c[v].length;u++) {
      if (c[v][u]) dot.dot(h*y+v,w*x+u);
    }}
  }; // }}}

  // }}}
  // {{{ Public methods
  return function(ca, cb) {

    /*  TODO
    **
    **  Optimization
    **
    **  New methods:
    **   - Color scheme?
    */

    // {{{ Canvas selection:             setCA
    this.setCA = function(ca) {
      if (typeof ca == "string") {
         this._dot.setCA(document.getElementById(ca));
      } else { this._dot.setCA(ca); }
      return this;
    }; // }}}
    // {{{ Magnification:                setX
    this.setX = function(x) { this._dot.setX(x); return this; }; // }}}
    // {{{ Font Selection:               setFont
    this.setFont = function(url, cb) {
      this._rb = this.blockRender;
      this.blockRender = true;
      this._font = new Font(url, bind(function(f) {
        this.blockRender = this._rb;
        this.render();
        if (cb) cb(); }, this));

      return this;
    }; // }}}
    // {{{ Size queries:                 height, width, size
    this.height = function() { return Math.floor(this._dot.height() / (this._font.height * this._dot._x)); };
    this.width  = function() { return Math.floor(this._dot.width()  / (this._font.width  * this._dot._x)); };
    this.size = function() { return { h: this.height(), w: this.width() }; }; // }}}
    // {{{ Rendering:                    draw, render
    this.draw = function(y, x) {
      if ((this._frame[y][x].c != this._prevFrame[y][x].c) ||
          (this._frame[y][x].k != this._prevFrame[y][x].k)) {

        var c = this._frame[y][x];
        drawChar(y, x, c.c,
          parseInt(c.k.charAt(1), 16),
          parseInt(c.k.charAt(0), 16),
          this._dot, this._font);
        this._prevFrame[y][x] = clone(c);
      }
      return this;
    };

    this.render = function() {
      for (var y=0;y<24;y++) {
      for (var x=0;x<80;x++) {
        this.draw(y, x);
      } } return this;
    }; // }}}
    // {{{ Individual characters:        set, get
    this.set = function(y, x, c, k) {
      if (c) this._frame[y][x].c = c;
      if (k) this._frame[y][x].k = k;
      if (!this.blockRender) this.draw(y, x);
      return this;
    };

    this.get = function(y, x) {
      return this._frame[y][x]; };
    // }}}
    // {{{ Clipboard:                    copyLine, pasteLine
    this.copyLine = function(n) {
      var l = "";
      for (var i=0;i<80;i++) {
        var c = this.get(n, i);
        l += "%k" + c.k;
        l += "%"  + c.c;
      } this._lcb.push(l);
      return this;
    };

    this.pasteLine = function(n) {
      this.push().position(n,0)
          .write(this._lcb.pop()).pop();
      return this;
    }; // }}}
    // {{{ Cursor movement:              position, move, up, down, left, right
    this.position = function(y, x) {
      if (y == undefined) {
        return { x:this._cur.x, y:this._cur.y };
      }

      if ((x!=undefined)&&(x!=null)) this._cur.x = x;
      if (y!=null) this._cur.y = y;
      return this;
    };

    this.move = function(y, x) {
      this._cur.x += x;
      if (this._cur.x > 79) { this._cur.x -= 80; this._cur.y++; }
      if (this._cur.x <  0) { this._cur.x += 80; this._cur.y--; }

      this._cur.y += y;
      if (this._cur.y > 23) this._cur.y -= 24;
      if (this._cur.y <  0) this._cur.y += 24;

      return this;
    };

    this.up    = function(n) { this.move(-n,0); return this; };
    this.down  = function(n) { this.move(n, 0); return this; };
    this.left  = function(n) { this.move(0,-n); return this; };
    this.right = function(n) { this.move(0, n); return this; };
    // }}}
    // {{{ Cursor state stack            push, pop
    this.push  = function() { this._curs.push(clone(this._cur));  return this; };
    this.pop   = function() { this._cur = this._curs.pop(); return this; };
    // }}}
    // {{{ Cursor color management:      k, fg, bg
    this.k = function(k)  {
      if (k  != undefined) {
        this._cur.k = k;
        return this;
      } else {
        return this._cur.k;
      }
    };

    this.fg = function(fg) {
      if (fg != undefined) {
        this._cur.k = this.bg() + fg;
        return this;
      } else {
        return this._cur.k.charAt(1);
      }
    };

    this.bg = function(bg) {
      if (bg != undefined) {
        this._cur.k = bg + this.fg();
        return this;
      } else {
        return this._cur.k.charAt(0);
      }
    }; // }}}
    // {{{ Printing strings:             write, writeAt
    this.write = function(text) {
      var t = (text+"").split("");
      for (var i=0;i<t.length;i++) {
        var c = t[i];

        // Yay, char codes!
        if (c == "%") {
          if (t[i+1] == "n") {
            this._cur.y++; i++; continue;

          } else if (t[i+1] == "r") {
            this._cur.x = 0; i++; continue;

          } else if (t[i+1] == "k") {
            this._cur.k = t[i+2] + t[i+3];
            i += 3;
            continue;

          } else if (t[i+1] == "%") {
            var xy = lookup["%"];
            i += 1;

          } else {
            var xy = t[i+1] + t[i+2];
            i += 2;
          }
        } else {
          var xy = lookup[c];
        }

        this.set(this._cur.y, this._cur.x, xy, this._cur.k).right(1);
      }

      return this;
    };

    this.writeAt = function(y, x, text) {
      this.push().position(y, x).write(text).pop();
      return this;
    }; // }}}
    // {{{ Line management:              moveLine, insertLine, deleteLine, eraseLine
    this.moveLine = function(a, b) {
      this.copyLine(a).pasteLine(b);
      return this;
    };

    this.insertLine = function(n) {
      for (var i=23;i>n;i--) {
        this.moveLine(i-1, i);
      }

      return this;
    };

    this.deleteLine = function(n) {
      for (var i=n;i<23;i++) {
        this.moveLine(i+1, i);
      } this.eraseLine(23);

      return this;
    };

    this.eraseLine = function(n, k) {
      for (var i=0;i<80;i++)
        this.set(n, i, "00", k || "07");
      return this;
    }; // }}}
    // {{{ Insertion / Deletion macros:  erase, del, ins, backspace
    this.erase = function(mode) {
      if (mode == "end") {
        for (var i=this._cur.x;i<80;i++)
          this.set(this._cur.y,i,"00","07");

      } else if (mode == "start") {
        for (var i=0;i<=this._cur.x;i++)
          this.set(this._cur.y,i,"00","07");

      } else if (mode == "line") {
        this.eraseLine(this._cur.y);

      } else if (mode == "down") {
        for (var i=this._cur.y;i<24;i++)
          this.eraseLine(i);

      } else if (mode == "up") {
        for (var i=0;i<=this._cur.y;i++)
          this.eraseLine(i);

      } else if (mode == "screen") {
        this.reset(); }
      return this;
    };

    this.del = function(mode, n) {
      if (mode == "line") {
        for (var i=0;i<n;i++)
          this.deleteLine(this._cur.y);

      } else if (mode == "char") {
        for (var i=this._cur.x+n;i<80;i++) {
          var c = this.get(this._cur.y, i);
          this.set(this._cur.y, i-n, c.c, c.k);
        }
        for (var i=80-n;i<80;i++) {
          this.set(this._cur.y, i, "00", "07");
        }
      }
      return this;
    };

    this.ins = function(mode, n) {
      if (mode == "line") {
        for (var i=0;i<n;i++)
          this.insertLine(this._cur.y);

      } else if (mode == "char") {
        for (var i=79;i>=this._cur.x+n;i--) {
          var c = this.get(this._cur.y, i-n);
          this.set(this._cur.y, i, c.c, c.k);
        }
        for (var i=this._cur.x;i<this._cur.x+n;i++) {
          this.set(this._cur.y, i, "00", "07");
        }
      }
      return this;
    };

    this.backspace = function() { this.left(1).del("char", 1); return this; }; // }}}
    // {{{ Reset
    this.reset = function() {
      this._dot.clear();

      this._frame = []; var s = this.size();
      for (var y=0;y<s.h;y++) { this._frame.push([]);
      for (var x=0;x<s.w;x++) { this._frame[y].push(clone(blankCell));
      }} this._prevFrame = clone(this._frame);

      return this;
    }; // }}}

    // {{{ Initialization
    this._dot = new Dot();
    if (ca) this.setCA(ca);

    // {{{ Cursor variables
    this._cur = {x: 0, y: 0, k: "07"};
    this._curs = [];
    this._lcb = [];
    // }}}

    this.blockRender = true;
    this._font = new Font("font.png", bind(function(f) {
      this.blockRender = false;
      this.render();
      if (cb) cb(); }, this));

    this.reset();
    // }}}

  }; // }}}
})();
