/**
 * @author Dimitry Kudrayvtsev
 * @version 2.1
 */

const GANTT_HEIGHT = window.innerHeight/2
const GANTT_WIDTH = window.innerWidth/2
var tooltip;
var burndown;

d3.gantt = function() {
    var FIT_TIME_DOMAIN_MODE = "fit";
    var FIXED_TIME_DOMAIN_MODE = "fixed";

    var margin = {
        top: 20,
        right: 60,
        bottom: 20,
        left: 60
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

    var imagTransform = function(d) {
        return "translate(" + (x(d.startDate) + (x(d.endDate) - x(d.startDate)) -30) + "," + (y(d.taskGroup))  + ")";
    };

    var textTransform = function(d) {
        return "translate(" + x(d.startDate) + "," + (y(d.taskGroup) + 40) + ")";
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

            IS_SUBTASK_VIZ = true
            SUBTASK_FOCUS = d.id
            CURRENT_TASKS = filterById(MAIN_TASKS,SUBTASK_FOCUS).subTasks

            subgantt = d3.gantt().taskTypes(subtaskGroups[d.id]).taskStatus(taskStatus).tickFormat(format);
            gantt = subgantt
            
            changeVision(d.id)

            document.getElementById("ganttForm").reset();
            document.getElementById("r").style.visibility = "visible";

            changeTimeDomain("1year")          
            gantt.redraw(CURRENT_TASKS);
        }
        else{
            console.log("This is a subtask")
            console.log(d)
        }
    }


    var ganttMouseover = function(d) {
        
        tooltip
            .style("opacity", 1)
            .style("display", "block")
        
        if(!d.isSubtask){
            //setGradient(d.burndown)
            setGradient(d.burndownArray)
            burndown
                .style("opacity", 1)
        }
        
        d3.select(event.currentTarget)
            .style("stroke", "black")
            .style("opacity", 1)
        
    }

    var ganttMousemove = function(d) {
    
    
        tooltip
            .html(
                "Task: " + d.taskName + "<br/>" + 
                "Type: " + d.taskGroup + "<br/>" + 
                "Starts: " + d.startDate.toISOString().split("T")[0] + "<br/>" + 
                "Ends: " + d.endDate.toISOString().split("T")[0]  + "<br/>" + 
                "Details: " + d.taskDescription
            )
            .style("left", event.clientX + "px")
            .style("top", (event.clientY + (d.isSubtask? 45 : 60)  + "px"))

        if(!d.isSubtask){
            burndown
                .style("left", event.clientX + "px")
                .style("top", (event.clientY + 45 ) + "px")
        }
    }

    var ganttMouseout = function(d) {
       
        tooltip
            .style("opacity", 0)
            .style("display", "none")
        
        burndown
            .style("opacity", 0)

        d3.select(event.currentTarget)
            .style("stroke", "none")
            .style("stroke-width", 4)
            .style("opacity", 0.8)
    }

    function gantt(tasks) {

        document.getElementById("r").style.visibility = "hidden";

        initTimeDomain(tasks);
        initAxis();

        tooltip = d3.select(selector)
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .attr("id", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")
        
        burndown = d3.select(selector)
            .append("div")
            .style("opacity", 0)
            .attr("class", "burndown")
            .attr("id", "burndown")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "2px")
            .style("border-radius", "5px")
            .style("padding", "5px")

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
            .on('mouseover',ganttMouseover)
            .on('mousemove', ganttMousemove)
            .on('mouseout', ganttMouseout);

        var gx = svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
            .transition()
            .call(xAxis);

        svg.append("g").attr("class", "y axis").transition().call(yAxis);

        return gantt;
    };

    gantt.redraw = function(tasks) {

        initTimeDomain(tasks);
        initAxis();

        var svg = d3.select(".chart");

        d3.select(".chart").selectAll("image").remove()      
        d3.select(".chart").selectAll(".barText").remove()

        var rect = svg.selectAll("rect").data(tasks, keyFunction);
        var imag = svg.selectAll("images").data(tasks, keyFunction);        
        var span = svg.selectAll("span").data(tasks, keyFunction);

        var gx = svg.selectAll("g.x");

        rect.enter()
            .append("rect")
            .on('click', d => {
                ganttClick(d)
            })
            .on('mouseover', d => {
                ganttMouseover(d,tooltip)
 
            })
            .on('mousemove', d => {
                ganttMousemove(d,tooltip)
            })
            .on('mouseout', () => {
                ganttMouseout(tooltip)
            })
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
            ;
         
        span.enter()
            .append("text")   
            .attr("class", "barText")
            .attr("transform", textTransform)
            .attr("dy", ".35em")
            .text(function(d) { return d.taskName; });
        
        imag.enter()
            .append('svg:image')
            .attr("transform", imagTransform)
            .attr("height", 30)
            .attr("width", 30)
            .attr('xlink:href', function(d) {
                if(d.taskType === undefined)
                    return null
                else
                    return d.taskType + '.png'
            });

        rect.transition()
            .attr("transform", rectTransform)
            .attr("height", function(d) {
                return y.bandwidth();
            })
            .attr("width", function(d) {
                return Math.max(1, (x(d.endDate) - x(d.startDate)));
            });

        imag.transition()
            .attr("transform", imagTransform);

        span.transition()
            .attr("transform", textTransform);

        rect.exit().remove();
        imag.exit().remove();        
        span.exit().remove();

        svg.select(".x").transition().call(xAxis);
        svg.select(".y").transition().call(yAxis);

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
                
                rect.attr("width", function(d) {
                        var left = transform.applyX(x(d.startDate));
                        var right = transform.applyX(x(d.endDate));
                        return Math.max(1, right - Math.max(0, left));
                    })
                    .attr("transform", function(d) {
                        return "translate(" + Math.max(0, transform.applyX(x(d.startDate))) + "," + y(d.taskGroup) + ")";
                    });
            });

            svg.call(zoom);

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

