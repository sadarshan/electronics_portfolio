// Global variables for wire management
let breadboardWires = [];
let wireUpdateInterval;
let wireAnimationId = 0;

// Wire colors for breadboard connections
const wireColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];

// Create colored wire connections between random breadboard dots
function createBreadboardConnections() {
    const svg = document.querySelector('.connecting-wires');
    const svgRect = svg.getBoundingClientRect();
    const gridSize = 80; // Match the breadboard grid size
    const dotSpacing = 40; // Distance between dots in the grid
    
    // Calculate grid dimensions
    const cols = Math.floor(svgRect.width / gridSize) * 2;
    const rows = Math.floor(svgRect.height / gridSize) * 2;
    
    // Generate random connections between dots
    const numConnections = 12; // Number of random wire connections
    
    for (let i = 0; i < numConnections; i++) {
        // Random start point
        const startCol = Math.floor(Math.random() * cols);
        const startRow = Math.floor(Math.random() * rows);
        const x1 = (startCol * dotSpacing) + 20;
        const y1 = (startRow * dotSpacing) + 20;
        
        // Random end point (not too far from start)
        const maxDistance = 3;
        const endCol = Math.max(0, Math.min(cols - 1, startCol + Math.floor(Math.random() * maxDistance * 2) - maxDistance));
        const endRow = Math.max(0, Math.min(rows - 1, startRow + Math.floor(Math.random() * maxDistance * 2) - maxDistance));
        const x2 = (endCol * dotSpacing) + 20;
        const y2 = (endRow * dotSpacing) + 20;
        
        // Skip if start and end are the same
        if (x1 === x2 && y1 === y2) continue;
        
        createSingleWire(svg, x1, y1, x2, y2, i * 0.2);
    }
}

// Create a single wire with animation
function createSingleWire(svg, x1, y1, x2, y2, delay = 0) {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Add some curvature for more realistic wire routing
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 50) {
        // Short wires - direct connection
        path.setAttribute('d', `M ${x1},${y1} L ${x2},${y2}`);
    } else {
        // Longer wires - add curve
        const mx = x1 + dx * 0.5 + (Math.random() - 0.5) * 30;
        const my = y1 + dy * 0.5 + (Math.random() - 0.5) * 30;
        path.setAttribute('d', `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`);
    }
    
    // Random wire color
    const color = wireColors[Math.floor(Math.random() * wireColors.length)];
    path.setAttribute('stroke', color);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.style.opacity = '0.7';
    path.classList.add('breadboard-wire');
    
    // Animate wire drawing
    const length = path.getTotalLength();
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = length;
    
    // Create unique animation name
    const animationName = `drawWire-${++wireAnimationId}`;
    path.style.animation = `${animationName} 2s ease-in-out ${delay}s forwards`;
    
    // Add dynamic animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ${animationName} {
            to {
                stroke-dashoffset: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    svg.appendChild(path);
    breadboardWires.push({ element: path, style: style });
    
    return path;
}

// Remove a random wire
function removeRandomWire() {
    if (breadboardWires.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * breadboardWires.length);
    const wire = breadboardWires[randomIndex];
    
    if (wire.element && wire.element.parentNode) {
        // Animate wire removal (reverse drawing)
        const length = wire.element.getTotalLength();
        wire.element.style.animation = 'none';
        wire.element.style.strokeDasharray = length + ' ' + length;
        wire.element.style.strokeDashoffset = '0';
        wire.element.style.transition = 'stroke-dashoffset 1s ease-in-out';
        wire.element.style.strokeDashoffset = length;
        
        // Remove after animation
        setTimeout(() => {
            if (wire.element && wire.element.parentNode) {
                wire.element.parentNode.removeChild(wire.element);
            }
            if (wire.style && wire.style.parentNode) {
                wire.style.parentNode.removeChild(wire.style);
            }
        }, 1000);
    }
    
    // Remove from tracking array
    breadboardWires.splice(randomIndex, 1);
}

