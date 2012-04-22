require(["instructor", "lessons", "compiler", "view"], function(Instructor, lessons, Compiler, View) {

    var view = window.view = new View();

    var compiler = window.compiler = new Compiler(view, "1bd993d7d739eca8740f9919d8748352");
   
    var options = {}
    if(m = window.location.hash.match(/#s([0-9])+l([0-9])+/)) {
        options.sectionIndex = parseInt(m[1], 10);
        options.lessonIndex  = parseInt(m[2], 10);
    }
   
    var instructor = new Instructor(view, lessons, options);

    
});
