/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

const GANTT_HEIGHT = window.innerHeight/2
const GANTT_WIDTH = window.innerWidth/2

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var margin = {
        top: 20,
        right: 40,
        bottom: 20,
        left: 40
    };

    var selector = '#ganttChart';
    var timeDomainStart = d3.timeDay.offset(new Date(), -3);
    var timeDomainEnd = d3.timeHour.offset(new Date(), +3);
    var timeDomainMode = FIT_TIME_DOMAIN_MODE; // fixed or fit
    var taskTypes = [];
    var taskStatus = [];
    var height = GANTT_HEIGHT - margin.top - margin.bottom - 5;
    var width = GANTT_WIDTH - margin.right - margin.left - 5;
    var align = 0.5;
    var padding = 0.9;

    var tickFormat = "%H:%M";

    var keyFunction = function(d) {
        return d.startDate + d.taskGroup + d.endDate;
    };

    var rectTransform = function(d) {
        return "translate(" + x(d.startDate) + "," + y(d.taskGroup) + ")";
    };

    var x = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
    var y = d3.scaleBand().domain(taskTypes).rangeRound([0, height - margin.top - margin.bottom], .1).align(align).paddingInner(padding).paddingOuter(padding);

    var xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat(tickFormat)).tickSize(8).tickPadding(8);
    var yAxis = d3.axisLeft(y).tickSize(0);

    var initTimeDomain = function(tasks) {
        if (timeDomainMode === FIT_TIME_DOMAIN_MODE) {
            if (tasks === undefined || tasks.length < 1) {
                timeDomainStart = d3.timeDay.offset(new Date(), -3);
                timeDomainEnd = d3.timeHour.offset(new Date(), +3);
                return;
            }
            tasks.sort(function(a, b) {
                return a.endDate - b.endDate;
            });
            timeDomainEnd = tasks[tasks.length - 1].endDate;
            tasks.sort(function(a, b) {
                return a.startDate - b.startDate;
            });
            timeDomainStart = tasks[0].startDate;
        }
    };

    var initAxis = function() {
        x = d3.scaleTime().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
        y = d3.scaleBand().domain(taskTypes).rangeRound([0, height - margin.top - margin.bottom], .1).align(align).paddingInner(padding).paddingOuter(padding);

        xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat(tickFormat)).tickSize(8).tickPadding(8);
        yAxis = d3.axisLeft(y).tickSize(0);
    };

    function ganttClick(d){
        if(!d.isSubtask){

            console.log("This is a main task")
            console.log(d)

            CURRENT_TASKS = d.subTasks
            IS_SUBTASK_VIZ = true
            SUBTASK_FOCUS = d.id

            gantt = d3.gantt().taskTypes(subtaskGroups).taskStatus(subtaskStatus).tickFormat(format);
            changeTimeDomain(timeDomainString);

            cleanRects()
            gantt.redraw(d.subTasks);
        }
        else{
            console.log("This is a subtask")
            console.log(d)
        }
    }
    
    function ganttMouseover(div,d){
        div
            .transition()
            .duration(200)
            .style('opacity', 0.9);
        div
            .html(d.taskName + '<br/>- ' + d.taskDescription)
            .style('left', d3.event.pageX + 'px')
            .style('top', d3.event.pageY + 'px');
            //.html("<div></div>")
            //.style('background-image', `linear-gradient(to left, ${color1}, ${color2}, ${color3}, ${color4})`)
            //.style("height", 60 + 'px')
            //.style("width", 400 + 'px')
            //.style("background-color", 'blue')
            //.style('opacity', 0.9);
    }

    function ganttMouseout(div,d){
        div
            .transition()
            .duration(500)
            .style('opacity', 0);
    }


    function gantt(tasks) {

        var color1 = "blue";
        var color2 = "yellow";
        var color3 = "green";
        var color4 = "red";

        initTimeDomain(tasks);
        initAxis();

        var div = d3
            .select(selector)
            .append('div')
            .attr('class', 'd3tooltip')
            .style('opacity', 0);

        var svg = d3.select(selector)
            .append("svg")
            .attr("class", "chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("class", "gantt-chart")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        var bar = svg.selectAll(".chart")
            .data(tasks, keyFunction).enter()
            .append("rect")
            .attr("class", function(d) {
                if (d.status == null) {
                    return "bar";
                }
                return d.status;
            })
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.bandwidth();
            })
            .attr("width", function(d) {
                return Math.max(1, (x(d.endDate) - x(d.startDate)));
            })
            .style('cursor', 'pointer')
            .on('click', d => {
                ganttClick(d)
            })
            .on('mouseover', d => {
                ganttMouseover(div,d)
 
            })
            .on('mouseout', () => {
                ganttMouseout(div)
            });

        var gx = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
            .transition()
            .call(xAxis);

        svg.append("g").attr("class", "y axis").transition().call(yAxis);

        var zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([
                [0, 0],
                [width, 0]
            ])
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", function() {
                const transform = d3.event.transform;
                gx.call(xAxis.scale(transform.rescaleX(x)));

                bar.attr("width", function(d) {
                        var left = transform.applyX(x(d.startDate));
                        var right = transform.applyX(x(d.endDate));
                        return Math.max(1, right - Math.max(0, left));
                    })
                    .attr("transform", function(d) {
                        return "translate(" + Math.max(0, transform.applyX(x(d.startDate))) + "," + y(d.taskGroup) + ")";
                    });
            });

        d3.select("svg").call(zoom);
      
        return gantt;

    };

    gantt.redraw = function(tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select(".chart");

        var ganttChartGroup = svg.select(".gantt-chart");
        
        var rect = ganttChartGroup.selectAll("rect").data(tasks, keyFunction);

        var div = d3
            .select(selector)
            .append('div')
            .attr('class', 'd3tooltip')
            .style('opacity', 0);

        rect.enter()
            .append("rect")
            .attr("class", function(d) {
                if (taskStatus[d.status] == null) {
                    return "bar";
                }
                return taskStatus[d.status];
            })
            .transition()
            .attr("y", 0)
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.bandwidth();
            })
            .attr("width", function(d) {
                return Math.max(1, (x(d.endDate) - x(d.startDate)));
            })
            .style('cursor', 'pointer')
            .on('click', d => {
                ganttClick(d)
            })
            .on('mouseover', d => {
                ganttMouseover(div,d)
 
            })
            .on('mouseout', () => {
                ganttMouseout(div)
            });


        rect.transition()
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.bandwidth();
            })
            .attr("width", function(d) {
                return Math.max(1, (x(d.endDate) - x(d.startDate)));
            });

        rect.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

        return gantt;
    };

    gantt.margin = function(value) {
        if (!arguments.length) return margin;
        margin = value;
        return gantt;
    };

    gantt.timeDomain = function(value) {
        if (!arguments.length) return [timeDomainStart, timeDomainEnd];
        timeDomainStart = +value[0], timeDomainEnd = +value[1];
        return gantt;
    };

    // The value can be "fit" - the domain fits the data or "fixed" - fixed domain.
    gantt.timeDomainMode = function(value) {
        if (!arguments.length) return timeDomainMode;
        timeDomainMode = value;
        return gantt;

    };

    gantt.taskTypes = function(value) {
        if (!arguments.length) return taskTypes;
        taskTypes = value;
        return gantt;
    };

    gantt.taskStatus = function(value) {
        if (!arguments.length) return taskStatus;
        taskStatus = value;
        return gantt;
    };

    gantt.width = function(value) {
        if (!arguments.length) return width;
        width = +value;
        return gantt;
    };

    gantt.align = function(value) {
        if (!arguments.length) return align;
        align = +value;
        return gantt;
    };

    gantt.padding = function(value) {
        if (!arguments.length) return padding;
        padding = +value;
        return gantt;
    };

    gantt.height = function(value) {
        if (!arguments.length) return height;
        height = +value;
        return gantt;
    };

    gantt.tickFormat = function(value) {
        if (!arguments.length) return tickFormat;
        tickFormat = value;
        return gantt;
    };

    gantt.selector = function(value) {
        if (!arguments.length) return selector;
        selector = value;
        return gantt;
    };

    return gantt;
};