// Add a random new wire
function addRandomWire() {
    const svg = document.querySelector('.connecting-wires');
    const svgRect = svg.getBoundingClientRect();
    const gridSize = 80;
    const dotSpacing = 40;
    
    const cols = Math.floor(svgRect.width / gridSize) * 2;
    const rows = Math.floor(svgRect.height / gridSize) * 2;
    
    // Random start point
    const startCol = Math.floor(Math.random() * cols);
    const startRow = Math.floor(Math.random() * rows);
    const x1 = (startCol * dotSpacing) + 20;
    const y1 = (startRow * dotSpacing) + 20;
    
    // Random end point (not too far from start)
    const maxDistance = 3;
    const endCol = Math.max(0, Math.min(cols - 1, startCol + Math.floor(Math.random() * maxDistance * 2) - maxDistance));
    const endRow = Math.max(0, Math.min(rows - 1, startRow + Math.floor(Math.random() * maxDistance * 2) - maxDistance));
    const x2 = (endCol * dotSpacing) + 20;
    const y2 = (endRow * dotSpacing) + 20;
    
    // Skip if start and end are the same
    if (x1 === x2 && y1 === y2) return;
    
    createSingleWire(svg, x1, y1, x2, y2, 0);
}

// Start real-time wire updates with individual wire changes
function startWireUpdates() {
    const maxWires = 15;
    const minWires = 8;
    
    wireUpdateInterval = setInterval(() => {
        const currentWireCount = breadboardWires.length;
        
        // Randomly decide whether to add or remove a wire
        const shouldAdd = currentWireCount < minWires || 
                         (currentWireCount < maxWires && Math.random() > 0.5);
        
        if (shouldAdd && currentWireCount < maxWires) {
            // Add a new wire
            addRandomWire();
        } else if (currentWireCount > minWires) {
            // Remove a random wire
            removeRandomWire();
        }
        
    }, 2000); // Check every 2 seconds for more dynamic updates
}

// Stop wire updates
function stopWireUpdates() {
    if (wireUpdateInterval) {
        clearInterval(wireUpdateInterval);
        wireUpdateInterval = null;
    }
}

// Remove all breadboard wires (for cleanup)
function removeAllBreadboardWires() {
    breadboardWires.forEach(wire => {
        if (wire.element && wire.element.parentNode) {
            wire.element.parentNode.removeChild(wire.element);
        }
        if (wire.style && wire.style.parentNode) {
            wire.style.parentNode.removeChild(wire.style);
        }
    });
    breadboardWires = [];
}

// Initialize wires
function initializeWires() {
    const svg = document.querySelector('.connecting-wires');
    
    // Create random breadboard dot connections
    createBreadboardConnections();
    
    // Start real-time wire updates
    startWireUpdates();
}

// Window resize handler for wire redrawing
window.addEventListener('resize', () => {
    stopWireUpdates();
    removeAllBreadboardWires();
    const svg = document.querySelector('.connecting-wires');
    // Keep the defs and remove all paths
    const defs = svg.querySelector('defs');
    svg.innerHTML = '';
    if (defs) svg.appendChild(defs);
    setTimeout(initializeWires, 100);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
    stopWireUpdates();
});

// Generate random ESP32 boot sequence
function generateBootSequence() {
    const resetTypes = ["0x1 (POWERON_RESET)", "0x10 (RTCWDT_RTC_RESET)", "0x5 (DEEPSLEEP_RESET)"];
    const bootModes = ["0x13 (SPI_FAST_FLASH_BOOT)", "0x12 (SPI_FLASH_BOOT)", "0x17 (GENERIC_SPI_SF_BOOT)"];
    const configValues = ["0", "188", "271", "384"];
    const spiwpValues = ["0xee", "0xff", "0x00", "0xf0"];
    const clockDivs = ["1", "2", "4", "8"];
    const loadAddresses = [
        [`0x3fff${Math.floor(Math.random() * 16).toString(16).padStart(4, '0')}`, Math.floor(Math.random() * 2000 + 1000)],
        [`0x4007${Math.floor(Math.random() * 16).toString(16).padStart(4, '0')}`, Math.floor(Math.random() * 5000 + 10000)],
        [`0x4008${Math.floor(Math.random() * 16).toString(16).padStart(4, '0')}`, Math.floor(Math.random() * 1000 + 3000)]
    ];
    const entryPoint = `0x40080${Math.floor(Math.random() * 16).toString(16)}${Math.floor(Math.random() * 16).toString(16)}0`;
    
    return [
        `rst:${resetTypes[Math.floor(Math.random() * resetTypes.length)]},boot:${bootModes[Math.floor(Math.random() * bootModes.length)]}`,
        `configsip: ${configValues[Math.floor(Math.random() * configValues.length)]}, SPIWP:${spiwpValues[Math.floor(Math.random() * spiwpValues.length)]}`,
        `clk_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')},q_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')},d_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')},cs0_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')},hd_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')},wp_drv:0x${Math.floor(Math.random() * 256).toString(16).padStart(2, '0')}`,
        `mode:DIO, clock div:${clockDivs[Math.floor(Math.random() * clockDivs.length)]}`,
        `load:${loadAddresses[0][0]},len:${loadAddresses[0][1]}`,
        `load:${loadAddresses[1][0]},len:${loadAddresses[1][1]}`,
        `load:${loadAddresses[2][0]},len:${loadAddresses[2][1]}`,
        `entry ${entryPoint}`,
        "",
        "===============================================",
        "",
        "            Name: Darshan Savaliya",
        "",
        "===============================================",
        "",
        "System initialized successfully.",
        "Ready for operation...",
        ""
    ];
}

