
var tasks = [
    {
    "taskGroup":taskGroups[0],
    "startDate": new Date(),
    "endDate":addMinutes(new Date(),120),
    "id":1,
    "status":"bar-running"
    }
];

var currentId = tasks.length;

var taskStatus = {
    "SUCCEEDED" : "bar",
    "FAILED" : "bar-failed",
    "RUNNING" : "bar-running",
    "KILLED" : "bar-killed"
};


tasks.sort(function(a, b) {
    return a.endDate - b.endDate;
});

var maxDate = tasks[tasks.length - 1].endDate;
tasks.sort(function(a, b) {
    return a.startDate - b.startDate;
});

var minDate = tasks[0].startDate;

var format = "%H:%M";
var timeDomainString = "1day";

var gantt = d3.gantt().taskTypes(taskGroups).taskStatus(taskStatus).tickFormat(format).height(450).width(800);


gantt.timeDomainMode("fixed");
changeTimeDomain(timeDomainString);

gantt(tasks);

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
    gantt.redraw(tasks);
}

function getEndDate() {
    var lastEndDate = Date.now();
   
    if (tasks.length > 0) {
        lastEndDate = tasks[tasks.length - 1].endDate;
    }

    return lastEndDate;
}

function addTask(name,description,start,finish,time) {

    var taskName = name
    var taskDescription = description
    var startDate = start
    var endDate = finish
    var taskTime = time

    var lastEndDate = getEndDate();
    var taskStatusName = taskStatus.RUNNING;

    var taskGroup = taskGroups[Math.floor(Math.random() * taskGroups.length)];

    tasks.push({
        "taskName" : taskName,
        "startDate" : d3.timeHour.offset(lastEndDate, Math.ceil(1 * Math.random())),
        "endDate" : d3.timeHour.offset(lastEndDate, (Math.ceil(Math.random() * 3)) + 5),
        "taskGroup" : taskGroup,
        "status" : taskStatusName
    });

    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};

function removeTask() {
    tasks.pop();
    changeTimeDomain(timeDomainString);
    gantt.redraw(tasks);
};

function addMinutes(date, minutes) {
    return date.setMinutes( date.getMinutes() + minutes );
}
