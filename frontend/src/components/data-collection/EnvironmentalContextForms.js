/**
 * Environmental Context Forms
 * Weather, noise level, social setting, and environmental factors assessment
 */

class EnvironmentalContextCollection {
    constructor() {
        this.responses = {};
        this.currentContext = {};
        this.isCollecting = false;
        this.sensors = {
            audio: null,
            light: null,
            motion: null
        };
        this.weatherData = null;
        this.locationContext = null;
    }

    // Initialize environmental sensing capabilities
    async initializeSensors() {
        try {
            // Initialize audio level monitoring
            await this.initializeAudioSensor();
            
            // Initialize light sensor if available
            if ('AmbientLightSensor' in window) {
                await this.initializeLightSensor();
            }

            // Initialize motion sensor if available
            if ('DeviceMotionEvent' in window) {
                this.initializeMotionSensor();
            }

        } catch (error) {
            console.warn('Environmental sensors initialization failed:', error);
        }
    }

    // Initialize audio level monitoring
    async initializeAudioSensor() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false
                } 
            });
            
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            
            analyser.fftSize = 2048;
            microphone.connect(analyser);
            
            this.sensors.audio = {
                stream,
                audioContext,
                analyser,
                microphone,
                dataArray: new Uint8Array(analyser.frequencyBinCount)
            };

        } catch (error) {
            console.warn('Audio sensor initialization failed:', error);
        }
    }

    // Initialize light sensor
    async initializeLightSensor() {
        try {
            const sensor = new AmbientLightSensor({ frequency: 1 });
            sensor.addEventListener('reading', () => {
                this.currentContext.lightLevel = sensor.illuminance;
            });
            sensor.start();
            this.sensors.light = sensor;
        } catch (error) {
            console.warn('Light sensor initialization failed:', error);
        }
    }

    // Initialize motion sensor
    initializeMotionSensor() {
        const handleMotion = (event) => {
            this.currentContext.motion = {
                acceleration: event.acceleration,
                accelerationIncludingGravity: event.accelerationIncludingGravity,
                rotationRate: event.rotationRate,
                timestamp: Date.now()
            };
        };

        window.addEventListener('devicemotion', handleMotion);
        this.sensors.motion = { active: true, handler: handleMotion };
    }

    // Get current noise level
    getCurrentNoiseLevel() {
        if (!this.sensors.audio) return null;

        const { analyser, dataArray } = this.sensors.audio;
        analyser.getByteFrequencyData(dataArray);
        
        // Calculate RMS (Root Mean Square) for volume level
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        
        // Convert to decibel approximation
        const decibels = 20 * Math.log10(rms / 255);
        
        return {
            rms,
            decibels: Math.max(0, decibels + 100), // Normalize to positive range
            timestamp: Date.now()
        };
    }

    // Fetch weather data
    async fetchWeatherData(latitude, longitude) {
        try {
            // Use OpenWeatherMap API (free tier)
            const apiKey = 'your_openweathermap_api_key'; // Would be configured
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Weather API error: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.weatherData = {
                temperature: data.main.temp,
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                weather_condition: data.weather[0].main,
                weather_description: data.weather[0].description,
                wind_speed: data.wind?.speed || 0,
                wind_direction: data.wind?.deg || 0,
                visibility: data.visibility || null,
                cloud_cover: data.clouds?.all || 0,
                timestamp: new Date().toISOString(),
                source: 'openweathermap'
            };

            return this.weatherData;
        } catch (error) {
            console.warn('Weather data fetch failed:', error);
            // Return manual weather input form
            return null;
        }
    }

    // Create environmental context form
    createEnvironmentalContextForm() {
        const container = document.createElement('div');
        container.className = 'environmental-context-container';
        container.innerHTML = `
            <div class="context-header">
                <h3>Environmental Context</h3>
                <p>Information about your current environment and surroundings</p>
            </div>

            <div class="context-sections">
                <!-- Weather Information -->
                <div class="context-section weather-section">
                    <h4>🌤️ Weather & Climate</h4>
                    <div id="weather-auto" class="auto-detection">
                        <div class="auto-status">
                            <span id="weather-status">🔄 Fetching weather data...</span>
                        </div>
                        <div id="weather-display" class="weather-display" style="display: none;">
                            <!-- Auto-populated weather data -->
                        </div>
                    </div>
                    
                    <div class="manual-weather" id="manual-weather">
                        <h5>Manual Weather Entry</h5>
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="temperature">Temperature (°C):</label>
                                <input type="number" id="temperature" step="0.1" 
                                       placeholder="e.g., 22.5" class="context-input">
                            </div>
                            <div class="form-group">
                                <label for="weather-condition">Weather Condition:</label>
                                <select id="weather-condition" class="context-select">
                                    <option value="">Select condition</option>
                                    <option value="clear">Clear/Sunny</option>
                                    <option value="partly_cloudy">Partly Cloudy</option>
                                    <option value="cloudy">Cloudy/Overcast</option>
                                    <option value="light_rain">Light Rain</option>
                                    <option value="heavy_rain">Heavy Rain</option>
                                    <option value="snow">Snow</option>
                                    <option value="fog">Fog/Mist</option>
                                    <option value="storm">Storm/Thunderstorm</option>
                                    <option value="wind">Windy</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="humidity-perceived">Perceived Humidity:</label>
                                <select id="humidity-perceived" class="context-select">
                                    <option value="">Select humidity level</option>
                                    <option value="very_dry">Very Dry</option>
                                    <option value="dry">Dry</option>
                                    <option value="comfortable">Comfortable</option>
                                    <option value="humid">Humid</option>
                                    <option value="very_humid">Very Humid</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Noise Level -->
                <div class="context-section noise-section">
                    <h4>🔊 Sound Environment</h4>
                    <div id="noise-auto" class="auto-detection">
                        <div class="noise-meter">
                            <div class="meter-display">
                                <div id="noise-level-bar" class="noise-bar">
                                    <div id="noise-level-fill" class="noise-fill"></div>
                                </div>
                                <span id="noise-level-text">-- dB</span>
                            </div>
                            <button id="start-noise-measurement" class="measure-btn">
                                Start Noise Measurement
                            </button>
                        </div>
                    </div>
                    
                    <div class="manual-noise">
                        <h5>Perceived Noise Level</h5>
                        <div class="noise-scale">
                            <label class="noise-option">
                                <input type="radio" name="noise-level" value="very_quiet">
                                <span class="noise-label">Very Quiet (library-like)</span>
                            </label>
                            <label class="noise-option">
                                <input type="radio" name="noise-level" value="quiet">
                                <span class="noise-label">Quiet (soft conversation)</span>
                            </label>
                            <label class="noise-option">
                                <input type="radio" name="noise-level" value="moderate">
                                <span class="noise-label">Moderate (normal conversation)</span>
                            </label>
                            <label class="noise-option">
                                <input type="radio" name="noise-level" value="loud">
                                <span class="noise-label">Loud (busy street)</span>
                            </label>
                            <label class="noise-option">
                                <input type="radio" name="noise-level" value="very_loud">
                                <span class="noise-label">Very Loud (construction)</span>
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label for="noise-sources">Primary Noise Sources (select all that apply):</label>
                            <div class="checkbox-group">
                                <label><input type="checkbox" value="traffic">Traffic</label>
                                <label><input type="checkbox" value="construction">Construction</label>
                                <label><input type="checkbox" value="people_talking">People Talking</label>
                                <label><input type="checkbox" value="music">Music</label>
                                <label><input type="checkbox" value="nature">Nature Sounds</label>
                                <label><input type="checkbox" value="machinery">Machinery</label>
                                <label><input type="checkbox" value="aircraft">Aircraft</label>
                                <label><input type="checkbox" value="other">Other</label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Social Setting -->
                <div class="context-section social-section">
                    <h4>👥 Social Environment</h4>
                    <div class="form-group">
                        <label for="social-setting">Current Social Setting:</label>
                        <select id="social-setting" class="context-select" required>
                            <option value="">Select setting</option>
                            <option value="alone">Alone</option>
                            <option value="family">With Family</option>
                            <option value="friends">With Friends</option>
                            <option value="coworkers">With Coworkers</option>
                            <option value="strangers">Around Strangers</option>
                            <option value="mixed_group">Mixed Group</option>
                            <option value="public_alone">Alone in Public</option>
                            <option value="public_social">Social in Public</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="crowd-density">Crowd Density:</label>
                        <select id="crowd-density" class="context-select">
                            <option value="">Select density</option>
                            <option value="empty">Empty/Deserted</option>
                            <option value="sparse">Sparse (few people)</option>
                            <option value="moderate">Moderate (some people)</option>
                            <option value="busy">Busy (many people)</option>
                            <option value="crowded">Crowded (packed)</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="social-interaction">Level of Social Interaction:</label>
                        <select id="social-interaction" class="context-select">
                            <option value="">Select interaction level</option>
                            <option value="none">No interaction</option>
                            <option value="minimal">Minimal (brief exchanges)</option>
                            <option value="moderate">Moderate (conversations)</option>
                            <option value="high">High (active socializing)</option>
                            <option value="intense">Intense (deep conversations)</option>
                        </select>
                    </div>
                </div>

                <!-- Location Type -->
                <div class="context-section location-section">
                    <h4>📍 Location Context</h4>
                    <div class="form-group">
                        <label for="location-type">Type of Location:</label>
                        <select id="location-type" class="context-select" required>
                            <option value="">Select location type</option>
                            <option value="home_indoor">Home (Indoor)</option>
                            <option value="home_outdoor">Home (Outdoor/Garden)</option>
                            <option value="workplace">Workplace/Office</option>
                            <option value="school">School/Educational</option>
                            <option value="healthcare">Healthcare Facility</option>
                            <option value="retail">Retail/Shopping</option>
                            <option value="restaurant">Restaurant/Cafe</option>
                            <option value="entertainment">Entertainment Venue</option>
                            <option value="transportation">Transportation</option>
                            <option value="park_nature">Park/Nature Area</option>
                            <option value="urban_outdoor">Urban Outdoor</option>
                            <option value="religious">Religious Building</option>
                            <option value="community">Community Center</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="indoor-outdoor">Indoor/Outdoor:</label>
                        <select id="indoor-outdoor" class="context-select">
                            <option value="">Select setting</option>
                            <option value="indoor">Indoor</option>
                            <option value="outdoor">Outdoor</option>
                            <option value="semi_outdoor">Semi-outdoor (covered)</option>
                            <option value="transitioning">Transitioning</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="familiarity">Familiarity with Location:</label>
                        <select id="familiarity" class="context-select">
                            <option value="">Select familiarity</option>
                            <option value="very_familiar">Very Familiar (daily)</option>
                            <option value="familiar">Familiar (weekly)</option>
                            <option value="somewhat_familiar">Somewhat Familiar</option>
                            <option value="unfamiliar">Unfamiliar</option>
                            <option value="first_time">First Time</option>
                        </select>
                    </div>
                </div>

                <!-- Lighting & Visual Environment -->
                <div class="context-section lighting-section">
                    <h4>💡 Lighting & Visual Environment</h4>
                    <div id="light-auto" class="auto-detection">
                        <div class="light-reading">
                            <span id="light-level-text">Light level: Detecting...</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="lighting-type">Primary Lighting:</label>
                        <select id="lighting-type" class="context-select">
                            <option value="">Select lighting type</option>
                            <option value="natural_bright">Natural Light (Bright)</option>
                            <option value="natural_dim">Natural Light (Dim)</option>
                            <option value="artificial_bright">Artificial Light (Bright)</option>
                            <option value="artificial_dim">Artificial Light (Dim)</option>
                            <option value="mixed">Mixed Lighting</option>
                            <option value="low_light">Low Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="visual-comfort">Visual Comfort:</label>
                        <select id="visual-comfort" class="context-select">
                            <option value="">Rate visual comfort</option>
                            <option value="very_comfortable">Very Comfortable</option>
                            <option value="comfortable">Comfortable</option>
                            <option value="neutral">Neutral</option>
                            <option value="uncomfortable">Uncomfortable</option>
                            <option value="very_uncomfortable">Very Uncomfortable</option>
                        </select>
                    </div>
                </div>

                <!-- Additional Environmental Factors -->
                <div class="context-section additional-section">
                    <h4>🌿 Additional Environmental Factors</h4>
                    <div class="form-group">
                        <label for="air-quality">Perceived Air Quality:</label>
                        <select id="air-quality" class="context-select">
                            <option value="">Select air quality</option>
                            <option value="excellent">Excellent (fresh, clean)</option>
                            <option value="good">Good</option>
                            <option value="moderate">Moderate</option>
                            <option value="poor">Poor (stuffy, polluted)</option>
                            <option value="very_poor">Very Poor</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="comfort-level">Overall Environmental Comfort:</label>
                        <select id="comfort-level" class="context-select">
                            <option value="">Rate overall comfort</option>
                            <option value="very_comfortable">Very Comfortable</option>
                            <option value="comfortable">Comfortable</option>
                            <option value="neutral">Neutral</option>
                            <option value="uncomfortable">Uncomfortable</option>
                            <option value="very_uncomfortable">Very Uncomfortable</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="distractions">Environmental Distractions (select all that apply):</label>
                        <div class="checkbox-group">
                            <label><input type="checkbox" value="noise">Excessive Noise</label>
                            <label><input type="checkbox" value="visual">Visual Distractions</label>
                            <label><input type="checkbox" value="crowding">Crowding</label>
                            <label><input type="checkbox" value="temperature">Temperature Issues</label>
                            <label><input type="checkbox" value="smells">Strong Smells</label>
                            <label><input type="checkbox" value="movement">Constant Movement</label>
                            <label><input type="checkbox" value="technology">Technology/Screens</label>
                            <label><input type="checkbox" value="none">No Distractions</label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="context-validation" id="context-validation">
                <!-- Validation feedback -->
            </div>

            <div class="context-actions">
                <button id="auto-detect-all" class="auto-detect-btn">
                    🔄 Auto-Detect All Environmental Factors
                </button>
                <button id="clear-environmental" class="clear-btn">
                    🗑️ Clear All Environmental Data
                </button>
            </div>
        `;

        this.attachEnvironmentalEventListeners(container);
        return container;
    }

    // Attach event listeners
    attachEnvironmentalEventListeners(container) {
        // Auto-detection button
        const autoDetectBtn = container.querySelector('#auto-detect-all');
        autoDetectBtn.addEventListener('click', () => {
            this.startAutoDetection();
        });

        // Clear button
        const clearBtn = container.querySelector('#clear-environmental');
        clearBtn.addEventListener('click', () => {
            this.clearEnvironmentalData();
        });

        // Noise measurement button
        const noiseMeasureBtn = container.querySelector('#start-noise-measurement');
        noiseMeasureBtn.addEventListener('click', () => {
            this.startNoiseMeasurement();
        });

        // Form input listeners
        const inputs = container.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                this.saveEnvironmentalResponse(input.id || input.name, input);
                this.validateEnvironmentalData();
            });
        });

        // Checkbox group listeners
        const checkboxGroups = container.querySelectorAll('.checkbox-group');
        checkboxGroups.forEach(group => {
            const checkboxes = group.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', () => {
                    this.saveCheckboxGroupResponse(group, checkboxes);
                });
            });
        });
    }

    // Start comprehensive auto-detection
    async startAutoDetection() {
        this.isCollecting = true;
        const statusElement = document.getElementById('weather-status');
        
        try {
            statusElement.textContent = '🔄 Starting environmental detection...';

            // Get location for weather data
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Fetch weather data
                    statusElement.textContent = '🌤️ Fetching weather data...';
                    await this.fetchWeatherData(latitude, longitude);
                    this.displayAutoWeatherData();
                    
                    statusElement.textContent = '✅ Environmental data updated';
                });
            }

            // Start noise measurement
            await this.startNoiseMeasurement();

            // Update light sensor reading
            this.updateLightReading();

        } catch (error) {
            console.error('Auto-detection failed:', error);
            statusElement.textContent = '❌ Auto-detection failed - please enter manually';
        }
    }

    // Start noise measurement
    async startNoiseMeasurement() {
        if (!this.sensors.audio) {
            await this.initializeSensors();
        }

        if (this.sensors.audio) {
            const measureBtn = document.getElementById('start-noise-measurement');
            const noiseLevelText = document.getElementById('noise-level-text');
            const noiseLevelFill = document.getElementById('noise-level-fill');

            measureBtn.textContent = 'Measuring...';
            measureBtn.disabled = true;

            // Measure for 5 seconds
            const measurements = [];
            const measurementInterval = setInterval(() => {
                const noiseLevel = this.getCurrentNoiseLevel();
                if (noiseLevel) {
                    measurements.push(noiseLevel.decibels);
                    
                    // Update UI in real-time
                    noiseLevelText.textContent = `${Math.round(noiseLevel.decibels)} dB`;
                    noiseLevelFill.style.width = `${Math.min(noiseLevel.decibels, 100)}%`;
                }
            }, 200);

            setTimeout(() => {
                clearInterval(measurementInterval);
                
                if (measurements.length > 0) {
                    const avgNoise = measurements.reduce((a, b) => a + b) / measurements.length;
                    const maxNoise = Math.max(...measurements);
                    
                    this.responses['noise_level_auto'] = {
                        average_db: avgNoise,
                        max_db: maxNoise,
                        measurements: measurements,
                        timestamp: new Date().toISOString()
                    };

                    noiseLevelText.textContent = `${Math.round(avgNoise)} dB (avg)`;
                }

                measureBtn.textContent = 'Measure Again';
                measureBtn.disabled = false;
            }, 5000);
        }
    }

    // Display auto-detected weather data
    displayAutoWeatherData() {
        if (!this.weatherData) return;

        const weatherDisplay = document.getElementById('weather-display');
        const weatherStatus = document.getElementById('weather-status');
        
        weatherDisplay.innerHTML = `
            <div class="weather-info">
                <div class="weather-item">
                    <span class="weather-label">Temperature:</span>
                    <span class="weather-value">${this.weatherData.temperature}°C</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Condition:</span>
                    <span class="weather-value">${this.weatherData.weather_description}</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Humidity:</span>
                    <span class="weather-value">${this.weatherData.humidity}%</span>
                </div>
                <div class="weather-item">
                    <span class="weather-label">Wind:</span>
                    <span class="weather-value">${this.weatherData.wind_speed} m/s</span>
                </div>
            </div>
        `;
        
        weatherDisplay.style.display = 'block';
        weatherStatus.textContent = '✅ Weather data updated automatically';
    }

    // Update light sensor reading
    updateLightReading() {
        if (this.sensors.light) {
            const lightText = document.getElementById('light-level-text');
            lightText.textContent = `Light level: ${Math.round(this.currentContext.lightLevel || 0)} lux`;
        }
    }

    // Save environmental response
    saveEnvironmentalResponse(fieldId, input) {
        let value;
        
        if (input.type === 'checkbox') {
            value = input.checked;
        } else if (input.type === 'radio') {
            value = input.checked ? input.value : null;
        } else {
            value = input.value;
        }

        if (value !== null && value !== '') {
            this.responses[fieldId] = {
                value,
                timestamp: new Date().toISOString(),
                type: input.type
            };
        }

        this.saveToLocalStorage();
    }

    // Save checkbox group response
    saveCheckboxGroupResponse(group, checkboxes) {
        const checked = Array.from(checkboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const groupName = checkboxes[0].name || 'checkbox_group';
        
        this.responses[groupName] = {
            values: checked,
            timestamp: new Date().toISOString(),
            type: 'checkbox_group'
        };

        this.saveToLocalStorage();
    }

    // Validate environmental data
    validateEnvironmentalData() {
        const errors = [];
        
        // Check required fields
        const requiredFields = ['social-setting', 'location-type'];
        requiredFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element && element.required && !element.value) {
                errors.push(`${element.previousElementSibling.textContent} is required`);
            }
        });

        this.updateValidationFeedback(errors);
        return errors.length === 0;
    }

    // Update validation feedback
    updateValidationFeedback(errors) {
        const feedbackElement = document.getElementById('context-validation');
        if (!feedbackElement) return;

        if (errors.length > 0) {
            feedbackElement.innerHTML = `
                <div class="validation-errors">
                    <h4>Please complete the following:</h4>
                    <ul>
                        ${errors.map(error => `<li>${error}</li>`).join('')}
                    </ul>
                </div>
            `;
            feedbackElement.style.display = 'block';
        } else {
            feedbackElement.style.display = 'none';
        }
    }

    // Clear environmental data
    clearEnvironmentalData() {
        this.responses = {};
        this.currentContext = {};
        this.weatherData = null;
        
        // Clear form inputs
        const form = document.querySelector('.environmental-context-container');
        if (form) {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'checkbox' || input.type === 'radio') {
                    input.checked = false;
                } else {
                    input.value = '';
                }
            });
        }

        localStorage.removeItem('environmental_context_data');
        this.updateValidationFeedback([]);
    }

    // Save to localStorage
    saveToLocalStorage() {
        const data = {
            responses: this.responses,
            currentContext: this.currentContext,
            weatherData: this.weatherData,
            lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('environmental_context_data', JSON.stringify(data));
    }

    // Load from localStorage
    loadFromLocalStorage() {
        const saved = localStorage.getItem('environmental_context_data');
        if (saved) {
            const data = JSON.parse(saved);
            this.responses = data.responses || {};
            this.currentContext = data.currentContext || {};
            this.weatherData = data.weatherData || null;
        }
    }

    // Get environmental data for submission
    getEnvironmentalData() {
        return {
            responses: this.responses,
            sensor_data: {
                noise_levels: this.responses['noise_level_auto'] || null,
                light_level: this.currentContext.lightLevel || null,
                motion_data: this.currentContext.motion || null
            },
            weather_data: this.weatherData,
            collection_metadata: {
                auto_detection_used: Object.keys(this.responses).some(key => key.includes('_auto')),
                sensors_available: {
                    audio: !!this.sensors.audio,
                    light: !!this.sensors.light,
                    motion: !!this.sensors.motion
                },
                collection_timestamp: new Date().toISOString()
            }
        };
    }

    // Clean up resources
    destroy() {
        // Stop audio stream
        if (this.sensors.audio?.stream) {
            this.sensors.audio.stream.getTracks().forEach(track => track.stop());
        }

        // Stop light sensor
        if (this.sensors.light?.stop) {
            this.sensors.light.stop();
        }

        // Remove motion listeners
        if (this.sensors.motion?.handler) {
            window.removeEventListener('devicemotion', this.sensors.motion.handler);
        }
    }
}

// Export for use in other modules
window.EnvironmentalContextCollection = EnvironmentalContextCollection;