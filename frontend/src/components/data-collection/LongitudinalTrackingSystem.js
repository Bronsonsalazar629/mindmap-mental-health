/**
 * Longitudinal Tracking System
 * Links entries across time for research continuity and trend analysis
 */

class LongitudinalTrackingSystem {
    constructor() {
        this.participantId = null;
        this.studySession = null;
        this.entryHistory = [];
        this.trackingSchedule = null;
        this.reminders = [];
        this.baselineData = null;
        this.followUpData = [];
        this.isInitialized = false;
    }

    // Initialize longitudinal tracking
    async initialize(participantId, studyProtocol = null) {
        this.participantId = participantId;
        this.loadExistingData();
        
        if (studyProtocol) {
            this.setupStudyProtocol(studyProtocol);
        }

        this.isInitialized = true;
        this.startSessionTracking();
    }

    // Load existing longitudinal data
    loadExistingData() {
        try {
            const savedData = localStorage.getItem(`longitudinal_data_${this.participantId}`);
            if (savedData) {
                const data = JSON.parse(savedData);
                this.entryHistory = data.entryHistory || [];
                this.baselineData = data.baselineData || null;
                this.followUpData = data.followUpData || [];
                this.trackingSchedule = data.trackingSchedule || null;
                this.reminders = data.reminders || [];
            }
        } catch (error) {
            console.error('Failed to load longitudinal data:', error);
        }
    }

    // Setup study protocol for structured data collection
    setupStudyProtocol(protocol) {
        this.trackingSchedule = {
            protocolId: protocol.id,
            protocolName: protocol.name,
            startDate: new Date().toISOString(),
            duration: protocol.duration, // in days
            frequency: protocol.frequency, // daily, weekly, etc.
            reminderTimes: protocol.reminderTimes || [],
            requiredAssessments: protocol.assessments || [],
            followUpSchedule: protocol.followUpSchedule || [],
            completionCriteria: protocol.completionCriteria || {}
        };

        this.scheduleReminders();
        this.saveData();
    }

    // Start tracking current session
    startSessionTracking() {
        this.studySession = {
            sessionId: this.generateSessionId(),
            startTime: new Date().toISOString(),
            participantId: this.participantId,
            sessionType: this.determineSessionType(),
            entryData: {},
            completionStatus: 'in_progress',
            linkedPreviousSessions: this.findLinkedSessions()
        };
    }

