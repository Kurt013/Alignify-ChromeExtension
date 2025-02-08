document.addEventListener('DOMContentLoaded', function() {
    const ctx = document.getElementById('myChart');

//     // Clear the data for today
// chrome.storage.sync.remove('day', () => {
//     console.log("Specific data ('day') has been cleared.");
// });

// // Clear the data for today
// chrome.storage.sync.remove('week', () => {
//     console.log("Specific data ('day') has been cleared.");
// });

// // Clear the data for today
// chrome.storage.sync.remove('month', () => {
//     console.log("Specific data ('day') has been cleared.");
// });

// // Clear the data for today
// chrome.storage.sync.remove('progress', () => {
//     console.log("Specific data ('day') has been cleared.");
// });


    // // Add dummy data for testing
    // chrome.storage.sync.get("day", (data) => {
    //     let day = data.day || {};

    //     // Add previous dates with corresponding data
    //     const previousDates = {
    //         "2024-12-21": 12,
    //         "2024-12-23": 30,
    //         "2024-12-25": 20,
    //         "2024-12-26": 300,
    //         "2024-12-29": 221,
    //         "2024-12-30": 321,
    //         "2024-01-27": 333,
    //         "2024-01-28": 294,
    //         "2024-01-29": 218,
    //         "2024-01-30": 294,
    //         "2024-01-31": 239,
    //         "2024-02-01": 210,
    //         "2024-02-02": 21,
    //         "2024-02-03": 30,
    //         "2024-02-04": 45,
    //         "2025-02-05": 90,
    //         "2025-02-06": 75,
    //     };

    //     // Loop through the object and add the data to the `day` object
    //     for (let date in previousDates) {
    //         day[date] = previousDates[date];
    //     }

    //     // Save the updated `day` object in chrome storage
    //     chrome.storage.sync.set({ day }, () => {
    //         console.log("Previous dates with corresponding data have been added:", day);
    //     });
    // });

  



chrome.storage.sync.get(["day", "progress"], (data) => {
    let day = data.day || {}; // Get stored daily data
    let progress = data.progress || {
        highest_record: 0,
        highest_streak: 0,
        current_streak: 0,
        current_record: 0,
        lastDate: null
    }

    function getStartAndEndOfWeek(date) {
        let d = new Date(date);
        let dayOfWeek = d.getDay(); // Get the day of the week (0 = Sunday, 6 = Saturday)
        let startDate = new Date(d);
        startDate.setDate(d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Adjust to Monday
        startDate.setHours(0, 0, 0, 0);

        let endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of the week (Sunday)

        let startLabel = startDate.toISOString().split('T')[0]; // Format as MM/DD/YYYY
        let endLabel = endDate.toISOString().split('T')[0]; // Format as MM/DD/YYYY
        return `${endLabel} - ${startLabel}`; // Format as "MM/DD/YYYY to MM/DD/YYYY"
    }

    function aggregateWeeklyData(dailyData) {
        let weeklyData = {};
    
        for (let date in dailyData) {
            let weekLabel = getStartAndEndOfWeek(date); // Get week range as label
            weeklyData[weekLabel] = (weeklyData[weekLabel] || 0) + dailyData[date];
        }
    
        return weeklyData;
    }
        
    function aggregateMonthlyData(dailyData) {
        let monthlyData = {};
    
        // Convert the dailyData into an array of objects with date and value
        let dateList = Object.keys(dailyData).map(date => {
            return {
                date: new Date(date),  // Convert date string to Date object
                value: dailyData[date]
            };
        });
        
        // Sort the list by year, then month, then day
        dateList.sort((a, b) => a.date - b.date); // Sorting by Date object
    
        // Aggregate the data by month and year in "YYYY/MM" format
        let sortedMonthlyData = {};
        dateList.forEach(item => {
            // Format month as YYYY/MM
            let monthLabel = `${item.date.getFullYear()}/${item.date.getMonth() + 1}`;
            sortedMonthlyData[monthLabel] = (sortedMonthlyData[monthLabel] || 0) + item.value;
        });
    
        // Sort the months based on year and month (important to ensure chronological order)
        let sortedMonthKeys = Object.keys(sortedMonthlyData).sort((a, b) => {
            let [yearA, monthA] = a.split('/');
            let [yearB, monthB] = b.split('/');
            
            return (parseInt(yearA) - parseInt(yearB)) || (parseInt(monthA) - parseInt(monthB));
        });
    
        // Create a new object with sorted keys
        let finalSortedMonthlyData = {};
        sortedMonthKeys.forEach(key => {
            finalSortedMonthlyData[key] = sortedMonthlyData[key];
        });
    
        // Output the result (sorted data by month-year in chronological order)
        // console.log("Sorted Monthly Data:", finalSortedMonthlyData);
    
        return finalSortedMonthlyData;
    }


    let weeklyData = aggregateWeeklyData(day);
    let monthlyData = aggregateMonthlyData(day);

    // Iterate through the daily data to find the highest record
    for (let date in day) {
        if (day[date] > progress.highest_record) {
            progress.highest_record = day[date];
        }
    }

    console.log(progress.highest_record);



    // Store the aggregated weekly and monthly data
    chrome.storage.sync.set({ week: weeklyData, month: monthlyData, progress });
});

let chart;
let viewMode = "day"; // Change to "day" / "week" / "month" based on user selection

function updateChart() {
    chrome.storage.sync.get(["day", "week", "month"], (data) => {


        let dataset = data[viewMode] || {}; // Fetch the relevant dataset

        let labelData = [];  // Labels (dates/weeks/months)
        let dataValues = []; // Corresponding values (hours)

        for (let label in dataset) {
            labelData.push(label);
            dataValues.push(dataset[label]);
        }

        if (chart) {
            chart.destroy(); // Destroy the existing chart before creating a new one
        }

        let dataCount = dataValues.length;
        let chartWidth = dataCount * 100;
        ctx.width = chartWidth;


        // Initialize Chart
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labelData,
                datasets: [{
                    data: dataValues,
                    borderRadius: Number.MAX_VALUE,
                    backgroundColor: '#BAD8B6',
                    borderColor: 'transparent',
                    hoverBackgroundColor: '#E1EACD',
                }]
            },
            options: {
                responsive: false,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        ticks: { maxRotation: 0, minRotation: 0 },
                    },
                    y: { display: false }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                let totalSeconds = dataValues[context.dataIndex];
                                let hours = Math.floor(totalSeconds / 3600);
                                let minutes = Math.floor((totalSeconds % 3600) / 60);
                                let seconds = totalSeconds % 60;
                                return `Time: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                            }
                        }
                    }
                },
                animation: { duration: 0 },
                responsiveAnimationDuration: 0,
                hover: { animationDuration: 0 },
                layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } }
            }
        });
    });
}


if (document.hidden === false) {
    // updateAchievements();
    updateChart();
}

document.addEventListener('visibilitychange', function() {
    if (document.hidden === false) {
        updateAchievements();
        updateChart();
    }
});

    ctx.addEventListener('mousedown', function(e) {
        let startX = e.pageX;
        let scrollLeft = ctx.parentElement.scrollLeft;

        function onMouseMove(e) {
            const x = e.pageX - startX;
            ctx.parentElement.scrollLeft = scrollLeft - x;
        }

        function onMouseUp() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });



    /* For Buttons */
    const dayBtn = document.getElementById('day');
    const weekBtn = document.getElementById('week');
    const monthBtn = document.getElementById('month');

    dayBtn.addEventListener('click', function() {
        dayBtn.classList.add('current-tab');
        weekBtn.classList.remove('current-tab');
        monthBtn.classList.remove('current-tab');
        
        viewMode = "day";
        updateChart();
    });

    weekBtn.addEventListener('click', function() {
        dayBtn.classList.remove('current-tab');
        weekBtn.classList.add('current-tab');
        monthBtn.classList.remove('current-tab');   
        
        viewMode = "week";
        updateChart();
    });

    monthBtn.addEventListener('click', function() {
        dayBtn.classList.remove('current-tab');
        weekBtn.classList.remove('current-tab');
        monthBtn.classList.add('current-tab');     
        
        viewMode = "month";
        updateChart();
    });




    const messages = [
        "You're doing great! Keep it up!",
        "Keep up the amazing work!",
        "You're making awesome progress!",
        "You're doing fantastic!",
        "You're on fire! Keep pushing forward!"
    ];
    
    const message = document.getElementById('messages');

    message.innerHTML = getRandomMessage();


    function getRandomMessage() {
        return messages[Math.floor(Math.random() * messages.length)];
    }





    const postureTips = [
        "Reminder: Sit back, relax, but don't slouch - your spine will thank you!",
        "Reminder: Stretch it out every hour - your body will love the break!",
        "Reminder: Eye level with your screen, not the desk! Keep that neck happy.",
        "Reminder: Engage your core - not just for fitness, but for good posture too!",
        "Reminder: Grab some water - it's a great excuse to stand up and stretch!"
    ];


    const tips = document.getElementById('tip-reminder');

    tips.innerHTML = getRandomTip();

    function getRandomTip() {
        return postureTips[Math.floor(Math.random() * postureTips.length)];
    }

    

    function updateProgress() {
        chrome.storage.sync.get("day", (data) => {
            const currentProgress = document.getElementById("current-record");
    
            let day = data.day || {};
            let today = new Date().toISOString().split('T')[0]; // Get today's date in MM/DD/YYYY format
            let seconds = day[today] || 0; // Ensure today's value starts at 0 seconds
    
            // Convert seconds to hours in decimal format
            let hours = (seconds / 3600);
            let formattedTime = hours % 1 === 0 ? hours.toFixed(0) : (hours % 1 >= 0.1 ? hours.toFixed(1) : hours.toFixed(0));
            currentProgress.innerHTML = formattedTime;
        });
    }
    
    // Call updateProgress initially and update every second
    updateProgress();
    setInterval(updateProgress, 1000);


    //Get the progress (highest streak and record)
    function updateAchievements() {
        chrome.storage.sync.get(["progress"], (data) => {
            let progress = data.progress || {
                highest_record: 0,
                highest_streak: 0,
                current_streak: 0,
                current_record: 0,
                lastDate: null
            };

            const highestRecord = document.getElementById("highscore");
            const unitRecord = document.getElementById("score-unit");

            const highestStreak = document.getElementById("highstreak");
            const streak = document.getElementById("streak");

            console.log(progress.current_streak);

            if (progress.highest_record < 60) {
                highestRecord.innerHTML = progress.highest_record;
                unitRecord.innerHTML = "secs";
            } else if (progress.highest_record < 3600) {
                let minutes = progress.highest_record / 60;
                highestRecord.innerHTML = minutes % 1 === 0 ? minutes.toFixed(0) : minutes.toFixed(1);
                unitRecord.innerHTML = "mins";
            } else {
                let hours = progress.highest_record / 3600;
                highestRecord.innerHTML = hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
                unitRecord.innerHTML = "hours";
            }

            highestStreak.innerHTML = progress.highest_streak;
            streak.innerHTML = progress.current_streak;
        });
    }


    updateAchievements();

    
// // Clear the data for today
// chrome.storage.sync.remove(['progress', 'day', 'preferences', 'week', 'month'], () => {
//     console.log("Specific data ('day') has been cleared.");
// });


    chrome.storage.sync.get("preferences", (data) => {
        let preferences = data.preferences || {
            profile: 'user123',
            sound: 1,
            sensitivity: 0.8
        };

        const username = document.getElementById('username');
        username.innerHTML = preferences.profile;
    });




    // chrome.storage.sync.get("progress", (data) => {

    //     let progress = data.progress || {
    //         highest_record: 0,
    //         highest_streak: 0,
    //         current_streak: 0,
    //         current_record: 0,
    //         lastDate: null
    //     };

    //     // Update the progress object with the new data
    //     progress.highest_streak = 1;
    //     progress.current_streak = 1;
    //     let yesterday = new Date();
    //     yesterday.setDate(yesterday.getDate() - 1);
    //     progress.lastDate = yesterday.toISOString().split('T')[0]



    //     // Save the updated progress object in chrome storage
    //     chrome.storage.sync.set({ progress }, () => {
    //         console.log("Progress object has been updated:", progress);
    //     });
    // });

    
    
});
