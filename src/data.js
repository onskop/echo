export const initialData = {
    resourcesData: [
        { id: 1, name: 'Dan Stevenson', description: 'Popis 1' },
        { id: 2, name: 'Talisha Babin', description: 'Popis 2' },
        { id: 3, name: 'John Doe', description: 'Popis 3' },
        { id: 4, name: 'John Doe', description: 'Popis 4' }
    ],
    eventsData: [
        { id: 1, startDate: '2025-01-01 13:00:00', duration: 3, durationUnit: 'd', name: 'Event 1', eventColor: 'red' },
        { id: 2, duration: 4, durationUnit: 'd', name: 'Event 2', eventColor: 'blue' }
    ],
    assignmentsData: [
        { event: 1, resource: 1 },
        { event: 2, resource: 4 }
    ],
    dependenciesData: [
        { fromEvent: 1, toEvent: 2 }
    ]
}; 

export const projectData2 = {
    resourcesData: [
        { id: 1, name: '113', description: 'Popis 1' },
        { id: 2, name: '114', description: 'Popis 2' },
        { id: 3, name: '115', description: 'Popis 3' },
        { id: 4, name: '116', description: 'Popis 4' }
    ],
    eventsData: [
        { id: 1, startDate: '2025-01-01', duration: 3, durationUnit: 'd', name: 'Event 1', eventColor: 'green' },
        { id: 2, duration: 4, durationUnit: 'd', name: 'Event 2', eventColor: 'blue' }
    ],
    assignmentsData: [
        { event: 1, resource: 1 },
        { event: 2, resource: 4 }
    ],
    dependenciesData: [
        { fromEvent: 1, toEvent: 2 }
    ]
}; 
