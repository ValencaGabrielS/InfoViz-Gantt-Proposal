const btnIssues = document.getElementById("btnIssues")
const btnCommits = document.getElementById("btnCommits")
const divResult = document.getElementById("divResult")
btnIssues.addEventListener("click", getIssues)
btnCommits.addEventListener("click", e=> getCommits())
function clear(){
    while(divResult.firstChild) 
        divResult.removeChild(divResult.firstChild)
}

async function getIssues() {
    clear();
    var url = "https://api.github.com/search/issues?q=repo:"
    url = url.concat(document.getElementById("giturl").value," type:issue state:closed");
    const response = await fetch(url)
    const result = await response.json()
    var count =0;

    result.items.forEach(i=>{
        count++;
        const anchor = document.createElement("a")
        anchor.href = i.html_url;
        anchor.textContent = i.title.concat(" ", count);
        divResult.appendChild(anchor)
        var info = "    ";
        info = info.concat("Descrição: ", i.body, "| Data estimada: ", i.due_on);
        info = info.concat("|    Cirado em: ", i.created_at, "|   fechado em:", i.closed_at)
        divResult.appendChild(document.createTextNode(info))
        divResult.appendChild(document.createElement("br"))
    })

}

 async function getCommits() {
clear();
var url="https://api.github.com/search/commits?q=repo:"
url= url.concat(document.getElementById("giturl").value," author-date:2019-03-01..2019-03-31")
const headers = {
    "Accept" : "application/vnd.github.cloak-preview"
}
const response = await fetch(url, {
    "method" : "GET",
    "headers" : headers
})
//"<https://api.github.com/search/commits?q=repo%3Afreecodecamp%2Ffreecodecamp+author-date%3A2019-03-01..2019-03-31&page=2>; rel="next", <https://api.github.com/search/commits?q=repo%3Afreecodecamp%2Ffreecodecamp+author-date%3A2019-03-01..2019-03-31&page=27>; rel="last""

const link = response.headers.get("link")
const links = link.split(",")
const urls = links.map(a=> {
    return {
        url: a.split(";")[0].replace(">","").replace("<",""),
        title:a.split(";")[1]
    }

})
const result = await response.json()

result.items.forEach(i=>{
    const img = document.createElement("img")
    img.src = i.author.avatar_url;
    img.style.width="32px"
    img.style.height="32px"
    const anchor = document.createElement("a")
    anchor.href = i.html_url;
    anchor.textContent = i.commit.message.substr(0,120) + "...";
    divResult.appendChild(img)
    divResult.appendChild(anchor)
    divResult.appendChild(document.createElement("br"))


})


urls.forEach(u => {
    const btn = document.createElement("button")
    btn.textContent = u.title;
    btn.addEventListener("click", e=> getCommits(u.url))
    divResult.appendChild(btn);
})

}
