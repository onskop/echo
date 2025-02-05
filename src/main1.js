import { SchedulerPro, ProjectModel } from './build/schedulerpro.module.js';
import { initialData } from './data.js';
import { syncChanges, loadData, loadSchedulerSettings, saveSchedulerSettings } from './syncManager.js';
import { showMessage } from './utils.js';
import { config } from './config.js';

let syncEnabled = true;
let project = new ProjectModel(initialData);
let pendingChanges = {};
let localScheduler;
let schedName = 'scheduler1';
// INICIALIZATION AND DATA LOADING -------------------------------------------------------------------

async function initializeScheduler() {
    try {
        // Load settings first
        const settings = await loadSchedulerSettings(schedName);
        
        const scheduler1 = new SchedulerPro({
            appendTo: 'app1',
            height: 800,
            mode: settings.mode || 'horizontal',
            startDate: new Date(2025, 0, 1),
            endDate: new Date(2025, 0, 10),
            columns: [
                { text: 'Zdroj', field: 'name', width: 200 },
                { text: 'Popis', field: 'description', flex: 1 }
            ],
            project: project
        });

        syncEnabled = false;
        localScheduler = scheduler1; // name of scheduler will be only on top of the page

        // Initialize UI controls
        const sch1_btn1 = document.getElementById(`${schedName}-test-btn-1`);
        const sch1_btn2 = document.getElementById(`${schedName}-test-btn-2`);
        const sch1_btn3 = document.getElementById(`${schedName}-test-btn-3`);
        const sch1_btn4 = document.getElementById(`${schedName}-test-btn-4`);
        const sch1_btn5 = document.getElementById(`${schedName}-test-btn-5`);
        const sch1_btn6 = document.getElementById(`${schedName}-test-btn-6`);
        const sch1_check1 = document.getElementById(`${schedName}-settings-check-1`);
        const modeLabel = document.getElementById(`${schedName}-mode-label`);

        // Set initial checkbox state and label
        sch1_check1.checked = settings.mode === 'vertical';
        modeLabel.textContent = `Mode: ${settings.mode === 'vertical' ? 'Vertical' : 'Horizontal'}`;

        // Event Listeners
        sch1_btn1.addEventListener('click', () => { // add new resource
            const currentResources = localScheduler.resourceStore.toJSON(); // get current resources
            const newResourceNumber = currentResources.length + 1; // get new resource number
            const newResource = { 
                name: `Res${newResourceNumber}` 
            };
            localScheduler.resourceStore.add(newResource); // add new resource
        });

        sch1_btn2.addEventListener('click', () => { // console log events and resources
            console.log('Events:', localScheduler.eventStore.toJSON());
            console.log('Resources:', localScheduler.resourceStore.toJSON());
            console.log('Project:', localScheduler.project.toJSON());
        });

        sch1_btn3.addEventListener('click', () => { // dump schema
            console.log('Data content:', localScheduler.project.toJSON());
            const json = JSON.stringify(localScheduler.project.toJSON());
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${schedName}.json`;
            a.click();
        });

        sch1_btn4.addEventListener('click', async () => { // load schema
            try {
                syncEnabled = false;        
                const data = await loadData(schedName);
                
                localScheduler.resourceStore.clear();
                localScheduler.eventStore.clear();
                localScheduler.assignmentStore.clear();
                localScheduler.dependencyStore.clear();

                localScheduler.resourceStore.add(data.project.resourcesData);
                localScheduler.eventStore.add(data.project.eventsData);
                localScheduler.assignmentStore.add(data.project.assignmentsData);
                localScheduler.dependencyStore.add(data.project.dependenciesData);

                localScheduler.project.acceptChanges();
            } catch (error) {
                console.error('Error:', error);
                showMessage('Failed to load data', 'error');
            } finally {
                syncEnabled = true;
            }
        });

        sch1_btn5.addEventListener('click', async () => { // sync schema
            try {
                await syncChanges(pendingChanges, schedName);
                showMessage('Uloženo', 'success');
                sch1_btn5.style.outline = '2px solid green';
                localScheduler.project.acceptChanges();
                pendingChanges = {};

            } catch (error) {
                console.error('Error:', error);
                showMessage('Chyba: ' + error.message, 'error');
                sch1_btn5.style.outline = '2px solid red';
            }
        });




        sch1_check1.addEventListener('change', async (event) => {
            const isVertical = event.target.checked;
            const newMode = isVertical ? 'vertical' : 'horizontal';
            modeLabel.textContent = `Mode: ${isVertical ? 'Vertical' : 'Horizontal'}`;
            
            try {
                await saveSchedulerSettings(schedName, { mode: newMode });
                showMessage('Nastavení uloženo', 'success');
                window.location.reload();
            } catch (error) {
                console.error('Error saving settings:', error);
                showMessage('Chyba při ukládání nastavení', 'error');
            }
        });

        // Load initial data
        try {
            const data = await loadData(schedName);
            localScheduler.resourceStore.clear();
            localScheduler.eventStore.clear();
            localScheduler.assignmentStore.clear();
            localScheduler.dependencyStore.clear();

            localScheduler.resourceStore.add(data.project.resourcesData);
            localScheduler.eventStore.add(data.project.eventsData);
            localScheduler.assignmentStore.add(data.project.assignmentsData);
            localScheduler.dependencyStore.add(data.project.dependenciesData);
            
            // Re-enable sync after initialization is complete
            localScheduler.project.acceptChanges();
            syncEnabled = true;

            // Set up change listener for the scheduler after initial load
            localScheduler.project.on({
                hasChanges() {
                    const { changes } = this;
                    if (syncEnabled) {
                        console.log('Changes: ', changes);
                        sch1_btn5.style.outline = '2px solid red';
                        pendingChanges = changes;
                    } else {
                        console.log('Changes to accept:', changes);
                        this.acceptChanges();
                        console.log('Changes after accept:', this.changes);
                        pendingChanges = [];
                    }
                }
            });


            console.log('Init completed');

        } catch (error) {
            console.error('Error loading data:', error);
            showMessage('Error loading initial data', 'error');
        }
            
    } catch (error) {
        console.error('Error initializing scheduler:', error);
        showMessage('Error initializing scheduler', 'error');
    }
}

// Start initialization
initializeScheduler();