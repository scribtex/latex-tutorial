define(["mustache"], function(Mustache) {
    var View = function() {
        $(this.init.bind(this));
    };

    (function() {
        this.init = function() {
            this.templates = {
                framework:    $("#framework-template").html(),
                instructions: $("#instructions-template").html()
            };

            $(document.body).append(Mustache.render(this.templates.framework));
            
            this.pdfPaneElements = {
                autoCompileInstructions: $(".auto-compile-instructions"),
                noEmbeddedViewer:        $(".no-embedded-viewer"),
                compiling:               $(".compiling"),
                pdf:                     $("#pdf-iframe")
            };

            this.pdfPaneElements.autoCompileInstructions.show();
            this.pdfPaneElements.noEmbeddedViewer.hide();
            this.pdfPaneElements.compiling.hide();
            this.pdfPaneElements.pdf.hide();

            this.pdfPane = $(".pdf-pane");
            this.editorPane = $(".editor-pane");
            this.instructionsBanner = $(".instructions-banner");

            this.pdfPane.hide();
            this.pdfPaneVisible = false;

            $(window).bind("resize", this.resize.bind(this));
            this.resize.bind(this);
        };

        this.onCodeChange = function(callback) {
            $('#editor').bind("keyup", function() {
                callback($('#editor').attr("value"));    
            })
        };

        this.setCode = function(code) {
            $('#editor').attr("value", code);
        };

        this.getCode = function() {
            return $('#editor')[0].value;
        };

        this.setInstructions = function(options) {
            var view = {
                content : markdown.toHTML(options.content)
            };

            if (options.button) {
                view.button = options.button.caption;
            }

            $('#instructions').html(Mustache.render(this.templates.instructions, view));

            if (options.button) {
                $("#progress-button").bind("click", options.button.callback);
            }
            
            this.resize();
        };

        this.resize = function() {
            $('#editor').height(
                $(window).height() - $(".instructions-banner").outerHeight(true) - 30 - 4
            );
            $('#editor').width(
                $(".editor-pane-inner").innerWidth() - 6
            );

            this.pdfPaneElements.pdf.css({
                position: "absolute",
                top:      $(".pdf-pane-inner").position().top + "px",
                left:     $(".pdf-pane-inner").position().left + 10 + "px"
            });
            this.pdfPaneElements.pdf.height(
                $(window).height() - $(".instructions-banner").outerHeight(true) - 30
            );
            this.pdfPaneElements.pdf.width($(".pdf-pane-inner").width() - 6 + "px");
        };

        this.showPdfPane = function() {
            if (!this.pdfPaneVisible) {
                var self = this;
                this.editorPane.animate({
                    marginLeft: 0
                });
                this.instructionsBanner.animate({
                    marginLeft: 0,
                    marginRight: 0,
                    width: "100%"
                }, function() {
                    self.pdfPane.show();
                    self.resize();
                    self.pdfPaneVisible = true;
                });
            }
        };

        this.hidePdfPane = function() {
            if (this.pdfPaneVisible) {
                this.pdfPane.hide();
                var self = this;
                this.editorPane.animate({
                    marginLeft: "25%"
                });
                this.instructionsBanner.animate({
                    marginLeft: "25%",
                    marginRight: "25%",
                    width: "50%"
                }, function() {
                    self.resize();
                    self.pdfPaneVisible = false;
                });
            }
        };

        this.displayPdf = function(pdf) {
            if (this.pdfPaneVisible) {
                this.pdfPaneElements.autoCompileInstructions.hide();
                this.pdfPaneElements.compiling.hide();
                this.pdfPaneElements.noEmbeddedViewer.show();
                this.pdfPaneElements.pdf.show();

                this.pdfPaneElements.pdf.attr("src", pdf);
                this.resize();
            }
        };

        this.showCompiling = function() {
            this.pdfPaneElements.autoCompileInstructions.hide();
            this.pdfPaneElements.noEmbeddedViewer.hide();
            this.pdfPaneElements.pdf.hide();
            this.pdfPaneElements.compiling.show();
        };
    }).call(View.prototype);

    return View;

});
