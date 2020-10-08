CREATE DATABASE BlogDB;

USE BlogDB;

CREATE TABLE users (
    user_id INT AUTO_INCREMENT,
    user_name VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(125) NOT NULL UNIQUE,
    passwd VARCHAR(255) NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (user_id)
);

CREATE TABLE posts (
    post_id INT AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(255),
    body VARCHAR(255),
    posttime timestamp,
    CONSTRAINT pk_posts PRIMARY KEY (post_id),
    CONSTRAINT fk_posts FOREIGN KEY (user_id) REFERENCES users (user_id)
);
