const searchForm = document.getElementById("search-form");
const usernameInput = document.getElementById("username");
const profileContainer = document.getElementById("profile-container");
const themeToggle = document.getElementById("theme-toggle");

function formatDate(dateString){
    const date =  new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString("default", {
        month:"short"
    });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
}

async function getUser(username) {
    try{
        profileContainer.innerHTML = `<div class = "loading">
                                            <div class = "spinner"></div>
                                            <p>Loading...</p>
                                      </div>`;
        const url = `https://api.github.com/users/${username}`;
        const response = await fetch(url);
        if(response.status === 404){
    profileContainer.innerHTML = "<h2>User not found</h2>";
    return;
}

if(response.status === 403){
    profileContainer.innerHTML = `
        <h2>GitHub API rate limit exceeded.</h2>
        <p>Please try again after some time.</p>
    `;
    return;
}

if(!response.ok){
    profileContainer.innerHTML = `
        <h2>Something went wrong.</h2>
    `;
    return;
}
        const data = await response.json();
        const avatar = data.avatar_url;
        const name = data.name || data.login;
        const bio = data.bio || "No bio available";
        const joinDate = data.created_at;
        const portfolio = data.blog || "";
        const reposUrl = data.repos_url;
        profileContainer.innerHTML = `
            <div class = "profile-card">
                <img src = "${avatar}" alt = "${name}">
                <div class = "profile-info">
                    <h2>${name}</h2>
                    <p class = "bio">${bio}</p>
                    <p>Joined : ${formatDate(joinDate)}</p>
                    ${
                        portfolio
                         ? `<p>
                              Portfolio: <a href = "${portfolio}" target = "_blank">${portfolio}</a>
                            </p>`
                         :  `<p>Portfolio: Not Available</p>`
                    }
                </div>    
            </div>
            <div id = "repo-list"></div>`;
        getRepositories(reposUrl);
    }
    catch(error){
        profileContainer.innerHTML = "<h2>Something went wrong . Please try again.</h2>";
    }
}

async function getRepositories(url) {
    try {
        const response = await fetch(url);
        const repos = await response.json();
        const repoList = document.getElementById("repo-list");
        repoList.innerHTML = "";
        repoList.innerHTML += `
            <h2 class="repo-heading">Top Repositories</h2>
           `;
        for (const repo of repos.slice(0, 5)) {
            // Fetch README information
            const readmeResponse = await fetch(
                `https://api.github.com/repos/${repo.owner.login}/${repo.name}/readme`
            );

            let readmeUrl = "";
            if (readmeResponse.ok) {
                const readmeData = await readmeResponse.json();
                readmeUrl = readmeData.html_url;
            }

            repoList.innerHTML += `
                <div class="repo-card">
                    <a href="${repo.html_url}"
                       target="_blank"
                       rel="noopener noreferrer"
                       class="repo-name">
                        ${repo.name}
                    </a>

                    <p class="repo-language">
                        💻 <strong>Language:</strong>
                        ${repo.language || "Not Specified"}
                    </p>
                    ${
                        readmeUrl
                        ? `<a href="${readmeUrl}"
                              target="_blank"
                              rel="noopener noreferrer"
                              class="readme-link">
                                📖 README
                           </a>`
                        : `<p>No README Available</p>`
                    }
                </div>
            `;
        }
    }
    catch (error) {
        console.log(error);
    }
}

searchForm.addEventListener("submit",function(event){
    event.preventDefault();
    const username = usernameInput.value.trim();
    if(username === ""){
        alert("Please enter a username");
        return;
    }
    getUser(username);
});

const themeIcon = themeToggle.querySelector("i");

themeToggle.addEventListener("click",function(){
    document.body.classList.toggle("dark");
    if(document.body.classList.contains("dark")){
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
    }
    else{
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
    }
});

const savedTheme = localStorage.getItem("theme");
if(savedTheme==="dark"){
    document.body.classList.add("dark");
    themeIcon.classList.add("fa-sun");
}

