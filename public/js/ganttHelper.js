
var taskGroups = [ "Team 1", "Team 2", "Team 3", "Team 4", "Team 5" ];

var MAIN_TASKS = [
    {
    "taskGroup":taskGroups[0],
    "startDate": new Date(),
    "endDate":addMinutes(new Date(),120),
    "id":1,
    "status":"bar-running",
    "subTasks":[
        {
        "taskGroup":taskGroups[1],
        "startDate": new Date(),
        "endDate":addMinutes(new Date(),240),
        "id":1,
        "status":"bar-running",
        "subTasks":[]
        },
        {
            "taskGroup":taskGroups[2],
            "startDate": new Date(),
            "endDate":addMinutes(new Date(),60),
            "id":1,
            "status":"bar-running",
            "subTasks":[]
        }
    ]
    }
]
var CURRENT_TASKS = MAIN_TASKS;

var currentId = CURRENT_TASKS.length;

var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};


CURRENT_TASKS.sort(function(a, b) {
    return a.endDate - b.endDate;
});

var maxDate = CURRENT_TASKS[CURRENT_TASKS.length - 1].endDate;
CURRENT_TASKS.sort(function(a, b) {
    return a.startDate - b.startDate;
});

var minDate = CURRENT_TASKS[0].startDate;

var format = "%H:%M";
var timeDomainString = "1day";

var gantt = d3.gantt().taskTypes(taskGroups).taskStatus(taskStatus).tickFormat(format).height(450).width(800);


gantt.timeDomainMode("fixed");
changeTimeDomain(timeDomainString);

gantt(CURRENT_TASKS);

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
    
    var lastEndDate = getEndDate();

    CURRENT_TASKS.push({
        "taskName" : taskName,
        "id":currentId++,
        "startDate" : startDate,//d3.timeHour.offset(lastEndDate, Math.ceil(1 * Math.random())),
        "endDate" : endDate,//d3.timeHour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 5),
        "taskGroup" : taskGroup,
        "status" : taskStatus.RUNNING,
        "subTasks":[]
    });

    changeTimeDomain(timeDomainString)
    gantt.redraw(CURRENT_TASKS);
};

function removeTask() {
    CURRENT_TASKS.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(CURRENT_TASKS);
};

function addMinutes(date, minutes) {
    return date.setMinutes( date.getMinutes() + minutes );
}
