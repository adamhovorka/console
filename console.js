cnsl = (function() {

  function $(x) { return document.getElementById(x); }

  var t = $("console");

  function setChar(c, xy) {
    xy = xy.split("");
    var x = parseInt(xy[1], 16);
    var y = parseInt(xy[0], 16);
    var q = "-" + (16*x) + "px -" + (16*y) + "px";
    c.style.backgroundPosition = q;
  }

  function newRow(i, content) {
    //if (i == undefined) i = -1;

    var id = "r" + i;
    var r = "<div class='row' id='"+id+"'>";

    for (var j=0;j<80;j++)
      r += "<div class='cell' "+
        "id='"+id+"c"+j+"'></div>";

    t.innerHTML += r;

    for (var j=0;j<80;j++)
      setChar($(id+"c"+j), "20");
  }

  for (var j=0;j<24;j++) newRow(j);

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

    //"0":"70",
  };

  // 'Cause JavaScript...
  function cloneobj(obj) {
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
    }
    return copy;
  }

  var cur = {x: 0, y: 0, k: "07"};
  var curs = [];
  var lcb = [];
  var evt = {};

  return {
    reset: function() {
      $("console").innerHTML = "";
      for (var j=0;j<24;j++) newRow(j);
    },

    set: function(y, x, c, k) {
      var p = $("r"+y+"c"+x);
      if (c) setChar(p, c);
      if (k) p.className = "cell k" + k;

      return this;
    },

    getChar: function(y, x) {
      var p = $("r"+y+"c"+x);
      var c = p.style["background-position"].split("px");
      var cx = (-parseInt(c[0])/16).toString(16);
      var cy = (-parseInt(c[1].substr(1))/16).toString(16);
      return cy+cx;
    },

    getK: function(y, x) {
      var p = $("r"+y+"c"+x);
      return p.className.split(" ")[1].substr(1) || "07";
    },

    copyLine: function(n) {
      var l = "";
      for (var i=0;i<80;i++) {
        l += "%k" + this.getK(n, i);
        l += "%" + this.getChar(n, i);
      } lcb.push(l);
      return this;
    },

    pasteLine: function(n) {
      this.push().position(n,0).write(lcb.pop()).pop();
      return this;
    },

    position: function(y, x) {
      if (typeof x == "function") {
        x(cur.x, cur.y);
      } else {
        cur.x = x;
        cur.y = y;
      }

      return this;
    },

    move: function(y, x) {
      cur.x += x; if (cur.x > 79) { cur.x -= 80; cur.y++; }
      cur.y += y; if (cur.y > 23) cur.y -= 24;

      return this;
    },

    up:    function(n) { this.move(-n,0); return this; },
    down:  function(n) { this.move(n, 0); return this; },
    left:  function(n) { this.move(0,-n); return this; },
    right: function(n) { this.move(0, n); return this; },

    push: function() { curs.push(cloneobj(cur)); return this; },
    pop:  function() { cur = curs.pop(); return this; },

    k:  function(k)  {
      if (k  != undefined) {
        cur.k = k;
        return this;
      } else {
        return cur.k;
      }
    },

    fg: function(fg) {
      if (fg != undefined) {
        cur.k = this.bg() + fg;
        return this;
      } else {
        return cur.k.charAt(1);
      }
    },

    bg: function(bg) {
      if (bg != undefined) {
        cur.k = bg + this.fg();
        return this;
      } else {
        return cur.k.charAt(0);
      }
    },

    write: function(text) {
      var t = text.split("");
      for (var i=0;i<t.length;i++) {
        var c = t[i];

        // Yay, char codes!
        if (c == "%") {
          if (t[i+1] == "n") { cur.y++; continue;
          } else if (t[i+1] == "r") { cur.x = 0; continue;
          } else if (t[i+1] == "k") {
            cur.k = t[i+2] + t[i+3];
            i += 3;
            continue;
          } else {
            var xy = t[i+1] + t[i+2];
            i += 2;
          }
        } else {
          var xy = lookup[c];
        }

        this.set(cur.y, cur.x, xy, cur.k).right(1);
      }

      return this;
    },

    moveLine: function(a, b) {
      this.copyLine(a).pasteLine(b);
      return this;
    },

    insertLine: function(n) {
      for (var i=23;i>n;i--) {
        this.moveLine(i-1, i);
      }

      return this;
    },

    deleteLine: function(n) {
      for (var i=n;i<23;i++) {
        this.moveLine(i+1, i);
      } this.eraseLine(23);

      return this;
    },

    eraseLine: function(n, k) {
      for (var i=0;i<80;i++)
        this.set(n, i, "00", k || "07");
      return this;
    },

    erase: function(mode) {
      if (mode == "end") {
        for (var i=cur.x;i<80;i++) this.set(cur.y,i,"00","07");
      } else if (mode == "start") {
        for (var i=0;i<=cur.x;i++) this.set(cur.y,i,"00","07");
      } else if (mode == "line") { this.eraseLine(cur.y);
      } else if (mode == "down") {
        for (var i=cur.y;i<24;i++) this.eraseLine(i);
      } else if (mode == "up") {
        for (var i=0;i<=cur.y;i++) this.eraseLine(i);
      } else if (mode == "screen") { this.reset(); }
    },

    del: function(mode, n) {
      if (mode == "line") {
        for (var i=0;i<n;i++) this.deleteLine(cur.y);
      } else if (mode == "char") {
        for (var i=cur.x+n;i<80;i++) {
          this.set(cur.y, i-n,
            this.getChar(cur.y, i),
            this.getK(cur.y, i));
        }
        for (var i=80-n;i<80;i++) {
          this.set(cur.y, i, "00", "07");
        }
      }
      return this;
    },

    ins: function(mode, n) {
      if (mode == "line") {
        for (var i=0;i<n;i++) this.insertLine(cur.y);
      } else if (mode == "char") {
        for (var i=79;i>=cur.x+n;i--) {
          this.set(cur.y, i,
            this.getChar(cur.y, i-n),
            this.getK(cur.y, i-n));
        }
        for (var i=cur.x;i<cur.x+n;i++) {
          this.set(cur.y, i, "00", "07");
        }
      }
      return this;
    },


    // Event system poached from fishbone.js

    on: function(e, c){
      (evt[e] || (evt[e] = [])).push(c);
      return this;
    },
    
    fire: function(e, d){
      for (
        var v = evt[e], key = 0;
        v && key < v.length;
      ){ v[key++](d); }

      return this;
    },

    off: function (e, c) {
      for (
        v = evt[e] || [];
        c && (key = v.indexOf(c)) > -1;
      ){ v.splice(key, 1); }
      evt[e] = c ? v : [];

      return this;
    },
  };
})();

