define(function() {
    var Compiler = function(view, token) {
        this.view  = view;
        this.token = token;
        this.enableCompiling = true;

        setTimeout(this.compileIfChanged.bind(this), 500);
        this.view.onCodeChange(this.onCodeChange.bind(this));
    };

    (function() {
        this.compile = function(options) {
            this.view.showCompiling();

            this.successCallback = options.success || function() {};
            this.errorCallback = options.error || function() {};

            var requestBody = JSON.stringify({
                compile : {
                    token : this.token,
                    options : {
                        asynchronous : true
                    },
                    rootResourcePath : "main.tex",
                    resources : [
                        {
                            path    : "main.tex",
                            content : options.content
                        }
                    ]
                }
            });

            var self = this;

            $.ajax({
                url         : "/clsi/clsi/compile",
                type        : "POST",
                contentType : "application/json",
                data        : requestBody,
                dataType    : "json",
                success     : function(response) {
                    self.compileId = response.compile.compile_id;
                    self.startCheckingForResponse();
                },
                error     : function() {
                    console.log(arguments);
                }
            })
        };

        this.startCheckingForResponse = function() {
            this.waitTime = 200;
            this.checkForResponse();
        };

        this.checkForResponse = function() {
            var self = this;
            $.ajax({
                url          : "/clsi/output/" + this.compileId + "/response.json",
                dataType     : "json",
                success      : function(response) {
                    if (response.compile.status == "compiling") {
                        self.scheduleNextCheck();
                    } else if (response.compile.status == "success") {
                        self.successCallback({
                            pdf : response.compile.output_files[0].url,
                            log : "parsed log"
                        });
                    } else if (response.compile.status == "failure") {
                        self.errorCallback({
                            error : response.compile.error,
                            log : "parsed log"
                        });
                    }
                },
                error       : function() {
                    self.scheduleNextCheck();
                }
            });
        };

        this.scheduleNextCheck = function() {
            var self = this;
            this.waitTime = Math.min(this.waitTime * 2, 2000);
            setTimeout(function() {
                self.checkForResponse();
            }, this.waitTime);
        };

        this.onCodeChange = function(code) {
            this.changedCode = true;
            this.lastCodeChange = new Date();
        };

        this.compileIfChanged = function() {
            var self = this;

            if (this.enableCompiling && this.changedCode && (new Date() - this.lastCodeChange) > 1000) {
                this.changedCode = false;
                this.compileIfCodeValid();
            }

            setTimeout(this.compileIfChanged.bind(this), 500);
        };

        this.compileIfCodeValid = function() {
            if (this.enableCompiling) {
                var error = this.isCompilable(this.view.getCode());
                if (typeof error != "string") {
                    this.compile({
                        content : this.view.getCode(),
                        success : function(response) {
                            self.view.displayPdf(response.pdf);
                        }
                    })
                } else {
                    console.log(error);
                }
            }
        };

        this.isCompilable = function(code) {
            if (!code.match(/\\documentclass/)) {
                return "No \\documentclass"
            }
            if (!code.match(/\\begin\{document\}/)) {
                return "No \\begin{document} ... \\end{document}"
            }
            // Check that all the environments and braces match
            var i = 0;
            var braces = 0;
            var environments = [];
            while (i < code.length) {
                if (code[i] == "{") {
                    braces++;
                } else if (code[i] == "}") {
                    braces--;
                } else if (m = code.slice(i).match(/^\\begin\{([^\}]*)\}/)) {
                    environments.push(m[1]);
                    i += ("\\begin{" + m[1] + "}").length - 1;
                } else if (m = code.slice(i).match(/^\\end\{([^\}]*)\}/)) {
                    var env = environments.pop();
                    if (m[1] != env) {
                        break;
                    }
                    i += ("\\end{" + m[1] + "}").length - 1;
                }

                i++;
            }

            if (environments.length > 0) {
                return "Unmatched environment: " + environments[environments.length - 1];
            } else if (braces != 0) {
                return "Unmatched braces";
            } else {
                return;
            }
        };

    }).call(Compiler.prototype);

    return Compiler;
})
