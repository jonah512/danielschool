CREATE TABLE Log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    log TEXT NOT NULL,
    action_time DATETIME NOT NULL
);


CREATE TABLE Request (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    name TEXT NOT NULL,
    students TEXT NOT NULL,
    message TEXT NOT NULL,
    memo TEXT,
    request_time DATETIME NOT NULL,
    status TEXT NOT NULL
);
