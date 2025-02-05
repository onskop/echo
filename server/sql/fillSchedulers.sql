INSERT INTO schedulersData (
    schedulerID, expanded, hoursPerDay, daysPerWeek, daysPerMonth, calendar, 
    startDate, endDate, duration, durationUnit, direction, manuallyScheduled, 
    unscheduled, unspecifiedTimeIsWorking, skipNonWorkingTimeWhenSchedulingManually, 
    skipNonWorkingTimeInDurationWhenSchedulingManually, percentDone, dependenciesCalendar, 
    autoCalculatePercentDoneForParentTasks, startedTaskScheduling, addConstraintOnDateSet, 
    autoScheduleManualTasksOnSecondPass, allowPostponedConflicts, autoPostponedConflicts, 
    autoMergeAdjacentSegments
) 
VALUES 
(
    1, 1, 24, 7, 30, NULL, 
    '2025-01-01 00:00:00', '2025-01-08 00:00:00', 7, 'day', 'Forward', 0, 
    0, 1, 0, 
    0, 0, 'ToEvent', 
    1, 'Auto', 1, 
    1, 0, 0, 
    1
);