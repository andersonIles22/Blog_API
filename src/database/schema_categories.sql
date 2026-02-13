CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR (50),
    created_at LOCALTIMESTAMP DEFAULT NOW(),
    CONSTRAINT name_key_unique UNIQUE(name)
);

CREATE TABLE post_categories(
    post_id INT,
    category_id INT,
    PRIMARY KEY(post_id,category_id),
    CONSTRAINT post_id_key_foreign FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    CONSTRAINT category_id_key_foreign FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
