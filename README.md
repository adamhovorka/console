Terminal ![v2.0.0-rc.1](http://img.shields.io/badge/version-2.0.0--rc.1-brightgreen.svg)
=======================

I needed a pixel-perfect terminal to go along with my pixel-perfect 3D rendering engine, [Lithium](https://github.com/adamhovorka/lithium), because reasons. This is what I came up with.

## Requirements

- [Dot.js](https://github.com/adamhovorka/dot) >=2.1.1

## Example Code

    var t = new Terminal("myCanvas")
      .writeAt(4,8,"%k02Hello, world!");

A more complete example can be seen in `demo.html`.

## Usage

An instance is created with var `t = new Terminal();` which can optionally be passed a canvas or the ID of a canvas and a callback for when the font is loaded. If an canvas isn't passed on instantiation, a canvas object or id must later be passed into `t.setCA(canvas)`. The terminal can still be manipulated when the font is loading; the changes will be rendered once it's loaded.

An 80x24 character screen, given the default font, is equivalent to a 288px by 480px canvas.

### Instance Methods

Most instance methods are chainable, the exceptions being `height`, `width`, `size`, `get`, and sometimes `position`, `k`, `fg`, and `bg`.

- Canvas selection: `t.setCA(canvas)`
- Magnification: `t.setX(magnification level)`
- Font selection: `t.setFont(url)`
- Size queries: `t.height()`, `t.width()`, `t.size()`
- Rendering: `t.draw(y, x)`, `t.render()`
- Individual characters: `t.set(y, x, c, k)`, `t.get(y, x)`
- Clipboard: `t.copyLine(n)`, `t.pasteLine(n)`
- Cursor movement: `t.position([y||null], [x])`, `t.move(y, x)`, `t.up(n)`, `t.down(n)`, `t.left(n)`, `t.right(n)`
- Cursor state stack: `t.push()`, `t.pop()`
- Cursor color management: `t.k([00-ff])`, `t.fg([0-f])`, `t.bg([0-f])`
- Printing strings: `t.write(string)`, `t.write(y, x, string)`
- Line management: `t.moveLine(a, b)`, `t.insertLine(n)`, `t.deleteLine(n)`, `t.eraseLine(n)`
- Insertion / deletion macros:
  - `t.erase(mode)`
    - `end`: to line end
    - `start`: to line beginning
    - `line`: full line
    - `down`: all lines below cursor (inclusive)
    - `up`: all lines above cursor (inclusive)
    - `screen`: alias for `t.reset()`
  - `t.del(mode, n)`
    - `line`
    - `char`
  - `t.ins(mode, n)`
    - `line`
    - `char`
  - `t.backspace()`
- `t.reset()` (self explanatory)

Normally, characters are rendered as soon as they are changed. To queue up changes instead, set `t.blockRender` to `true` and then execute `t.render()` manually.

The `t.copyLine()` `t.pasteLine()` clipboard is implemented as a stack. `t.copyLine()` pushes a line onto the stack, and `t.pasteLine()` pops one off. To copy one line onto multiple lines, the line must be copied an equal number of times.

To get the cursor's position, call `t.position()` without any arguments. Same goes for color, but with `t.k()`, `t.fg()`, or `t.bg()`.

The difference between `t.position()` and `t.move()` is that `t.position()` is absolute, while `t.move()` is relative.

`t.write()` and `t.writeAt()` currently implement the following character escapes: `%[00-ff]` raw char code; `%k[00-ff]` in-string color manipulation; `%n` new line; `%r` carriage return; `%%` a literal `%`.
