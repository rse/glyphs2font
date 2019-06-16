#!/usr/bin/env node
/*
**  glyphs2font -- SVG Glyph Icons to Web Font Generation
**  Copyright (c) 2015-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/*  external reqirements  */
var fs               = require("fs")
var path             = require("path")
var jsyaml           = require("js-yaml")
var tmp              = require("tmp")
var svgicons2svgfont = require("svgicons2svgfont")
var svg2ttf          = require("svg2ttf")
var ttf2woff         = require("ttf2woff")
var ttf2eot          = require("ttf2eot")

/*  read YAML configuration  */
if (process.argv.length !== 3) {
    console.error("glyphs2font: ERROR: invalid number of arguments")
    console.error("glyphs2font: USAGE: glyphs2fonts <yaml-config-file>")
    process.exit(1)
}
var cfgfile = process.argv[2]
if (!fs.existsSync(cfgfile)) {
    console.error("glyphs2font: ERROR: configuration file not found: " + cfgfile)
    process.exit(1)
}
var cfg = jsyaml.load(fs.readFileSync(cfgfile, "utf8"))

/*  helper function for generating relative path from CWD to target over base  */
var cwdto = function (target, base) {
    var rel = path.relative(
        process.cwd(),
        path.join(
            path.resolve(
                path.dirname(base),
                path.dirname(target)
            ),
            path.basename(target)
        )
    )
    return rel
}

/*  helper function for generating relative path from base to target  */
var relto = function (target, base) {
    var rel = path.join(
        path.relative(
            path.dirname(base),
            path.dirname(target)
        ),
        path.basename(target)
    )
    return rel
}

