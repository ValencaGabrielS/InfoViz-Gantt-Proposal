const btnIssues = document.getElementById("btnIssues");

btnIssues.addEventListener("click", getIssues);

async function getIssues() {

    var url = "https://api.github.com/search/issues?q=repo:"
    
    // var repo = document.getElementById("giturl").value;
    var repo = "junit-team/junit5";

    url = url.concat(repo, " type:issue ");
    const response = await fetch(url);
    const result = await response.json();

    var id = 1;
    var count = 1;

    var resultFiltered = result.items.filter(item => item.milestone);

    var milestonesFiltered = getMilestonesFiltered(resultFiltered);

    taskGroups = [];
    subtaskGroups = new Array();
    milestonesFiltered.forEach(item => {

        var taskGroup = "Team " + count;
        var mainTask =
            {
                "isSubtask": false,
                "taskName": item.title,
                "id": id,
                "startDate": new Date(),
                "endDate": new Date(),
                "taskGroup": taskGroup,
                "status": item.state == "open" ? taskStatus.RUNNING : taskStatus.SUCCEEDED,
                "taskDescription": item.description,
                "burndownArray": new Array(),
                "taskType": undefined,
                "subTasks": []
            };

        count++;
        taskGroups.push(taskGroup);

        var currentId = 0;
        
        subtaskGroups[id] = new Array();
        
        resultFiltered.forEach(i => {
            
            if(item.id === i.milestone.id)
            {
                var taskName = i.title;
                var taskDescription = i.body;
                var startDate = new Date(i.created_at);
                var endDate = addDays(new Date(i.created_at), 5);
                var closed_at = new Date(i.closed_at);
                var subTaskGroup = i.user.login;

                subtaskGroups[id].push(subTaskGroup);

                var labels = i.labels;
                
                var taskType;
                labels.forEach(element => {
                    labelName = element.name.toLowerCase();

                    if(labelName.includes("add")) {
                        taskType = "Add";
                    }
                    else if(labelName.includes("bug")) {
                        taskType = "Bug";
                    }
                    else if(labelName.includes("change")) {
                        taskType = "Change";
                    }
                    else if(labelName.includes("file")) {
                        taskType = "File";
                    }
                    else if(labelName.includes("fix")) {
                        taskType = "Fix";
                    }
                    else if(labelName.includes("new")) {
                        taskType = "New";
                    }
                    else if(labelName.includes("patch")) {
                        taskType = "Patch";
                    }
                    else if(labelName.includes("support")) {
                        taskType = "Support";
                    }
                    else if(labelName.includes("test")) {
                        taskType = "Test";
                    } 
                    else {
                        taskType = undefined;
                    }
                });

                mainTask.subTasks.push({
                    "isSubtask": true,
                    "taskName" : taskName,
                    "id": currentId++,
                    "startDate" : startDate,
                    "endDate" : endDate,
                    "taskGroup" : subTaskGroup,
                    "status" : taskStatus.RUNNING,
                    "taskDescription": taskDescription,
                    "taskType": taskType,
                    "subTasks":[]
                });

                var burndownTask; 
                if(closed_at != null)
                {
                    if(closed_at > endDate)
                    {
                        burndownTask = burndownType.EARLY;
                    } 
                    else if(closed_at < endDate)
                    {
                        burndownTask = burndownType.LATE;
                    } 
                    else {
                        burndownTask = burndownType.OK;
                    }
                } 
                else 
                {
                    burndownTask = burndownType.OK;
                }
                
                mainTask.burndownArray.push(burndownTask);
            }
        })

        var StartdatesSubTasks = mainTask.subTasks.map(s => s.startDate);
        var EndDatesSubTasks = mainTask.subTasks.map(s => s.endDate);

        var minDateSubTasks = StartdatesSubTasks.reduce(function (a, b) { return a < b ? a : b; });
        var maxDateSubTasks = EndDatesSubTasks.reduce(function (a, b) { return a > b ? a : b; });

        mainTask.startDate = new Date(minDateSubTasks);
        mainTask.endDate = new Date(maxDateSubTasks);

        MAIN_TASKS.push(mainTask);

        id++;
    })

    changeTimeDomain("1year");
    maingantt = d3.gantt().taskTypes(taskGroups).taskStatus(taskStatus).tickFormat(format);
    subgantt = d3.gantt().taskTypes(subtaskGroups[0]).taskStatus(taskStatus).tickFormat(format);

    maingantt.timeDomainMode("fit");
    subgantt.timeDomainMode("fit");

    gantt = maingantt;

    CURRENT_TASKS = MAIN_TASKS;

    console.log(CURRENT_TASKS);
    gantt.redraw(CURRENT_TASKS);
}

async function getCommits() {
    clear();
    var url = "https://api.github.com/search/commits?q=repo:"
    url = url.concat(document.getElementById("giturl").value, " author-date:2019-03-01..2019-03-31")
    
    const headers = {
        "Accept": "application/vnd.github.cloak-preview"
    }

    const response = await fetch(url, {
        "method": "GET",
        "headers": headers
    })
    //"<https://api.github.com/search/commits?q=repo%3Afreecodecamp%2Ffreecodecamp+author-date%3A2019-03-01..2019-03-31&page=2>; rel="next", <https://api.github.com/search/commits?q=repo%3Afreecodecamp%2Ffreecodecamp+author-date%3A2019-03-01..2019-03-31&page=27>; rel="last""

    const link = response.headers.get("link")
    const links = link.split(",")
    const urls = links.map(a => {
        return {
            url: a.split(";")[0].replace(">", "").replace("<", ""),
            title: a.split(";")[1]
        }

    })
    const result = await response.json()

    console.log(result);

    result.items.forEach(i => {
        const img = document.createElement("img")
        img.src = i.author.avatar_url;
        img.style.width = "32px"
        img.style.height = "32px"
        const anchor = document.createElement("a")
        anchor.href = i.html_url;
        anchor.textContent = i.commit.message.substr(0, 120) + "...";
        divResult.appendChild(img)
        divResult.appendChild(anchor)
        divResult.appendChild(document.createElement("br"))


    })


    urls.forEach(u => {
        const btn = document.createElement("button")
        btn.textContent = u.title;
        btn.addEventListener("click", e => getCommits(u.url))
        divResult.appendChild(btn);
    })

}

function getMilestonesFiltered(resultFiltered)
{
    var milestonesFiltered = [];

    var IdsMilestones = resultFiltered.map(r => r.milestone.id);
    var IdsMilestonesFiltered = IdsMilestones.filter(function(elem, index, array) { return array.indexOf(elem) === index });
    var milestones = resultFiltered.map(r => r.milestone);

    var listAux = []
    for(var j = 0; j < milestones.length; j++)
    {
        if(IdsMilestonesFiltered.indexOf(milestones[j].id) >= 0 && milestonesFiltered && listAux.indexOf(milestones[j].id) < 0)
        {
            milestonesFiltered.push(milestones[j]);
            listAux.push(milestones[j].id);
        }
    }
    return milestonesFiltered
}