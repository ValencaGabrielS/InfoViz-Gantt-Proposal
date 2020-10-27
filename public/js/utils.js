function filterById(jsonObject, id) {
    return jsonObject.filter(function(jsonObject) {return (jsonObject['id'] == id);})[0];
}

function addMinutes(date, minutes) {
    return date.setMinutes( date.getMinutes() + minutes );
}