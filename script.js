
const classes = [
    {
        code: "GEN226",
        time: "15:10-16:40",
        days: ["Sunday", "Tuesday"],
        room: "Online",
    },
    {
        code: "PPHS105",
        time: "15:10-16:40",
        days: ["Monday", "Thursday"],
        room: "AB3 1002-Fub 503",
    },
    {
        code: "PPHS106",
        time: "08:30-10:10",
        days: ["Monday", "Wednesday"],
        room: "AB3-901/601",
    },
    {
        code: "PPHS202",
        time: "10:10-11:40",
        days: ["Monday", "Thursday"],
        room: "107",
    }
];

let reminders = {};
let currentViewDate = new Date();
function updateTime() {
    const options = { timeZone: 'Asia/Dhaka', hour12: true, 
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
    let delay = 0;

  
    const upcomingClasses = classes.map(cls => {
        const nextClass = getNextClassTime(cls);
        return { cls, nextClass, diff: nextClass ? nextClass - new Date() : Infinity };
    }).filter(entry => entry.nextClass !== null);
    
 
    upcomingClasses.sort((a, b) => a.diff - b.diff);

    upcomingClasses.forEach(({ cls, nextClass, diff }) => {
        const classCard = document.createElement('div');
        classCard.className = 'class-card';
        classCard.style.animationDelay = `${delay}s`;
        delay += 0.1;
    
        classCard.innerHTML = `
            <h3>${cls.code} (${cls.time})</h3>
            <p>Days: ${cls.days.join(', ')} | Room: ${cls.room}</p>
            <div class="countdown">${formatCountdown(diff)}</div>
        `;
    
        classCard.classList.remove('animate');
void classCard.offsetWidth;
classCard.classList.add('animate');
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
function initCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    const monthYear = currentViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    document.getElementById('calendar-header').innerHTML = `
        <button onclick="changeMonth(-1)">←</button>
        <span>${monthYear}</span>
        <button onclick="changeMonth(1)">→</button>
    `;

    const today = new Date();

    const firstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
    const lastDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();

    for(let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(createCalendarDay(''));
    }

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

document.addEventListener('DOMContentLoaded', () => {
    updateTime();
    setInterval(updateClassDisplays, 1000);

    initCalendar();

    const toggleBtn = document.getElementById('toggle-theme');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
        toggleBtn.textContent = '☀️';
    }

    toggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const isDark = document.body.classList.contains('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        toggleBtn.textContent = isDark ? '☀️' : '🌙';
    });
});
