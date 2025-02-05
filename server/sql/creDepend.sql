CREATE TABLE dependenciesData (
    id INT IDENTITY(1,1) PRIMARY KEY,
    schedulerID NVARCHAR(255),
    type INT,
    cls NVARCHAR(255),
    fromSide NVARCHAR(255),
    toSide NVARCHAR(255),
    lag INT,
    lagUnit NVARCHAR(255),
    fromEvent INT,
    toEvent INT,
    active BIT
);