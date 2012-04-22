define(function() {
    var Instructor = function(view, sections, options) {
        this.view     = view;
        this.sections = sections;

        this.sectionIndex = options.sectionIndex || 0;
        this.lessonIndex  = options.lessonIndex || 0;
        this.init();
    };

    (function() {
        this.init = function() {
            this.$setUpLesson(this.currentLesson());

            this.view.onCodeChange(this.onCodeChange.bind(this));
        };

        this.currentSection = function() {
            return this.sections[this.sectionIndex];
        };

        this.currentLesson = function() {
            return this.currentSection().lessons[this.lessonIndex];
        };

        this.onCodeChange = function(code) {
            var progressionCheck = (this.currentLesson().progression || {}).codeSatisfies;
            if (typeof progressionCheck == "function") {
                if (progressionCheck(code)) {
                    this.progressToNextLesson();
                }
            }
        };
        
        this.progressToNextLesson = function() {
            this.lessonIndex += 1;
            if (this.lessonIndex >= this.currentSection().lessons.length) {
                this.lessonIndex = 0;
                this.sectionIndex += 1;
                if (this.sectionIndex >= this.sections.length) {
                    alert("End of lessons");
                    this.lessonIndex -= 1;
                    this.sectionIndex -= 1;
                    return
                }
            }

            this.$setUpLesson(this.currentLesson());
        };
        
        this.$setUpLesson = function(lesson) {
            var parameters = {
                content: lesson.content
            }

            if (lesson.progression && lesson.progression.button) {
                var self = this;
                parameters.button = {
                    caption  : lesson.progression.button,
                    callback : function() {
                        self.progressToNextLesson();
                    }
                }
            }

            if (lesson.editorText) {
                this.view.setCode(lesson.editorText);
            }

            this.view.setInstructions(parameters);
        };


    }).call(Instructor.prototype);

    return Instructor;
});
