        const ctx = document.getElementById('myChart');
        const dataValues = [11, 16, 9, 13, 6, 7, 13, 20, 4, 6, 3, 1, 2, 0.1]; 
        const offset = 3; 
        let offsetData; 
        offsetData = dataValues.map(value => value + offset); 

new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['2023-09-25', '2023-09-26', '2023-09-27', '2023-09-28', '2023-09-29', '2023-09-30', '2023-10-01', '2023-10-02', '2023-10-03', '2023-10-04', '2023-10-05', '2023-10-06', '2023-10-07', '2023-10-08'],
        datasets: [{
            data: offsetData,
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
                ticks: {
                    maxRotation: 0,
                    minRotation: 0
                },
            },
            y: {
                display: false
            }
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `No. of Hrs: ${dataValues[context.dataIndex]}`; // Show the actual value from dataValues
                    }
                }
            }
        },
        animation: {
            duration: 0
        },
        responsiveAnimationDuration: 0,
        hover: {
            animationDuration: 0,
        },
        layout: {
            padding: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            }
        }
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
