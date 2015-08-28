(function(f, define){
    define([ "./kendo.core", "./pdf/core", "./pdf/ttf", "./pdf/drawing", "./kendo.drawing" ], f);

}) (function(){

var __meta__ = {
    id: "pdf",
    name: "PDF export",
    description: "PDF Generation framework",
    category: "framework",
    depends: [ "core", "drawing" ]
};

(function(kendo, $){

kendo.PDFMixin = {
    extend: function(proto) {
        proto.events.push("pdfExport");
        proto.options.pdf = this.options;
        proto.saveAsPDF = this.saveAsPDF;
        proto._drawPDF = this._drawPDF;
        proto._drawPDFShadow = this._drawPDFShadow;
    },
    options: {
        fileName  : "Export.pdf",
        proxyURL  : "",

        // paperSize can be an usual name, i.e. "A4", or an array of two Number-s specifying the
        // width/height in points (1pt = 1/72in), or strings including unit, i.e. "10mm".  Supported
        // units are "mm", "cm", "in" and "pt".  The default "auto" means paper size is determined
        // by content.
        paperSize : "auto",

        // Export all pages, if applicable
        allPages: false,

        // True to reverse the paper dimensions if needed such that width is the larger edge.
        landscape : false,

        // An object containing { left, top, bottom, right } margins with units.
        margin    : null,

        // Optional information for the PDF Info dictionary; all strings except for the date.
        title     : null,
        author    : null,
        subject   : null,
        keywords  : null,
        creator   : "Kendo UI PDF Generator",

        // Creation Date; defaults to new Date()
        date      : null
    },

    saveAsPDF: function() {
        var progress = new $.Deferred();
        var promise = progress.promise();
        var args = { promise: promise };

        if (this.trigger("pdfExport", args)) {
            return;
        }

        var options = this.options.pdf;
        options.multiPage = options.allPages;

        this._drawPDF(progress)
        .then(function(root) {
            return kendo.drawing.exportPDF(root, options);
        })
        .done(function(dataURI) {
            kendo.saveAs({
                dataURI: dataURI,
                fileName: options.fileName,
                proxyURL: options.proxyURL,
                forceProxy: options.forceProxy,
                proxyTarget: options.proxyTarget
            });

            progress.resolve();
        })
        .fail(function(err) {
            progress.reject(err);
        });

        return promise;
    },

    _drawPDF: function(progress) {
        var promise = new $.Deferred();

        kendo.drawing.drawDOM(this.wrapper)
        .done(function(group) {
            var args = {
                page: group,
                pageNumber: 1,
                progress: 1,
                totalPages: 1
            };

            progress.notify(args);
            promise.resolve(args.page);
        })
        .fail(function(err) {
            promise.reject(err);
        });

        return promise;
    },

    _drawPDFShadow: function(settings) {
        settings = settings || {};
        var wrapper = this.wrapper;
        var shadow = $("<div class='k-pdf-export-shadow'>");

        // Content will be allowed to take up to 200" if no width is given.
        if (settings.width) {
            shadow.css({
                width: settings.width,
                overflow: "visible"
            });
        }

        wrapper.before(shadow);
        shadow.append(settings.content || wrapper.clone(true, true));

        var promise = kendo.drawing.drawDOM(shadow);
        promise.always(function() {
            shadow.remove();
        });

        return promise;
    }
};

})(kendo, window.kendo.jQuery);

return kendo;

}, typeof define == 'function' && define.amd ? define : function(_, f){ f(); });
