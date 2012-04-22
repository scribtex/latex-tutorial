define(["text!/lessons/lessons.lsn"], function(lessonContent) {

var sections = [];

var currentSection,
    currentContent = "",
    currentOptions = "",
    currentProgressionCode = "",
    currentEditorText = "";

var states = {
    TEXT:        1,
    PROGRESSION: 2,
    EDITORTEXT:  3
}

var state = states.TEXT;

var lines = lessonContent.split("\n");
for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    if (state == states.TEXT) {
        if (m = line.match(/#[ ]*(.*)/)) {
            currentSection = {
                title: m[1],
                lessons: []
            };
            sections.push(currentSection);
        } else if (line.match(/^=progression/)) {
            state = states.PROGRESSION;
        } else if (line.match(/^=editor/)) {
            state = states.EDITORTEXT;
        } else if (line.match(/^=options/)) {
            state = states.OPTIONS;
        } else {
            currentContent += line + "\n";
        }
    } else if (state == states.PROGRESSION) {
        if (line.match(/^=endprogression/)) {
            state = states.TEXT;
            currentSection.lessons.push({
                content: currentContent,
                progression: eval("(" + currentProgressionCode + ")"),
                options: eval("(" + (currentOptions || "{}") + ")"),
                editorText: (currentEditorText === "" ? null : currentEditorText)
            });
            currentContent = "";
            currentProgressionCode = "";
            currentEditorText = "";
            currentOptions = "";
        } else {
            currentProgressionCode += line + "\n"
        }
    } else if (state == states.EDITORTEXT) {
        if (line.match(/^=endeditor/)) {
            state = states.TEXT;
        } else {
            currentEditorText += line + "\n";
        }
    } else if (state == states.OPTIONS) {
        if (line.match(/^=endoptions/)) {
            state = states.TEXT;
        } else {
            currentOptions += line + "\n";
        }
    }
}

return sections;

});
