
var taskGroups = [ "Team 1", "Team 2", "Team 3", "Team 4", "Team 5" ];
var subtaskGroups = [ "Subtask 1", "Subtask 2", "Subtask 3", "Subtask 4", "Subtask 5" ];

var MAIN_TASKS = []

var IS_SUBTASK_VIZ = false
var SUBTASK_FOCUS = -1
var CURRENT_TASKS = MAIN_TASKS;

var currentId = CURRENT_TASKS.length;

var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};


var date = new Date();

var maxDate = (CURRENT_TASKS[CURRENT_TASKS.length - 1] === undefined) ? date : CURRENT_TASKS[CURRENT_TASKS.length - 1].endDate;

var minDate = (CURRENT_TASKS[0] === undefined)?date.setDate(date.getDate() - 1) : CURRENT_TASKS[0].startDate;

CURRENT_TASKS.sort(function(a, b) {
        return a.startDate - b.startDate;
});

var format = "%H:%M";
var timeDomainString = "1week";

var maingantt = d3.gantt().taskTypes(taskGroups).taskStatus(taskStatus).tickFormat(format);
var subgantt = d3.gantt().taskTypes(subtaskGroups).taskStatus(taskStatus).tickFormat(format);

maingantt.timeDomainMode("fixed");
subgantt.timeDomainMode("fixed");

var gantt = maingantt

changeTimeDomain(timeDomainString);


function changeTimeDomain(timeDomainString) {
    
    this.timeDomainString = timeDomainString;

    switch (timeDomainString) {
        case "1hr":
            format = "%H:%M:%S";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -1), getEndDate() ]);
            break;
        case "3hr":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -3), getEndDate() ]);
            break;

        case "6hr":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeHour.offset(getEndDate(), -6), getEndDate() ]);
            break;

        case "1day":
            format = "%H:%M";
            gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -1), getEndDate() ]);
            break;

        case "1week":
            format = "%a %H:%M";
            gantt.timeDomain([ d3.timeDay.offset(getEndDate(), -7), getEndDate() ]);
            break;
        default:
            format = "%H:%M"
    }

    console.log(gantt.taskTypes())
    gantt.tickFormat(format);
    gantt.redraw(CURRENT_TASKS);
}

function getEndDate() {
    var lastEndDate = Date.now();
   
    if (CURRENT_TASKS.length > 0) {
        lastEndDate = CURRENT_TASKS[CURRENT_TASKS.length - 1].endDate;
    }

    return lastEndDate;
}

function addTask(data) {
    
    var taskName = data.taskName
    var taskDescription = data.taskDescription
    var startDate = new Date(data.taskStart);
    var endDate = new Date(data.taskFinish);
    var taskTime = data.taskEstimative
    var taskGroup = data.taskGroup
    currentId++

    if(!IS_SUBTASK_VIZ){
        
        console.log("adding maintask")

        MAIN_TASKS.push({
            "isSubtask":false,
            "taskName" : taskName,
            "id":currentId,
            "startDate" : startDate,
            "endDate" : endDate,
            "taskGroup" : taskGroup,
            "status" : taskStatus.RUNNING,
            "taskDescription": taskDescription,
            "subTasks":[]
        });

        changeTimeDomain(timeDomainString)
        gantt.redraw(MAIN_TASKS);
    }
    else{

        console.log("adding subtask to sprint" +SUBTASK_FOCUS )        

        CURRENT_TASKS.push({
            "isSubtask":true,
            "taskName" : taskName,
            "id":currentId++,
            "startDate" : startDate,
            "endDate" : endDate,
            "taskGroup" : taskGroup,
            "status" : taskStatus.RUNNING,
            "taskDescription": taskDescription,
            "subTasks":[]
        })

        changeTimeDomain(timeDomainString)
        gantt.redraw(CURRENT_TASKS);
    }
    
};

function removeTask() {
    CURRENT_TASKS.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(CURRENT_TASKS);
};

function resetGantt(){

    IS_SUBTASK_VIZ = false
    CURRENT_TASKS = MAIN_TASKS
    SUBTASK_FOCUS = -1

    changeVision()
    gantt.redraw(CURRENT_TASKS);
}

function cleanRects(){
    d3.select(".chart").select(".gantt-chart").selectAll("rect").remove()
}

function changeVision(){
    cleanRects()
    $('#taskGroup').empty()
    if(IS_SUBTASK_VIZ){
        gantt = subgantt
        subtaskGroups.forEach(d => 
            $('#taskGroup').append(`<option value="${d}"> 
                ${d} 
            </option>`));
            
    }
    else{
        gantt = maingantt
        taskGroups.forEach(d => 
            $('#taskGroup').append(`<option value="${d}"> 
                ${d} 
            </option>`));
            ; 
    }
}
