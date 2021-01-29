

// Used to easily create and update charts.
class Chart {
    constructor({type, title, yLabel, legend, color, yMin, containerID, httpURL, dataArray}) {
        this.type = type;
        this.title = title;
        this.yLabel = yLabel;
        this.legend = legend;
        this.color = color;
        this.yMin = yMin;
        this.containerID = containerID;

        this.httpURL = httpURL;
        this.dataArray = dataArray;

        this.create_chart();
    }


    create_chart() {
        
        if(this.yMin == -1) {
            this.yMin = null;
        }

        this.chart = Highcharts.chart(this.containerID, {
            chart: {
                type: this.type,
                scrollablePlotArea: {
                    minWidth: 1000,
                    scrollPositionX: 1
                }
            },

            title: {
                text: this.title
            },
            series: [{
                name: this.legend,
                // showInLegend: false,
                data: []
            }],

            xAxis: {
                type: "datetime",
                dateTimeLabelFormats: {second: "%e/%b %H:%M:%S"},
                title: {
                    text: "Date/Time"
                }
            },
            yAxis: {
                title: {text: this.yLabel},
                min: this.yMin
            },
        
            plotOptions: {
                line: {
                    marker: {
                        enabled: true,
                        symbol: "circle",
                        radius: 2,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }, 
                series: {color: this.color}
            }
        });
    }

    updateChart() {
        // Get sensor data from the micro-controller and add data point to the chart.

        var self = this;
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if(this.readyState == 4 && this.status == 200) {
                var x = (new Date()).getTime();
                var y = parseFloat(this.responseText);

                var dataPoint = [x, y];
                self.chart.series[0].addPoint(dataPoint, true, false, true);

                self.dataArray.push(dataPoint);
            }
        };

        xhttp.open("GET", this.httpURL, true);
        xhttp.send();
    }
}