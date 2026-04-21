// ===== Configuration =====
const API_BASE_URL = 'https://cancer-detection-kjyv.onrender.com/api';
// ===== Mobile Menu Toggle =====
function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    mobileMenu.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    
    if (mobileMenu && mobileMenuBtn) {
        if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    }
});

// ===== Form Handling =====

// Reset form
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        hideResults();
    }
}

// Hide results section
function hideResults() {
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
}

// Show loading state
function showLoading() {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    if (resultsSection && resultsContent) {
        resultsContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Analyzing your data with AI...</p>
            </div>
        `;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show results section with AI prediction
function showResults(apiResponse, inputData) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    if (resultsSection && resultsContent) {
        resultsContent.innerHTML = generateResultsHTML(apiResponse, inputData);
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Animate the progress ring
        setTimeout(() => {
            animateProgressRing(apiResponse.risk_percentage);
        }, 100);
    }
}

// Show error message
function showError(message) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsContent = document.getElementById('resultsContent');
    
    if (resultsSection && resultsContent) {
        resultsContent.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Analysis Error</h3>
                <p>${message}</p>
                <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--text-light);">
                    Please ensure the Flask backend is running on port 5000.
                </p>
            </div>
        `;
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Generate results HTML with risk gauge
function generateResultsHTML(apiResponse, inputData) {
    const { risk_percentage, risk_level, cancer_type } = apiResponse;
    
    // Determine colors based on risk level
    const colors = {
        'low': { primary: '#4CAF50', bg: 'rgba(76, 175, 80, 0.1)', text: 'Low Risk' },
        'moderate': { primary: '#FF9800', bg: 'rgba(255, 152, 0, 0.1)', text: 'Moderate Risk' },
        'high': { primary: '#F44336', bg: 'rgba(244, 67, 54, 0.1)', text: 'High Risk' },
        'very-high': { primary: '#B71C1C', bg: 'rgba(183, 28, 28, 0.1)', text: 'Very High Risk' }
    };
    
    const color = colors[risk_level] || colors['moderate'];
    
    // Create data display
    let dataHTML = '<div class="results-data">';
    for (const [key, value] of Object.entries(inputData)) {
        const label = formatLabel(key);
        const displayValue = formatValue(key, value);
        dataHTML += `
            <div class="data-item">
                <span class="data-label">${label}</span>
                <span class="data-value">${displayValue}</span>
            </div>
        `;
    }
    dataHTML += '</div>';
    
    // Risk gauge HTML
    const gaugeHTML = `
        <div class="risk-gauge-container">
            <div class="risk-gauge">
                <svg viewBox="0 0 200 200" class="progress-ring">
                    <circle class="progress-ring-bg" cx="100" cy="100" r="80" />
                    <circle class="progress-ring-fill" cx="100" cy="100" r="80" 
                            stroke="${color.primary}" 
                            style="stroke-dasharray: 502.65; stroke-dashoffset: 502.65;" />
                </svg>
                <div class="risk-percentage">
                    <span class="percentage-value" style="color: ${color.primary};">0</span>
                    <span class="percentage-symbol" style="color: ${color.primary};">%</span>
                </div>
            </div>
            <div class="risk-label-container">
                <span class="risk-level-badge" style="background-color: ${color.bg}; color: ${color.primary}; border: 2px solid ${color.primary};">
                    ${color.text}
                </span>
                <p class="cancer-type-label">${cancer_type}</p>
            </div>
        </div>
    `;
    
    // Risk interpretation
    const interpretationHTML = `
        <div class="risk-interpretation ${risk_level}">
            <h4>What This Means</h4>
            ${getRiskInterpretation(risk_level, risk_percentage)}
        </div>
    `;
    
    // Disclaimer
    const disclaimerHTML = `
        <div class="results-disclaimer">
            <strong>Important:</strong> This screening tool provides a risk assessment based on the information provided. 
            It is not a medical diagnosis. Please consult with a qualified healthcare professional for proper evaluation and medical advice.
        </div>
    `;
    
    return dataHTML + gaugeHTML + interpretationHTML + disclaimerHTML;
}

// Get risk interpretation text
function getRiskInterpretation(riskLevel, percentage) {
    const interpretations = {
        'low': `
            <p>Your risk assessment indicates a <strong>low probability (${percentage}%)</strong> of cancer indicators based on the provided data.</p>
            <p>While this is encouraging, maintaining regular health check-ups and a healthy lifestyle is still recommended.</p>
        `,
        'moderate': `
            <p>Your risk assessment shows a <strong>moderate probability (${percentage}%)</strong> of potential cancer indicators.</p>
            <p>We recommend scheduling an appointment with your healthcare provider for further evaluation and appropriate screening tests.</p>
        `,
        'high': `
            <p>Your risk assessment indicates a <strong>high probability (${percentage}%)</strong> of cancer indicators based on the provided data.</p>
            <p><strong>We strongly recommend</strong> consulting with a medical professional as soon as possible for comprehensive diagnostic testing.</p>
        `,
        'very-high': `
            <p>Your risk assessment shows a <strong>very high probability (${percentage}%)</strong> of potential cancer indicators.</p>
            <p><strong>Please seek immediate medical attention.</strong> Schedule an appointment with a specialist for thorough diagnostic evaluation.</p>
        `
    };
    
    return interpretations[riskLevel] || interpretations['moderate'];
}

// Animate the progress ring
function animateProgressRing(targetPercentage) {
    const ring = document.querySelector('.progress-ring-fill');
    const percentageValue = document.querySelector('.percentage-value');
    
    if (!ring || !percentageValue) return;
    
    const circumference = 2 * Math.PI * 80; // r = 80
    const targetOffset = circumference - (targetPercentage / 100) * circumference;
    
    let currentPercentage = 0;
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();
    
    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        currentPercentage = Math.round(targetPercentage * easeOutQuart);
        const currentOffset = circumference - (currentPercentage / 100) * circumference;
        
        ring.style.strokeDashoffset = currentOffset;
        percentageValue.textContent = currentPercentage;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Format label for display
function formatLabel(key) {
    const labels = {
        age: 'Age',
        alcohol: 'Alcohol Consumption',
        bilirubin: 'Bilirubin Level',
        sgpt: 'SGPT/ALT Level',
        sgot: 'SGOT/AST Level',
        fatigue: 'Persistent Fatigue',
        smoking: 'Smoking History',
        cough: 'Persistent Cough',
        chest_pain: 'Chest Pain',
        shortness_of_breath: 'Shortness of Breath',
        blood_pressure: 'Blood Pressure',
        albumin: 'Albumin Level',
        sugar: 'Blood Sugar',
        creatinine: 'Creatinine Level',
        swelling: 'Swelling',
        sun_exposure: 'Sun Exposure',
        skin_type: 'Skin Type',
        lesion_size: 'Lesion Size',
        family_history: 'Family History',
        itching: 'Itching',
        bleeding: 'Bleeding'
    };
    
    return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Format value for display
function formatValue(key, value) {
    // Yes/No fields
    const yesNoFields = ['alcohol', 'fatigue', 'smoking', 'cough', 'chest_pain', 
                         'shortness_of_breath', 'swelling', 'sun_exposure', 
                         'family_history', 'itching', 'bleeding'];
    
    if (yesNoFields.includes(key)) {
        return value === '1' || value === 1 ? 'Yes' : 'No';
    }
    
    // Skin type
    if (key === 'skin_type') {
        const types = { '1': 'Fair', '2': 'Brown', '3': 'Dark' };
        return types[value] || value;
    }
    
    // Add units
    const units = {
        age: ' years',
        bilirubin: ' mg/dL',
        sgpt: ' U/L',
        sgot: ' U/L',
        blood_pressure: ' mmHg',
        albumin: ' g/dL',
        sugar: ' mg/dL',
        creatinine: ' mg/dL',
        lesion_size: ' mm'
    };
    
    return value + (units[key] || '');
}

// Print results
function printResults() {
    window.print();
}

// ===== API Communication =====

async function sendToAPI(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Server error');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ===== Form Submissions =====

// Liver Cancer Form
const liverForm = document.getElementById('liverForm');
if (liverForm) {
    liverForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(liverForm);
        const data = {
            age: parseFloat(formData.get('age')),
            alcohol: parseInt(formData.get('alcohol')),
            bilirubin: parseFloat(formData.get('bilirubin')),
            sgpt: parseFloat(formData.get('sgpt')),
            sgot: parseFloat(formData.get('sgot')),
            fatigue: parseInt(formData.get('fatigue'))
        };
        
        showLoading();
        
        try {
            const result = await sendToAPI('/predict/liver', data);
            showResults(result, data);
        } catch (error) {
            showError(error.message || 'Failed to analyze data. Please try again.');
        }
    });
}

// Lung Cancer Form
const lungForm = document.getElementById('lungForm');
if (lungForm) {
    lungForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(lungForm);
        const data = {
            age: parseFloat(formData.get('age')),
            smoking: parseInt(formData.get('smoking')),
            cough: parseInt(formData.get('cough')),
            chest_pain: parseInt(formData.get('chest_pain')),
            fatigue: parseInt(formData.get('fatigue')),
            shortness_of_breath: parseInt(formData.get('shortness_of_breath'))
        };
        
        showLoading();
        
        try {
            const result = await sendToAPI('/predict/lung', data);
            showResults(result, data);
        } catch (error) {
            showError(error.message || 'Failed to analyze data. Please try again.');
        }
    });
}

// Kidney Cancer Form
const kidneyForm = document.getElementById('kidneyForm');
if (kidneyForm) {
    kidneyForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(kidneyForm);
        const data = {
            age: parseFloat(formData.get('age')),
            blood_pressure: parseFloat(formData.get('blood_pressure')),
            albumin: parseFloat(formData.get('albumin')),
            sugar: parseFloat(formData.get('sugar')),
            creatinine: parseFloat(formData.get('creatinine')),
            fatigue: parseInt(formData.get('fatigue')),
            swelling: parseInt(formData.get('swelling'))
        };
        
        showLoading();
        
        try {
            const result = await sendToAPI('/predict/kidney', data);
            showResults(result, data);
        } catch (error) {
            showError(error.message || 'Failed to analyze data. Please try again.');
        }
    });
}

// Skin Cancer Form
const skinForm = document.getElementById('skinForm');
if (skinForm) {
    skinForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(skinForm);
        const data = {
            age: parseFloat(formData.get('age')),
            sun_exposure: parseInt(formData.get('sun_exposure')),
            skin_type: parseInt(formData.get('skin_type')),
            lesion_size: parseFloat(formData.get('lesion_size')),
            family_history: parseInt(formData.get('family_history')),
            itching: parseInt(formData.get('itching')),
            bleeding: parseInt(formData.get('bleeding'))
        };
        
        showLoading();
        
        try {
            const result = await sendToAPI('/predict/skin', data);
            showResults(result, data);
        } catch (error) {
            showError(error.message || 'Failed to analyze data. Please try again.');
        }
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// ===== Input Validation Feedback =====
document.querySelectorAll('input[type="number"]').forEach(input => {
    input.addEventListener('input', function() {
        if (this.validity.valid) {
            this.style.borderColor = '#4CAF50';
        } else {
            this.style.borderColor = '#F44336';
        }
    });
    
    input.addEventListener('blur', function() {
        if (this.value === '') {
            this.style.borderColor = '';
        }
    });
});

console.log('OncoCare script loaded successfully!');
console.log('API Base URL:', API_BASE_URL);
