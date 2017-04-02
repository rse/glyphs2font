
[glyphs2font](https://www.npmjs.com/package/glyphs2font)
========================================================

SVG Glyph Icons to Web Font Generation

<p/>
<img src="https://nodei.co/npm/glyphs2font.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/glyphs2font.png" alt=""/>

About
-----

Glyphs2Font is a small command-line utility for converting
one or more SVG-based icons into the glyphs of a Web font.
The generated Web font is provided in TTF, EOF, WOFF and SVG formats
and a corresponding CSS file for direct embedding is generated, too.

Installation
------------

```shell
$ npm install -g glyphs2font
```

Usage
-----

```shell
$ ls -1
example-font.yml
icon-sign-failure.svg
icon-sign-minus.svg
icon-sign-plus.svg
icon-sign-success.svg

$ cat sample.yml
font:
    svg:        example-font.svg
    ttf:        example-font.ttf
    eot:        example-font.eot
    woff:       example-font.woff
    css:        example-font.css
    html:       example-font.html
    name:       example
    prefix:     example
    fixedwidth: false
    height:     1000
    descent:    150
    normalize:  true
    center:     true
    round:      10e12
glyphs:
    - glyph:    icon-sign-success.svg
      name:     success
      code:     0xE001
    - glyph:    icon-sign-failure.svg
      name:     failure
      code:     0xE002
    - glyph:    icon-sign-plus.svg
      name:     plus
      code:     0xE003
    - glyph:    icon-sign-minus.svg
      name:     minus
      code:     0xE004

$ glyphs2font sample.yml

$ ls -1
example-font.css
example-font.eot
example-font.html
example-font.svg
example-font.ttf
example-font.woff
example-font.yml
icon-sign-failure.svg
icon-sign-minus.svg
icon-sign-plus.svg
icon-sign-success.svg
```

Internals
---------

The internal conversion process works as following:

1. the SVG icons are converted into an SVG font with the help of
   [svgicons2svgfont](https://www.npmjs.com/package/svgicons2svgfont).
2. the SVG font is converted into TrueType Font (TTF) format
   with the help of [svg2ttf](https://www.npmjs.com/package/svg2ttf).
3. the TTF format is converted into Embedded OpenType (EOT)
   format with the help of [ttf2eot](https://www.npmjs.com/package/ttf2eot).
4. the TTF format is converted into Web Open Font Format (WOFF)
   with the help of [ttf2woff](https://www.npmjs.com/package/ttf2woff).
5. the Cascading Style Sheet (CSS) is generated for embedding
   the font directly into HTML pages.
6. the HyperText Markup Language (HTML) sample page is
   generated for showcasing the generated font.

License
-------

Copyright (c) 2015-2017 Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

