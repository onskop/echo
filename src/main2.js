import { SchedulerPro, ProjectModel } from './build/schedulerpro.module.js';
import { projectData2  } from './data.js';
import { showMessage } from './utils.js';
import { syncChanges } from './syncManager.js';

const project2 = new ProjectModel(projectData2);

console.log('SPUSTIL JSEM DVOJICKU');

const scheduler2 = new SchedulerPro({
    appendTo: 'app2',
    autoHeight: true,
    startDate: new Date(2025, 0, 1),
    endDate: new Date(2025, 0, 10),
    columns: [
        { text: 'Zdroj', field: 'name', width: 200 },
        { text: 'Popis', field: 'description', flex: 1 }
    ],
    project: project2
});

// Active components ---------------------------------------------------------------------------------
const sch2_btn1 = document.getElementById('scheduler2-test-btn-1');
const sch2_btn2 = document.getElementById('scheduler2-test-btn-2');
const sch2_btn3 = document.getElementById('scheduler2-test-btn-3');

const sch2_check1 = document.getElementById('scheduler2-settings-check-1');
const sch2_check2 = document.getElementById('scheduler2-settings-check-2');
const sch2_check3 = document.getElementById('scheduler2-settings-check-3');


// column settings ---------------------------------------------------------------------------------
const first = scheduler2.columns.get("name");
const second = scheduler2.columns.get("description");
first.width = 200;
second.flex = 2;

// resources table settings ---------------------------------------------------------------------------------
const zdroj = scheduler2.project.resourcesData;

// Event listeners ---------------------------------------------------------------------------------

sch2_btn1.addEventListener('click', () => {
    // Get current resources
    const currentResources = scheduler2.resourceStore.toJSON();
    
    // Create new resource with incremental name
    const newResourceNumber = currentResources.length + 1;
    const newResource = { 
        name: `Res${newResourceNumber}` 
    };
    
    scheduler2.resourceStore.add(newResource);
});

sch2_btn2.addEventListener('click', () => {
    console.log('Events:');
    console.log(scheduler2.eventStore.toJSON());
    console.log('Resources:');
    console.log(scheduler2.resourceStore.toJSON());

});

sch2_btn3.addEventListener('click', () => {
    showMessage('btn3 clicked', 'success', 3000);
});

scheduler2.on('eventclick', () => {
    console.log('eventclick ');
});

