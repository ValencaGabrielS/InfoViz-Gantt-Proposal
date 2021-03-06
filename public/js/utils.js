MAIN_OPTIONS = ["Backend", "Frontend", "API", "Design"]
SUB_OPTIONS = ["Add", "Bug", "Change", "File", "Fix", "New", "Patch", "Support","Test"]

const burndownType = {
    OK: 1,
    LATE: 2,
    EARLY: 3,
} 

function changeVision(idMainTask){
    cleanRects()
    $('#taskGroup').empty()
    $('#taskType').empty()

    if(IS_SUBTASK_VIZ){
        $('#chartLabel').text("SUBTASKS")
        gantt = subgantt
        subtaskGroups[idMainTask].forEach(d => 
            $('#taskGroup').append(`<option value="${d}"> 
                ${d} 
            </option>`));
        SUB_OPTIONS.forEach(d => 
            $('#taskType').append(`<option value="${d}"> 
                ${d} 
            </option>`));
            
    }
    else{
        $('#chartLabel').text("SPRINTS")
        gantt = maingantt
        taskGroups.forEach(d => 
            $('#taskGroup').append(`<option value="${d}"> 
                ${d} 
            </option>`));
        MAIN_OPTIONS.forEach(d => 
            $('#taskType').append(`<option value="${d}"> 
                ${d} 
            </option>`));
    }
}

function filterById(jsonObject, id) {
    return jsonObject.filter(function(jsonObject) {return (jsonObject['id'] == id);})[0];
}

function setGradient(dayArr){
    
    var colors = "linear-gradient(90deg,"
    
    const ok = "#34eb96"
    const late = "#eb5634"
    const early = "#34bdeb"

    for(var i = 0 ; i < dayArr.length ; i++ ){
        switch(dayArr[i]){
            case(burndownType.OK || "ok"):
                colors += ok 
                break
            case(burndownType.LATE || "late"):
                colors += late
                break
            case(burndownType.EARLY || "early"):
                colors += early
                break
            default:
        }
        if ( i < dayArr.length - 1)
            colors += ","
    }

    colors += ")"
    
    //document.getElementById("burndown").style.backgroundImage = colors;
    $("#burndown").css("background-image", colors);
    return colors
}

function addMinutes(date, minutes) {
    return date.setMinutes( date.getMinutes() + minutes );
}

function getEndMonthDate(){
    var today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0);
    return lastDayOfMonth;
}

function getWeekendDate(){
    
    dt = new Date(); 
    var lastday = dt.getDate() - (dt.getDay() - 1) + 6;
    
    return new Date(dt.setDate(lastday));
}

function getTomorrowDate(){
    var tomorrow = new Date();
    tomorrow.setDate(new Date().getDate()+1);
    tomorrow.setHours(0,0,0,0);
    return tomorrow;
}