    // Generate unique session ID
    generateSessionId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `session_${this.participantId}_${timestamp}_${random}`;
    }

    // Determine session type based on tracking schedule
    determineSessionType() {
        if (!this.baselineData) {
            return 'baseline';
        }

        if (this.trackingSchedule) {
            const daysSinceStart = this.getDaysSinceStart();
            const followUp = this.trackingSchedule.followUpSchedule.find(fu => 
                Math.abs(daysSinceStart - fu.dayOffset) <= 1
            );
            
            if (followUp) {
                return `follow_up_${followUp.type}`;
            }
        }

        return 'regular';
    }

    // Find linked sessions for longitudinal analysis
    findLinkedSessions() {
        const currentTime = new Date();
        const linkedSessions = [];

        // Find most recent session
        const recentSessions = this.entryHistory
            .filter(entry => entry.participantId === this.participantId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5);

        linkedSessions.push(...recentSessions.map(session => ({
            sessionId: session.sessionId,
            timestamp: session.timestamp,
            sessionType: session.sessionType,
            daysSince: this.getDaysBetween(session.timestamp, currentTime.toISOString())
        })));

        // Find baseline session
        if (this.baselineData) {
            linkedSessions.push({
                sessionId: this.baselineData.sessionId,
                timestamp: this.baselineData.timestamp,
                sessionType: 'baseline',
                daysSince: this.getDaysBetween(this.baselineData.timestamp, currentTime.toISOString())
            });
        }

        return linkedSessions;
    }

    // Add entry data to current session
    addEntryData(dataType, data) {
        if (!this.studySession) {
            this.startSessionTracking();
        }

        this.studySession.entryData[dataType] = {
            ...data,
            timestamp: new Date().toISOString(),
            linkedSessions: this.findRelevantLinkedData(dataType)
        };

        this.saveData();
    }

    // Find relevant linked data for comparison
    findRelevantLinkedData(dataType) {
        const linkedData = [];

        // Get previous entries of the same type
        this.entryHistory.forEach(entry => {
            if (entry.entryData && entry.entryData[dataType]) {
                linkedData.push({
                    sessionId: entry.sessionId,
                    timestamp: entry.timestamp,
                    sessionType: entry.sessionType,
                    data: entry.entryData[dataType],
                    daysSince: this.getDaysBetween(entry.timestamp, new Date().toISOString())
                });
            }
        });

        // Sort by recency and limit to most relevant
        return linkedData
            .sort((a, b) => a.daysSince - b.daysSince)
            .slice(0, 10);
    }

    // Complete current session
    completeSession() {
        if (!this.studySession) return;

        this.studySession.endTime = new Date().toISOString();
        this.studySession.completionStatus = 'completed';
        this.studySession.sessionDuration = this.calculateSessionDuration();
        this.studySession.completionMetrics = this.calculateCompletionMetrics();

        // Determine if this is baseline data
        if (this.studySession.sessionType === 'baseline' && !this.baselineData) {
            this.baselineData = { ...this.studySession };
        } else {
            this.followUpData.push({ ...this.studySession });
        }

        // Add to history
        this.entryHistory.push({ ...this.studySession });

        // Update tracking progress
        this.updateTrackingProgress();

        this.saveData();
        this.studySession = null;
    }

    // Calculate session duration
    calculateSessionDuration() {
        if (!this.studySession.startTime || !this.studySession.endTime) {
            return null;
        }

        const start = new Date(this.studySession.startTime);
        const end = new Date(this.studySession.endTime);
        return end.getTime() - start.getTime();
    }

    // Calculate completion metrics
    calculateCompletionMetrics() {
        const entryData = this.studySession.entryData;
        const metrics = {
            totalSections: Object.keys(entryData).length,
            completedSections: 0,
            completionPercentage: 0,
            dataQualityScore: 0
        };

        Object.values(entryData).forEach(section => {
            if (this.isSectionComplete(section)) {
                metrics.completedSections++;
            }
        });

        metrics.completionPercentage = (metrics.completedSections / metrics.totalSections) * 100;
        metrics.dataQualityScore = this.calculateDataQualityScore(entryData);

        return metrics;
    }

    // Check if section is complete
    isSectionComplete(sectionData) {
        if (!sectionData) return false;
        
        // Basic completeness check
        if (sectionData.responses) {
            const responseCount = Object.keys(sectionData.responses).length;
            return responseCount > 0;
        }

        return true;
    }

    // Calculate data quality score
    calculateDataQualityScore(entryData) {
        let totalScore = 0;
        let sectionCount = 0;

        Object.values(entryData).forEach(section => {
            let sectionScore = 0;
            
            // Check completeness
            if (this.isSectionComplete(section)) {
                sectionScore += 0.4;
            }

            // Check for validation errors
            if (!section.validationErrors || section.validationErrors.length === 0) {
                sectionScore += 0.3;
            }

            // Check response consistency
            if (this.isResponseConsistent(section)) {
                sectionScore += 0.3;
            }

            totalScore += sectionScore;
            sectionCount++;
        });

        return sectionCount > 0 ? (totalScore / sectionCount) * 100 : 0;
    }

    // Check response consistency
    isResponseConsistent(sectionData) {
        // Basic consistency checks (could be enhanced)
        if (sectionData.responses) {
            const responses = Object.values(sectionData.responses);
            return responses.every(response => 
                response.timestamp && response.value !== undefined
            );
        }
        return true;
    }

    // Update tracking progress
    updateTrackingProgress() {
        if (!this.trackingSchedule) return;

        const daysSinceStart = this.getDaysSinceStart();
        const completedSessions = this.entryHistory.length;
        const requiredSessions = this.calculateRequiredSessions(daysSinceStart);

        this.trackingSchedule.progress = {
            daysSinceStart,
            completedSessions,
            requiredSessions,
            completionRate: (completedSessions / requiredSessions) * 100,
            nextScheduledSession: this.calculateNextScheduledSession(),
            adherenceScore: this.calculateAdherenceScore()
        };
    }

    // Calculate required sessions based on protocol
    calculateRequiredSessions(daysSinceStart) {
        if (!this.trackingSchedule) return 1;

        const frequency = this.trackingSchedule.frequency;
        switch (frequency) {
            case 'daily':
                return Math.floor(daysSinceStart) + 1;
            case 'weekly':
                return Math.floor(daysSinceStart / 7) + 1;
            case 'biweekly':
                return Math.floor(daysSinceStart / 14) + 1;
            case 'monthly':
                return Math.floor(daysSinceStart / 30) + 1;
            default:
                return 1;
        }
    }

    // Calculate next scheduled session
    calculateNextScheduledSession() {
        if (!this.trackingSchedule) return null;

        const lastEntry = this.entryHistory[this.entryHistory.length - 1];
        if (!lastEntry) {
            return new Date().toISOString();
        }

        const lastDate = new Date(lastEntry.timestamp);
        const frequency = this.trackingSchedule.frequency;
        let nextDate = new Date(lastDate);

        switch (frequency) {
            case 'daily':
                nextDate.setDate(nextDate.getDate() + 1);
                break;
            case 'weekly':
                nextDate.setDate(nextDate.getDate() + 7);
                break;
            case 'biweekly':
                nextDate.setDate(nextDate.getDate() + 14);
                break;
            case 'monthly':
                nextDate.setMonth(nextDate.getMonth() + 1);
                break;
        }

        return nextDate.toISOString();
    }

    // Calculate adherence score
    calculateAdherenceScore() {
        if (!this.trackingSchedule || this.entryHistory.length === 0) {
            return 0;
        }

        const daysSinceStart = this.getDaysSinceStart();
        const expectedSessions = this.calculateRequiredSessions(daysSinceStart);
        const actualSessions = this.entryHistory.length;

        return Math.min((actualSessions / expectedSessions) * 100, 100);
    }

    // Schedule reminders
    scheduleReminders() {
        if (!this.trackingSchedule || !this.trackingSchedule.reminderTimes) {
            return;
        }

        this.trackingSchedule.reminderTimes.forEach(time => {
            this.scheduleReminder(time);
        });
    }

    // Schedule individual reminder
    scheduleReminder(time) {
        const now = new Date();
        const reminderTime = new Date();
        const [hours, minutes] = time.split(':');
        
        reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        // If time has passed today, schedule for tomorrow
        if (reminderTime <= now) {
            reminderTime.setDate(reminderTime.getDate() + 1);
        }

        const timeUntilReminder = reminderTime.getTime() - now.getTime();

        setTimeout(() => {
            this.sendReminder();
            // Schedule next reminder
            this.scheduleReminder(time);
        }, timeUntilReminder);
    }

    // Send reminder notification
    sendReminder() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('MindMap Study Reminder', {
                body: 'Time for your scheduled data entry',
                icon: '/assets/logo.png',
                badge: '/assets/badge.png'
            });
        }

        // Add to reminders list
        this.reminders.push({
            timestamp: new Date().toISOString(),
            type: 'scheduled',
            acknowledged: false
        });

        this.saveData();
    }

    // Get longitudinal trends
    getLongitudinalTrends(dataType, timeframe = 30) {
        const relevantEntries = this.entryHistory
            .filter(entry => {
                const daysSince = this.getDaysBetween(entry.timestamp, new Date().toISOString());
                return daysSince <= timeframe && entry.entryData[dataType];
            })
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (relevantEntries.length === 0) {
            return null;
        }

        const trends = {
            dataType,
            timeframe,
            entryCount: relevantEntries.entries,
            firstEntry: relevantEntries[0].timestamp,
            lastEntry: relevantEntries[relevantEntries.length - 1].timestamp,
            trend: this.calculateTrend(relevantEntries, dataType),
            patterns: this.identifyPatterns(relevantEntries, dataType),
            statistics: this.calculateStatistics(relevantEntries, dataType)
        };

        return trends;
    }

    // Calculate trend direction and magnitude
    calculateTrend(entries, dataType) {
        if (entries.length < 2) return null;

        const values = entries.map(entry => {
            const data = entry.entryData[dataType];
            return this.extractNumericValue(data);
        }).filter(val => val !== null);

        if (values.length < 2) return null;

        // Simple linear regression
        const n = values.length;
        const x = Array.from({length: n}, (_, i) => i);
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = values.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((total, xi, i) => total + xi * values[i], 0);
        const sumXX = x.reduce((total, xi) => total + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return {
            direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
            magnitude: Math.abs(slope),
            confidence: this.calculateTrendConfidence(values, slope, intercept),
            equation: { slope, intercept }
        };
    }

    // Extract numeric value from data for trend analysis
    extractNumericValue(data) {
        if (typeof data === 'number') return data;
        
        // For mood tracking data
        if (data.scores) {
            if (data.scores.phq9) return data.scores.phq9.totalScore;
            if (data.scores.gad7) return data.scores.gad7.totalScore;
        }

        // For other structured data
        if (data.value && typeof data.value === 'number') {
            return data.value;
        }

        return null;
    }

    // Calculate trend confidence
    calculateTrendConfidence(values, slope, intercept) {
        if (values.length < 3) return 0;

        const predictions = values.map((_, i) => slope * i + intercept);
        const errors = values.map((val, i) => Math.abs(val - predictions[i]));
        const mse = errors.reduce((a, b) => a + b * b, 0) / errors.length;
        const variance = values.reduce((acc, val) => {
            const mean = values.reduce((a, b) => a + b) / values.length;
            return acc + Math.pow(val - mean, 2);
        }, 0) / values.length;

        return Math.max(0, 1 - (mse / variance));
    }

    // Identify patterns in longitudinal data
    identifyPatterns(entries, dataType) {
        const patterns = {
            weekdayEffects: this.analyzeWeekdayEffects(entries, dataType),
            timeOfDayEffects: this.analyzeTimeOfDayEffects(entries, dataType),
            seasonalEffects: this.analyzeSeasonalEffects(entries, dataType),
            cyclicPatterns: this.analyzeCyclicPatterns(entries, dataType)
        };

        return patterns;
    }

    // Analyze weekday effects
    analyzeWeekdayEffects(entries, dataType) {
        const weekdayData = {};
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const weekday = weekdays[date.getDay()];
            const value = this.extractNumericValue(entry.entryData[dataType]);

            if (value !== null) {
                if (!weekdayData[weekday]) {
                    weekdayData[weekday] = [];
                }
                weekdayData[weekday].push(value);
            }
        });

        const weekdayAverages = {};
        Object.keys(weekdayData).forEach(day => {
            const values = weekdayData[day];
            weekdayAverages[day] = values.reduce((a, b) => a + b) / values.length;
        });

        return weekdayAverages;
    }

    // Analyze time of day effects
    analyzeTimeOfDayEffects(entries, dataType) {
        const timeData = {
            morning: [],   // 6-12
            afternoon: [], // 12-17
            evening: [],   // 17-22
            night: []      // 22-6
        };

        entries.forEach(entry => {
            const date = new Date(entry.timestamp);
            const hour = date.getHours();
            const value = this.extractNumericValue(entry.entryData[dataType]);

            if (value !== null) {
                if (hour >= 6 && hour < 12) {
                    timeData.morning.push(value);
                } else if (hour >= 12 && hour < 17) {
                    timeData.afternoon.push(value);
                } else if (hour >= 17 && hour < 22) {
                    timeData.evening.push(value);
                } else {
                    timeData.night.push(value);
                }
            }
        });

        const timeAverages = {};
        Object.keys(timeData).forEach(period => {
            const values = timeData[period];
            if (values.length > 0) {
                timeAverages[period] = values.reduce((a, b) => a + b) / values.length;
            }
        });

        return timeAverages;
    }

    // Calculate statistics
    calculateStatistics(entries, dataType) {
        const values = entries.map(entry => 
            this.extractNumericValue(entry.entryData[dataType])
        ).filter(val => val !== null);

        if (values.length === 0) return null;

        const mean = values.reduce((a, b) => a + b) / values.length;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const median = this.calculateMedian(values);

        return {
            count: values.length,
            mean,
            median,
            min,
            max,
            standardDeviation: stdDev,
            variance,
            range: max - min
        };
    }

    // Calculate median
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        
        return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid];
    }

    // Utility functions
    getDaysSinceStart() {
        if (!this.trackingSchedule) return 0;
        return this.getDaysBetween(this.trackingSchedule.startDate, new Date().toISOString());
    }

    getDaysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24);
    }

    // Save all longitudinal data
    saveData() {
        const data = {
            participantId: this.participantId,
            entryHistory: this.entryHistory,
            baselineData: this.baselineData,
            followUpData: this.followUpData,
            trackingSchedule: this.trackingSchedule,
            reminders: this.reminders,
            lastUpdated: new Date().toISOString()
        };

        localStorage.setItem(`longitudinal_data_${this.participantId}`, JSON.stringify(data));
    }

    // Export longitudinal data for research
    exportLongitudinalData() {
        return {
            participantId: this.participantId,
            studyMetadata: {
                trackingSchedule: this.trackingSchedule,
                totalSessions: this.entryHistory.length,
                studyDuration: this.getDaysSinceStart(),
                adherenceScore: this.calculateAdherenceScore()
            },
            baselineData: this.baselineData,
            longitudinalEntries: this.entryHistory.map(entry => ({
                sessionId: entry.sessionId,
                timestamp: entry.timestamp,
                sessionType: entry.sessionType,
                entryData: entry.entryData,
                completionMetrics: entry.completionMetrics,
                linkedSessions: entry.linkedPreviousSessions
            })),
            trendsAnalysis: this.getAllTrends(),
            qualityMetrics: this.calculateOverallQualityMetrics(),
            exportTimestamp: new Date().toISOString()
        };
    }

    // Get trends for all data types
    getAllTrends() {
        const dataTypes = ['mood_tracking', 'environmental_context', 'geographic_data', 'sdoh'];
        const trends = {};

        dataTypes.forEach(dataType => {
            const trend = this.getLongitudinalTrends(dataType);
            if (trend) {
                trends[dataType] = trend;
            }
        });

        return trends;
    }

    // Calculate overall quality metrics
    calculateOverallQualityMetrics() {
        if (this.entryHistory.length === 0) return null;

        const completionRates = this.entryHistory.map(entry => 
            entry.completionMetrics?.completionPercentage || 0
        );

        const qualityScores = this.entryHistory.map(entry => 
            entry.completionMetrics?.dataQualityScore || 0
        );

        return {
            averageCompletionRate: completionRates.reduce((a, b) => a + b) / completionRates.length,
            averageQualityScore: qualityScores.reduce((a, b) => a + b) / qualityScores.length,
            consistencyScore: this.calculateConsistencyScore(),
            adherenceScore: this.calculateAdherenceScore(),
            dataIntegrityScore: this.calculateDataIntegrityScore()
        };
    }

    // Calculate consistency score
    calculateConsistencyScore() {
        // Implementation for consistency analysis
        return 85; // Placeholder
    }

    // Calculate data integrity score
    calculateDataIntegrityScore() {
        // Implementation for data integrity analysis
        return 92; // Placeholder
    }
}

// Export for use in other modules
window.LongitudinalTrackingSystem = LongitudinalTrackingSystem;