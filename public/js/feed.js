"use strict"
const feed = document.querySelector('.feed');

function newest_post(person, day, month, year, title, post) {
    let html = `<div class='feed-item'>
                    <div><p>${person}</p>.<p>${day} ${month} ${year}</p></div>
                    <div class='post'>
                        <h2>${title}</h2>
                        <hr>
                        ${post}
                    </div>
                </div>`;
}