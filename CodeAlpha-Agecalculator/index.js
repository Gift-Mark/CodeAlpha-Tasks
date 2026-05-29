const dobInput = document.getElementById('dob');
// Load saved date
dobInput.value = localStorage.getItem("dob") || "";
//Set max date to today so user can't pick a future date
dobInput.max = new Date().toISOString().split('T')[0];
const resultDiv = document.getElementById('result');
const errorDiv = document.getElementById('error');
let interval;

// 🎯 ZODIAC FUNCTION
function getZodiac(day, month){
  const signs = [
    "Capricorn","Aquarius","Pisces","Aries","Taurus","Gemini",
    "Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius"
  ];

  const lastDay = [19,18,20,19,20,20,22,22,22,22,21,21];
  return (day > lastDay[month]) ? signs[month+1] : signs[month];
}

//CALCULATE AGE
function calculateAge(){
  const dobValue = dobInput.value;
  //Reset Displays
  resultDiv.style.display = 'none';
  errorDiv.style.display = 'none';

  if (!dobValue) {
    showError('Please select your date of birth');
    return;
  }

  localStorage.setItem("dob", dobValue);

  const dob = new Date(dobValue);

  clearInterval(interval);

  interval = setInterval(() => {
  const now = new Date();
  let years = now.getFullYear() - dob.getFullYear();
  let months = now.getMonth() - dob.getMonth();
  let days = now.getDate() - dob.getDate();

  if (days < 0) {
    months--;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
          days += prevMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  //EXTRA CALCULATIONS
  const diff = now - dob;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const zodiac = getZodiac(dob.getDate(), dob.getMonth());

  // 🎯 Extra: Total days lived
  const totalDays = Math.floor((now - dob) / (1000 * 60 * 60 * 24));

  // 🎂 Birthday check
  if (
    now.getDate() === dob.getDate() &&
    now.getMonth() === dob.getMonth()
    ) {
      showConfetti();
      }

  // 🎯 Extra: Next birthday countdown
  const nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);

    const daysToBirthday = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));
    resultDiv.innerHTML = `
    🎉You are <strong>${years}</strong> years, 
    <strong>${months}</strong> months, 
    <strong>${days}</strong> days old.<br><br>

    📅 Total days lived: <strong>${totalDays}</strong><br>
    🎂 Next birthday in: <strong>${daysToBirthday}</strong> days<br>

    ⏱ <strong>${hours}</strong> hours lived<br>
    ⏱ <strong>${minutes}</strong> minutes lived<br>
    ⏱ <strong>${seconds}</strong> seconds lived<br><br>

    🔮 Zodiac: <strong>${zodiac}</strong>
    `;

    resultDiv.style.display = 'block';
    resultDiv.classList.add('show');

    }, 1000);
}

// 🎯 ERROR
  function showError(msg){
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
}

// 🌙 DARK MODE
  const themeBtn = document.getElementById("toggleTheme");

// Load saved theme
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeBtn.textContent = "☀️";
}

// Toggle theme
themeBtn.onclick = () => {
  document.body.classList.toggle("dark");

  if (document.body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    themeBtn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    themeBtn.textContent = "🌙";
  }
};

// 🎊 CONFETTI
function showConfetti(){
  for(let i = 0; i < 30; i++){
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.top = "-10px";
    confetti.style.left = Math.random() * window.innerWidth + "px";
    confetti.style.width = "10px";
    confetti.style.height = "10px";
    confetti.style.background = `hsl(${Math.random()*360},100%,50%)`;
    confetti.style.animation = "fall 2s linear";

    document.body.appendChild(confetti);

    setTimeout(() => confetti.remove(), 2000);
  }

  // 🎊 CONFETTI ANIMATION
  const style = document.createElement('style');
  style.innerHTML = `
  @keyframes fall {
    to {
      transform: translateY(100vh);
      opacity: 0;
    }
  }`;
  document.head.appendChild(style);
}