/*  generate SVG font  */
var svgtmp = null
var svgfile = cfg.font.svg
if (!svgfile) {
    svgtmp = tmp.fileSync()
    svgfile = svgtmp.name
}
var stream = new svgicons2svgfont({
    fontName:           cfg.font.name,
    normalize:          cfg.font.normalize,
    centerHorizontally: cfg.font.center,
    round:              parseFloat(cfg.font.round),
    fontHeight:         cfg.font.height,
    descent:            cfg.font.descent,
    fixedWidth:         cfg.font.fixedwidth,
    log:                function () {},
    error:              function (err) { console.log("** ERROR: " + err) }
})
stream.pipe(fs.createWriteStream(cwdto(svgfile, cfgfile))).on("finish", function () {

    /*  generate TTF font  */
    var ttftmp = null
    var ttffile = cfg.font.ttf
    if (!ttffile) {
        ttftmp = tmp.fileSync()
        ttffile = ttftmp.name
    }
    var ttf = svg2ttf(fs.readFileSync(svgfile, "utf8"), {})
    fs.writeFileSync(cwdto(ttffile, cfgfile), Buffer.from(ttf.buffer))

    /*  generate EOT font  */
    if (cfg.font.eot) {
        var eot = ttf2eot(new Uint8Array(fs.readFileSync(ttffile)), {})
        fs.writeFileSync(cwdto(cfg.font.eot, cfgfile), Buffer.from(eot.buffer))
    }

    /*  generate WOFF font  */
    if (cfg.font.woff) {
        var woff = ttf2woff(new Uint8Array(fs.readFileSync(ttffile)), {})
        fs.writeFileSync(cwdto(cfg.font.woff, cfgfile), Buffer.from(woff.buffer))
    }

    /*  generate CSS stylesheet  */
    if (cfg.font.css) {
        var css = ""
        css += "/*\n"
        css += "**  " + cfg.font.css + " -- Web Font Embedding Stylesheet\n"
        css += "**  Generated by Glyphs2Font <https://github.com/rse/glyphs2font>\n"
        css += "*/\n"
        css += "\n"
        css += "@font-face {\n"
        css += "    font-family:     \"" + cfg.font.name + "\";\n"
        var src = []
        if (cfg.font.eot)
            src.push("url(\"" + relto(cfg.font.eot, cfg.font.css) + "?#iefix\") format(\"embedded-opentype\")")
        if (cfg.font.woff)
            src.push("url(\"" + relto(cfg.font.woff, cfg.font.css) + "\") format(\"woff\")")
        if (cfg.font.svg)
            src.push("url(\"" + relto(cfg.font.svg, cfg.font.css) + "\") format(\"svg\")")
        if (cfg.font.ttf)
            src.push("url(\"" + relto(cfg.font.ttf, cfg.font.css) + "\") format(\"truetype\")")
        if (cfg.font.eot) {
            css += "    src:             url(\"" + relto(cfg.font.eot, cfg.font.css) + "\");\n"
            src.unshift("local(\"*\")")
        }
        css += "    src:             " + src.join(",\n                     ") + ";\n"
        css += "    font-style:      normal;\n"
        css += "    font-weight:     normal;\n"
        css += "    font-stretch:    normal;\n"
        css += "    font-variant:    normal;\n"
        css += "}\n"
        css += "\n"
        css += "[class^=\"" + cfg.font.prefix + "-\"]:before,\n"
        css += "[class*=\" " + cfg.font.prefix + "-\"]:before {\n"
        css += "    font-family:     \"" + cfg.font.name + "\";\n"
        css += "    font-style:      normal;\n"
        css += "    font-weight:     normal;\n"
        css += "    font-stretch:    normal;\n"
        css += "    font-variant:    normal;\n"
        css += "    font-size:       inherit;\n"
        css += "    text-rendering:  auto;\n"
        css += "    display:         inline-block;\n"
        css += "    transform:       translate(0, 0);\n"
        css += "    speak:           none;\n"
        css += "    text-decoration: inherit;\n"
        css += "    text-align:      center;\n"
        css += "    text-transform:  none;\n"
        css += "    -webkit-font-smoothing:  antialiased;\n"
        css += "    -moz-osx-font-smoothing: grayscale;\n"
        css += "}\n"
        css += "\n"
        cfg.glyphs.forEach(function (glyph) {
            css += "." + cfg.font.prefix + "-" + glyph.name + ":before {\n"
            css += "    content:         \"\\" + glyph.code.toString(16) + "\";\n"
            css += "}\n"
        })
        css += "\n"
        fs.writeFileSync(cwdto(cfg.font.css, cfgfile), css, "utf8")
    }

    /*  generate HTML sample  */
    if (cfg.font.html) {
        var html = ""
        html += "<!DOCTYPE html>\n"
        html += "<html>\n"
        html += "    <head>\n"
        html += "        <title>" + cfg.font.name + "</title>\n"
        html += "        <style type=\"text/css\">\n"
        html += "            body               { font-size: 16pt; font-family: sans-serif; margin: 40px; }\n"
        html += "            .sample            { width: 100%; }\n"
        html += "            .sample .icon      { width: 20%;  display: inline-block; float: left; }\n"
        html += "            .sample .icon i    { width: 20%;  display: inline-block; color: #cc3333; }\n"
        html += "            .sample .icon span { width: auto; display: inline-block; }\n"
        html += "        </style>\n"
        html += "        <link href=\"" + relto(cfg.font.css, cfg.font.html) + "\" rel=\"stylesheet\" type=\"text/css\"/>\n"
        html += "    </head>\n"
        html += "    <body>\n"
        html += "        <h1>" + cfg.font.name + "</h1>\n"
        html += "        <div class=\"sample\">\n"
        cfg.glyphs.forEach(function (glyph) {
            html += "            <div class=\"icon\">"
            html += "<i class=\"" + cfg.font.prefix + "-" + glyph.name + "\"></i>"
            html += "<span>" + glyph.name + "</span>"
            html += "</div>\n"
        })
        html += "        </div>\n"
        html += "    </body>\n"
        html += "</html>\n"
        fs.writeFileSync(cwdto(cfg.font.html, cfgfile), html, "utf8")
    }
}).on("error", function (err) {
    console.error("glyphs2font: ERROR: " + err)
    process.exit(1)
})
cfg.glyphs.forEach(function (glyph) {
    var gstream = fs.createReadStream(cwdto(glyph.glyph, cfgfile))
    gstream.metadata = {
        name:      glyph.name,
        unicode:   [ String.fromCharCode(glyph.code) ]
    }
    stream.write(gstream)
})
if (cfg.glyphs.length <= 1) {
    /*  ugly workaround for at least Chrome/Opera (Blink engine) browsers:
        generate a font with at least 2 glyphs are the font will be silently rejected  */
    var gstream
    for (var i = 0; i <= cfg.glyphs.length; i++) {
        gstream = fs.createReadStream(path.join(__dirname, "empty-glyph.svg"))
        gstream.metadata = {
            name:      "EMPTY" + i,
            unicode:   [ String.fromCharCode(0xF8FF - i) ]
        }
        stream.write(gstream)
    }
}
stream.end()