let bootSequence = [];

let currentLineIndex = 0;
let currentCharIndex = 0;
let isTyping = false;
let bootTimer;

function typeText(text, callback, speed = 50) {
    if (currentCharIndex < text.length) {
        const outputElement = document.getElementById('terminal-output');
        outputElement.textContent += text[currentCharIndex];
        currentCharIndex++;
        setTimeout(() => typeText(text, callback, speed), speed);
    } else {
        if (callback) callback();
    }
}

function addNewLine() {
    const outputElement = document.getElementById('terminal-output');
    outputElement.textContent += '\n';
}

function processNextLine() {
    if (currentLineIndex < bootSequence.length) {
        const currentLine = bootSequence[currentLineIndex];
        
        if (currentLine === '') {
            // Empty line - just add newline
            addNewLine();
            currentLineIndex++;
            setTimeout(processNextLine, 100);
        } else {
            // Type the line
            isTyping = true;
            currentCharIndex = 0;
            
            // Determine typing speed based on content
            let typingSpeed = 1; // Ultra fast speed for technical lines
            if (currentLine.includes("Name: Darshan Savaliya")) {
                typingSpeed = 30; // Much faster speed for name
            } else if (currentLine.includes("===")) {
                typingSpeed = 8; // Very fast speed for separators
            }
            
            typeText(currentLine, () => {
                addNewLine();
                currentLineIndex++;
                isTyping = false;
                
                // Add different delays for different types of lines
                let delay = 10; // Ultra fast delay for most lines
                if (currentLine.includes("Name: Darshan Savaliya")) {
                    delay = 500; // Much shorter pause for name
                } else if (currentLine.includes("===")) {
                    delay = 100; // Very fast pause for separators
                }
                
                setTimeout(processNextLine, delay);
            }, typingSpeed);
        }
    } else {
        // Boot sequence complete, start countdown
        startCountdown();
    }
}

function clearTerminal() {
    const outputElement = document.getElementById('terminal-output');
    outputElement.textContent = '';
}

function startCountdown() {
    let countdownValue = 10;
    
    function updateCountdown() {
        const outputElement = document.getElementById('terminal-output');
        // Clear the last countdown line if it exists
        const lines = outputElement.textContent.split('\n');
        if (lines[lines.length - 1].includes('Restarting in')) {
            lines.pop();
            outputElement.textContent = lines.join('\n');
        }
        
        if (countdownValue > 0) {
            outputElement.textContent += `\nRestarting in ${countdownValue}...`;
            countdownValue--;
            setTimeout(updateCountdown, 1000);
        } else {
            // Countdown complete, restart boot sequence
            startBootSequence();
        }
    }
    
    updateCountdown();
}

function startBootSequence() {
    clearTerminal();
    currentLineIndex = 0;
    currentCharIndex = 0;
    
    // Generate new random boot sequence
    bootSequence = generateBootSequence();
    
    // Add initial delay to simulate power on
    setTimeout(() => {
        processNextLine();
    }, 200);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
    initializeWires();
    startBootSequence();
});