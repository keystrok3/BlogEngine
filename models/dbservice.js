const mysql = require('mysql');

require('dotenv').config();

const connection = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: 'veritas',
    database: 'BlogDB'
});

connection.connect(err => {
    if(err) console.error(err);
    console.log('DB '+connection.state);
});

//Add new user to database
const register_user = function(user_name, email, password) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO users (user_id, user_name, email, passwd)\
                VALUES (NULL, "${user_name}", "${email}", "${password}");`;
        connection.query(query, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

// Get user by ther username
const find_user = function(username) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM users WHERE user_name = ${username};`;
        connection.query(query, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

// Get user by their insertId
const findById = function(id) {
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM users WHERE user_id = ?;`;
        connection.query(query, id, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

const update_email = function(email, id) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE users SET email = ? WHERE user_id = ?;`;
        connection.query(query, [email, id], (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

const update_username = function(username, id) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE users SET user_name = ? WHERE user_id = ?;`;
        connection.query(query, [username, id], (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

// remove user
const deleteuser = function(id) {
    connection.beginTransaction( function(err){
        if(err) reject(err);
        connection.query('DELETE FROM users WHERE user_id = ?', id, (err, result) => {
            if(err) {
                connection.rollback(() => {
                    throw err;
                });
            }
        });
        connection.query('DELETE FROM posts WHERE user_id = ?', id, (err, result) => {
            if(err) {
                connection.rollback(() => {
                    throw err;
                });
            }
            connection.commit((err) => {
                if(err) {
                    connection.rollback(() => {
                        throw err;
                    });
                }
                connection.end();
            });
        });
    });
};

//Users posts C-R-U-D operations

// Create post
const create_post = function(title, body, userId) {
    return new Promise((resolve, reject) => {
        let query = `INSERT INTO posts (post_id, user_id, title, body) \
                    VALUES (NULL, ?, ?, ?);`;
        connection.query(query, [userId, title, body], (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

//Retrieve posts
//----Get all posts from one user
const get_all_posts_from_one = function(id) {
    return new Promise((resolve, reject) => {
        let query = `SELECT title, body FROM posts WHERE user_id = ?;`;
        connection.query(query, id, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

//----Get one post from one post from one user
const get_one_post = function(userId, postId) {
    return new Promise((resolve, reject) => {
        let query = `SELECT title, body FROM posts WHERE user_id = ? AND post_id = ?;`;
        connection.query(query, [userId, postId], (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

//----Get all posts from all users
const get_all_posts = function() {
    return new Promise((resolve, reject) => {
        let query = `SELECT posts.user_id, DAYNAME(posttime) AS DAY, MONTHNAME(posttime) AS MONTH, YEAR(posttime) AS YEAR, \
                     posts.title, posts.body, users.user_name FROM posts INNER JOIN users ON posts.user_id = users.user_id;`;
        connection.query(query, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};


// Edit post
const update_post = function(title, body, postId) {
    return new Promise((resolve, reject) => {
        let query = `UPDATE posts SET title = ? , body = ? WHERE postId = ?;`;
        connection.query(query, [title, body, postId, userId], (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};

// Delete post 
const delete_post = function(postId) {
    return new Promise((resolve, reject) => {
        let query = `DELETE FROM posts WHERE postId = ?;`;
        connection.query(query, postId, (err, results) => {
            if(err) reject(err);
            resolve(results);
        });
    });
};



module.exports = { register_user, find_user, update_email, update_username, findById, deleteuser, create_post, get_all_posts_from_one, 
                    get_one_post, get_all_posts, update_post, delete_post };