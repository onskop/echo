CREATE TABLE assignmentsData (
    id INT IDENTITY(1,1) PRIMARY KEY,
    schedulerID NVARCHAR(255),
    units INT,
    resourceId INT,
    eventId INT
);