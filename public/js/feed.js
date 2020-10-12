const feed = document.querySelector('.feed');

//Create a post out of data from the database
function feedpost(username, day, month, year, title, body) {
    let html = `
                    <div class="card">
                        <h5 class="card-header"><i>${username}</i> ${day}, ${month} ${year}</h5>
                        <div class="card-body">
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">${body}</p>
                        <a href="/post.ejs" id='post-btn' class="btn btn-primary">Read More</a>
                        </div>
                    </div>
                `;
    feed.insertAdjacentHTML("beforebegin", html);
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        let response = await fetch('http://localhost:3000/getallposts');
        if(response.ok) {
            let data = await response.json();
            let mydata = data.post_feed;
            for(let i = 0; i < mydata.username.length; i++) {
                feedpost(mydata.username[i], mydata.day[i], mydata.month[i], mydata.year[i], mydata.title[i], mydata.body[i]);
            }
        }
    } catch(error) {
        console.log(error);
    }
});