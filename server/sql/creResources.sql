CREATE TABLE resourcesData (
    id INT IDENTITY(1,1) PRIMARY KEY,
    schedulerID INT,
    calendar VARCHAR(50),
    parentId VARCHAR(50),
    maxUnits INT,
    name VARCHAR(100),
    description TEXT
);