function go(n) {
cnsl.push().k('0'+n.toString(16));
cnsl.position(17,78).write("  ");
cnsl.position(18,76).write("    ");
cnsl.position(19,74).write("    %b0%b0");
cnsl.position(20,72).write("    %b0%b0%b1%b1");
cnsl.position(21,70).write("    %b0%b0%b1%b1%b2%b2");
cnsl.position(22,68).write("    %b0%b0%b1%b1%b2%b2%db%db");
cnsl.position(23,66).write("    %b0%b0%b1%b1%b2%b2%db%db%db%db");
cnsl.pop();
} var q = 0;

cnsl.position(2,4).write("Hello world!");
setTimeout(function() { cnsl.write(" How are you?"); }, 2000);
setTimeout(function() { cnsl.write(" That's wonderful."); }, 4000);
setTimeout(function() { cnsl.position(3,4).write("I'm a pixel-perfect console emulator written in pure JavaScript."); }, 6000);
setTimeout(function() { cnsl.position(4,4).write("Just a stylistic thing, really."); }, 8000);
setTimeout(function() { cnsl.write(" What do you think?"); }, 10000);

//cnsl.position(2,4).write("%k09Lorem%k07 Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the %k0aleap%k07 into electronic typesetting, remaining essentially unchanged.");
//setTimeout(function() { cnsl.insertLine(0); }, 1000);
//setTimeout(function() { cnsl.deleteLine(0); }, 2000);
//setTimeout(function() { cnsl.eraseLine(4); }, 3000);
//setTimeout(function() { cnsl.position(5,19).del("char", 2); }, 4000);
//setTimeout(function() { cnsl.position(5,19).ins("char", 2); }, 5000);

setInterval(function() { go(q); q++; if (q>15) { q=1; } }, 500);
