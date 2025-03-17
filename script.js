
const classes = [
    {
        code: "GEN226",
        time: "15:10-16:40",
        days: ["Sunday", "Tuesday"],
        room: "Online",
        attendance: 0
    },
    {
        code: "PPHS105",
        time: "15:10-16:40",
        days: ["Monday", "Thursday"],
        room: "AB3 1002-Fub 503",
        attendance: 0
    },
    {
        code: "PPHS106",
        time: "08:30-10:10",
        days: ["Monday", "Wednesday"],
        room: "AB3-901/601",
        attendance: 0
    },
    {
        code: "PPHS202",
        time: "10:10-11:40",
        days: ["Monday", "Thursday"],
        room: "107",
        attendance: 0
    }
];

let reminders = {};
let currentViewDate = new Date();
function updateTime() {
    const options = { timeZone: 'Asia/Dhaka', hour12: false, 
        hour: 'numeric', minute: 'numeric', second: 'numeric' };
    const now = new Date().toLocaleTimeString('en-US', options);
    document.getElementById('digital-clock').textContent = now;
    
    updateClassDisplays();
    requestAnimationFrame(updateTime);
}


function getNextClassTime(cls) {
    const now = new Date();
    const [startHour, startMinute] = cls.time.split('-')[0].split(':').map(Number);
    
    for(let day of cls.days) {
        const classDate = new Date(now);
        const dayDiff = (["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
            .indexOf(day) + 7 - now.getDay()) % 7;
        
        classDate.setDate(now.getDate() + dayDiff);
        classDate.setHours(startHour, startMinute, 0, 0);
        
        if(classDate > now) return classDate;
    }
    return null;
}

function updateClassDisplays() {
    const classList = document.getElementById('class-list');
    classList.innerHTML = '';
    
  
    const upcomingClasses = classes.map(cls => {
        const nextClass = getNextClassTime(cls);
        return { cls, nextClass, diff: nextClass ? nextClass - new Date() : Infinity };
    }).filter(entry => entry.nextClass !== null);
    
 
    upcomingClasses.sort((a, b) => a.diff - b.diff);

    upcomingClasses.forEach(({ cls, nextClass, diff }) => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        
        classCard.innerHTML = `
            <h3>${cls.code} (${cls.time})</h3>
            <p>Days: ${cls.days.join(', ')} | Room: ${cls.room}</p>
            <div class="countdown">${formatCountdown(diff)}</div>
            <div class="attendance">
                Attendance: <input type="number" min="0" max="100" 
                value="${cls.attendance}" onchange="updateAttendance('${cls.code}', this.value)">
                %
            </div>
        `;
        
        classList.appendChild(classCard);
    });
}

function formatCountdown(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// Attendance Tracking
function updateAttendance(code, value) {
    const cls = classes.find(c => c.code === code);
    if(cls) cls.attendance = parseInt(value);
}

function initCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';
    
    // Calendar Header
    const monthYear = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-header').innerHTML = `
        <button onclick="changeMonth(-1)">←</button>
        <span>${monthYear}</span>
        <button onclick="changeMonth(1)">→</button>
    `;

    // Get today's date for comparison
    const today = new Date();
    
    // Create calendar days
    const firstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const lastDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Add empty cells for days from previous month
    for(let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(createCalendarDay(''));
    }

    // Create actual days of the month
    for(let i = 1; i <= daysInMonth; i++) {
        const day = createCalendarDay(i);
        if(currentViewDate.getMonth() === today.getMonth() && 
           currentViewDate.getFullYear() === today.getFullYear() && 
           i === today.getDate()) {
            day.classList.add('current-day');
        }
        calendar.appendChild(day);
    }
}

function createCalendarDay(dayNumber) {
    const day = document.createElement('div');
    day.className = 'calendar-day';
    day.textContent = dayNumber;
    if(dayNumber) {
        day.onclick = () => showReminders(dayNumber);
    }
    return day;
}

function changeMonth(offset) {
    currentViewDate.setMonth(currentViewDate.getMonth() + offset);
    initCalendar();
    updateRemindersList();
}

function addReminder() {
    const date = document.getElementById('reminder-date').value;
    const text = document.getElementById('reminder-text').value;
    if(date && text) {
        if(!reminders[date]) reminders[date] = [];
        reminders[date].push(text);
        updateRemindersList();
    }
}

function updateRemindersList() {
    const list = document.getElementById('reminders-list');
    list.innerHTML = '<h4>Upcoming Reminders</h4>';
    
    Object.entries(reminders).forEach(([date, items]) => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${date}:</strong> ${items.join(', ')}`;
        list.appendChild(div);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    initCalendar();
    setInterval(updateClassDisplays, 1000);
});