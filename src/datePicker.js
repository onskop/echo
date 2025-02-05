class DatePicker {
    constructor(container, options = {}) {
        this.container = container;
        this.name = options.name || '';
        this.required = options.required || false;
        this.label = options.label || '';
        
        this.render();
        this.setupListeners();
    }

    render() {
        this.container.innerHTML = `
            <div class="dlg-field-container">
                ${this.label ? `<label class="dlg-label">${this.label}</label>` : ''}
                <div class="date-input-wrapper">
                    <input type="text" 
                           class="dlg-input date-display" 
                           placeholder="dd.mm.yyyy" 
                           pattern="\\d{2}\\.\\d{2}\\.\\d{4}"
                           ${this.required ? 'required' : ''}>
                    <input type="date" 
                           class="date-native" 
                           name="${this.name}"
                           ${this.required ? 'required' : ''}>
                    <button type="button" class="date-picker-button">
                        <i class="fas fa-calendar-alt"></i>
                    </button>
                </div>
            </div>
        `;

        this.displayInput = this.container.querySelector('.date-display');
        this.nativeInput = this.container.querySelector('.date-native');
        this.button = this.container.querySelector('.date-picker-button');
    }

    setupListeners() {
        this.nativeInput.addEventListener('change', () => {
            this.displayInput.value = this.nativeInput.value ? 
                this.formatDate(this.nativeInput.value) : '';
        });

        this.button.addEventListener('click', () => {
            this.nativeInput.showPicker();
        });

        this.displayInput.addEventListener('input', () => {
            if (!this.displayInput.value) {
                this.nativeInput.value = '';
                this.displayInput.classList.remove('invalid');
                return;
            }
    
            const datePattern = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
            if (datePattern.test(this.displayInput.value)) {
                const [day, month, year] = this.displayInput.value.split('.');
                
                // Validate actual date values
                const date = new Date(year, month - 1, day);
                const isValidDate = date.getFullYear() == year && 
                                  (date.getMonth() + 1) == month && 
                                  date.getDate() == day;
    
                if (isValidDate) {
                    this.nativeInput.value = this.parseDateString(this.displayInput.value);
                    this.displayInput.classList.remove('invalid');
                } else {

                    this.displayInput.classList.add('invalid');
                }
            } else {

                this.displayInput.classList.add('invalid');
            }
        });

    }

    formatDate(dateString) {
        // If dateString is empty, return empty string
        if (!dateString) return '';
        
        let date;
        if (dateString.includes('-')) {
            // Handle YYYY-MM-DD format
            const [year, month, day] = dateString.split('-');
            date = new Date(year, parseInt(month) - 1, day);
        } else {
            date = new Date(dateString);
        }
    
        if (isNaN(date.getTime())) {
            console.warn('Invalid date in formatDate:', dateString);
            return '';
        }
    
        return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
    }

    parseDateString(dateString) {
        const [day, month, year] = dateString.split('.');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    getValue() {
        this.displayInput.classList.remove('invalid');
        return this.nativeInput.value || null;
    }

    setReadOnly(readOnly) {
        this.displayInput.readOnly = readOnly;
        this.nativeInput.readOnly = readOnly;
        this.button.disabled = readOnly;
        
        if (readOnly) {
            this.displayInput.style.backgroundColor = '#f0f0f0';
            this.button.style.opacity = '0.5';
        } else {
            this.displayInput.style.backgroundColor = '';
            this.button.style.opacity = '';
        }
    }

    setValue(value) {
        if (!value || value === '') {
            this.nativeInput.value = '';
            this.displayInput.value = '';
            return;
        }
    
        // If value is in dd.mm.yyyy format, parse it for native input
        if (value.includes('.')) {
            this.displayInput.value = value;
            this.nativeInput.value = this.parseDateString(value);
        } else {
            // Otherwise assume YYYY-MM-DD format
            this.nativeInput.value = value;
            this.displayInput.value = this.formatDate(value);
        }
    }


    
}