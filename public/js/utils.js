MAIN_OPTIONS = ["Backend", "Frontend", "API", "Design"]
SUB_OPTIONS = ["Add", "Bug", "Change", "File", "Fix", "New", "Patch", "Support","Test"]

function changeVision(){
    cleanRects()
    $('#taskGroup').empty()
    $('#taskType').empty()

    if(IS_SUBTASK_VIZ){
        gantt = subgantt
        subtaskGroups.forEach(d => 
            $('#taskGroup').append(`<option value="${d}"> 
                ${d} 
            </option>`));
        SUB_OPTIONS.forEach(d => 
            $('#taskType').append(`<option value="${d}"> 
                ${d} 
            </option>`));
            
    }
    else{
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

function addMinutes(date, minutes) {
    return date.setMinutes( date.getMinutes() + minutes );
}