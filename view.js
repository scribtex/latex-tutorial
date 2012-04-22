define(function() {
    var View = function() {
        $(window).bind("resize", this.resize);
        this.resize();
    };

    (function() {
        this.onCodeChange = function(callback) {
            $('#editor').bind("keyup", function() {
                callback($('#editor')[0].value);    
            })
        };

        this.setCode = function(code) {
            $('#editor')[0].value = code;
        };

        this.getCode = function() {
            return $('#editor')[0].value;
        };

        this.setInstructions = function(options) {
            $('#instructions')[0].innerHTML = markdown.toHTML(options.content);
            
            if (options.button) {
                var button = $("<p><a class='btn' href='#'>" + options.button.caption + "</a></p>");
                button.bind("click", options.button.callback);
                $('#instructions').append(button);
            }
        };

        this.resize = function() {
            $('#editor').height(
                $(window).height() - $("#instructions").outerHeight(true) - 36
            );
            $('#editor').width(
                $(".editor-pane-inner").width() - 10
            );

            if (this.iframe) {
                this.iframe.style.top = "10px";
                this.iframe.style.left = $(".pdf-pane").position().left + 10 + "px";
                this.iframe.style.height = $(window).height() - 30 + "px";
                this.iframe.style.width = $(".pdf-pane-inner").width() - 10 + "px";
            }
        };

        this.displayPdf = function(pdf) {
            if (!this.iframe) {
                this.iframe = document.createElement("iframe");
                this.iframe.style.position = "absolute";
                this.iframe.setAttribute("class", "pdf-iframe");
                document.body.appendChild(this.iframe);
            }
            this.iframe.src = pdf;
            this.resize();
        };
    }).call(View.prototype);

    return View;

});
