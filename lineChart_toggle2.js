/*
    Line Chart using D3

*/

function makeLineChart(dataset, xName, yNames, annotations) {

     // Initialize Chart
    var chart = {};
    chart.data = dataset;
    chart.xName = xName;
    chart.yNames = yNames;
    chart.groupObjs = {};
    chart.objs = {mainDiv: null, chartDiv: null, g: null, xAxis: null, yAxis: null, tooltip:null, legend:null};

    // Colors
    var colorFunct = d3.scaleOrdinal(d3.schemeCategory20);


    //Formatter functions for the axes
    chart.formatAsNumber = d3.format(".0f");
    chart.formatAsCurrenchartY = d3.format("$.2f");
    chart.formatAsFloat = function(d) {if(d%1!==0){return d3.format(".2f")(d);}else{return d3.format(".0f")(d);}};
    chart.formatAsDay = d3.timeFormat("%a %d %B %Y");


    function getYFuncts() {
        // Return a list of all *visible* y functions
        var yFuncts = [];
        for (var yName in chart.groupObjs) {
            currentGroup = chart.groupObjs[yName];
            if (currentGroup.visible == true) {
                yFuncts.push(currentGroup.yFunct);
            }
        }
        return yFuncts
    }

    function getYMax () {
        // Get the max y value of all *visible* y lines
        return d3.max(getYFuncts().map(function(fn){
            return d3.max(chart.data, fn);
        }))
    }

    function prepareData() {
        chart.xFunct = function(d){return d[xName]};
        chart.bisectYear = d3.bisector(chart.xFunct).left;

        for (var yName in chart.yNames) {
            chart.groupObjs[yName] = {yFunct:null, visible:null, objs:{}};
        }

        // For each yName argument, create a yFunction
        function getYFn(column) {
            return function (d) {
                return d[column];
            };
        }

        // Object instead of array
        chart.yFuncts = [];
        for (yName in chart.yNames) {
            var chartY = chart.groupObjs[yName];
            chartY.visible = !chart.yNames[yName].visible ; // -- this needs to be the opposite of what it should be, because we will toggleSeries
            chartY.yFunct = getYFn(chart.yNames[yName].column);
        }
    }

    prepareData();

    chart.update = function () {
        chart.width = parseInt(chart.objs.chartDiv.style("width"), 10) - (chart.margin.left + chart.margin.right);
        chart.height = parseInt(chart.objs.chartDiv.style("height"), 10) - (chart.margin.top + chart.margin.bottom);

        chart.xScale.range([0, chart.width]);
        chart.yScale.range([chart.height, 0.7]).domain([0.7, getYMax()]);

       if (!chart.objs.g) {return false;}

        /* Else Update the axis with the new scale */
        chart.objs.axes.g.select('.x.axis').attr("transform", "translate(0," + chart.height + ")").call(chart.objs.xAxis);
        chart.objs.axes.g.select('.x.axis .label').attr("x", chart.width / 2);

        chart.objs.axes.g.select('.y.axis').call(chart.objs.yAxis);
        chart.objs.axes.g.select('.y.axis .label').attr("x", -chart.height / 2);

        // update chart lines to show only visible ones
        for (var yName  in chart.groupObjs) {
            chartY = chart.groupObjs[yName];
            if (chartY.visible==true) {
                chartY.objs.line.g.attr("d", chartY.objs.line.series).style("display",null);
                chartY.objs.tooltip.style("display",null);
                // update annotations
                d3.selectAll("#tag"+yName).transition().duration(200).style("display", null);

            } else {
                chartY.objs.line.g.style("display","none");
                chartY.objs.tooltip.style("display","none");
                // update annotations
                d3.selectAll("#tag"+yName).transition().duration(200).style("display", "none");
            }
        }

        chart.objs.tooltip.select('.line')
            .attr("y2", chart.height);

        chart.objs.chartDiv.select('svg')
            .attr("width", chart.width + (chart.margin.left + chart.margin.right))
            .attr("height", chart.height + (chart.margin.top + chart.margin.bottom));

        chart.objs.g.select(".overlay")
            .attr("width", chart.width)
            .attr("height", chart.height);

        return chart;
    };


    chart.bind = function (chartOptions) {
        // chart bind options
        function getChartOptions() {
            // selector
            chart.objs.mainDiv = d3.select(chartOptions.selector);
            chart.selector = chartOptions.selector + " .inner-box";

             // set Axis Labels 
            chart.xAxisLabel = chartOptions.axisLabels.xAxis;
            chart.yAxisLabel = chartOptions.axisLabels.yAxis;
        }
        getChartOptions();

        // assign chart dimensions 
        chart.margin = {top: 15, right: 40, bottom: 30, left: 90};
        chart.divWidth = 900;
        chart.divHeight = 480;
        chart.width = chart.divWidth - chart.margin.left - chart.margin.right;
        chart.height = chart.divHeight - chart.margin.top - chart.margin.bottom;

        // create scale with updated dimensions
        chart.xScale = d3.scaleTime()
            .range([0, chart.width])
            .domain(d3.extent(chart.data, chart.xFunct));
        chart.yScale = d3.scaleLinear()
            .range([chart.height, 0.7])
            .domain([0.7, getYMax()]);

        // create axes     
        chart.objs.xAxis = d3.axisBottom().scale(chart.xScale);
        chart.objs.yAxis = d3.axisLeft().scale(chart.yScale).tickFormat(chart.formatAsFloat); 

        // create lines
        function yScaleFunc(yName) {
            return function (d) {
                return chart.yScale(chart.groupObjs[yName].yFunct(d));
            };
        } 
        for (var yName in yNames) {
            var chartY = chart.groupObjs[yName];
            chartY.objs.line = {g:null, series:null};
            chartY.objs.line.series = d3.line()
                .x(function (d) {return chart.xScale(chart.xFunct(d));})
                .y(yScaleFunc(yName))
                .curve(d3.curveBasis);
        }


        chart.objs.mainDiv.style("max-width", chart.divWidth + "px");
        chart.objs.mainDiv.append("div")
            .attr("class", "inner-wrapper")
            .style("padding-bottom", (chart.divHeight / chart.divWidth) * 100 + "%")
            .append("div").attr("class", "outer-box")
            .append("div").attr("class", "inner-box");
        chart.objs.chartDiv = d3.select(chart.selector);
        d3.select(window).on('resize.' + chart.selector, chart.update);

        // Create the svg
        chart.objs.g = chart.objs.chartDiv.append("svg")
            .attr("class", "chart-area")
            .attr("width", chart.width + (chart.margin.left + chart.margin.right))
            .attr("height", chart.height + (chart.margin.top + chart.margin.bottom))
            .append("g")
            .attr("transform", "translate(" + chart.margin.left + "," + chart.margin.top + ")");

        chart.objs.axes = {};
        chart.objs.axes.g = chart.objs.g.append("g").attr("class", "axis");

        // generate y and x axes
        chart.objs.axes.x = chart.objs.axes.g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + chart.height + ")")
            .call(chart.objs.xAxis)
            .append("text")
                .attr("x", chart.width)
                .attr("y", 30)
                .attr("fill", "#000")
                .style("text-anchor", "middle")
                .text(chart.xAxisLabel);

        chart.objs.axes.y = chart.objs.axes.g.append("g")
            .attr("class", "y axis")
            .call(chart.objs.yAxis)
            .append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", -42)
                .attr("x", -chart.height / 2)
                .attr("dy", ".1em")
                .attr("fill", "#000")
                .style("text-anchor", "middle")
                .text(chart.yAxisLabel);
        return chart;

    };

    chart.render = function () {

       // var yName, chartY=null;
        chart.objs.legend = chart.objs.mainDiv.append('div').attr("class", "legend");

        function toggleSeries(yName) {
            var chartY = chart.groupObjs[yName];
            chartY.visible = !chartY.visible;
            if (chartY.visible==false) {chartY.objs.legend.div.style("opacity","0.25")} else {chartY.objs.legend.div.style("opacity","1")}
            chart.update()
        }
        function getToggleFn(series) {
            return function () {
                return toggleSeries(series);
            };
        }

        for (var yName in chart.groupObjs) {
            chartY = chart.groupObjs[yName];
            chartY.objs.g = chart.objs.g.append("g");
            chartY.objs.line.g = chartY.objs.g.append("path")
                .datum(chart.data)
                .attr("class", "line")
                .attr("d", chartY.objs.line.series)
                .style("stroke", colorFunct(yName))
                .attr("data-series", yName)
                .on("mouseover", function () {
                    tooltip.style("display", null);
                }).on("mouseout", function () {
                    tooltip.transition().delay(700).style("display", "none");
                }).on("mousemove", mouseHover);

            chartY.objs.legend = {};
            chartY.objs.legend.div = chart.objs.legend.append('div').on("click",getToggleFn(yName));
            chartY.objs.legend.icon = chartY.objs.legend.div.append('div')
                .attr("class", "series-marker")
                .style("background-color", colorFunct(yName));
            chartY.objs.legend.text = chartY.objs.legend.div.append('p').text(yName);

        }

        //Draw tooltips
        //Themust be a better way so we don't need a second loop. Issue is draw order so tool tips are on top
        chart.objs.tooltip = chart.objs.g.append("g")
            .attr("class", "tooltip")
            .style("display", "none");
        // Year label
        chart.objs.tooltip.append("text")
            .attr("class", "year")
            .attr("x", 9)
            .attr("y", 7);
        // Focus line
        chart.objs.tooltip.append("line")
            .attr("class", "line")
            .attr("y1", 0)
            .attr("y2", chart.height)
            .style("stroke-dasharray", "3,3");

        for (yName in chart.groupObjs) {
            chartY = chart.groupObjs[yName];
            var tooltip = chart.objs.tooltip.append("g");
            chartY.objs.circle = tooltip.append("circle")
                .attr("r", 4)
                .style("stroke", colorFunct(yName))
                .style("fill", "white");
            chartY.objs.rect = tooltip.append("rect")
                .attr("x", "9")
                .attr("y","-5")
                .attr("width",22)
                .attr("height",'0.5em')
                .style("opacity", 0.8)
                .attr("fill", "white");
            chartY.objs.text = tooltip.append("text")
                .attr("x", "9")
                .attr("dy", ".35em")
                .style("font-size", "8px")
                .style("fill", colorFunct(yName))
                .attr("class","value");
            chartY.objs.tooltip = tooltip;
        }

        // Overlay to capture hover
        chart.objs.g.append("rect")
            .attr("class", "overlay")
            .attr("width", chart.width)
            .attr("height", chart.height)
            .on("mouseover", function () {
                chart.objs.tooltip.style("display", null);
            }).on("mouseout", function () {
                chart.objs.tooltip.style("display", "none");
            }).on("mousemove", mouseHover);

        // this could be improved.
        for (var yName in chart.groupObjs) {
            toggleSeries(yName);
        }

        // Add Annotations 
        if (annotations) {
            chart.objs.g.selectAll("text.label")
                .data(annotations)
                .enter()
                .append("text")
                .attr('x', function(d) {  return chart.xScale(d.x)})
                .attr('y', function(d) { return chart.yScale(d.y)})
                .attr('id', function(d) {return 'tag'+ d.asset})
                .attr("fill", "grey")
                .style("display", function(d) { if (chart.groupObjs[d.asset].visible == true) { return null } else { return "none"}; })
                .style('text-anchor', function(d) { return d.orient == 'right' ? 'start' : 'end'})
                .text(function(d) { return d.text});
            chart.objs.g.selectAll("text.label")
                .data(annotations)
                .enter()
                .append("line")
                .attr("x1", function(d) {  return chart.xScale(d.x)})
                .attr("x2", function(d) {  return chart.xScale(d.x)})
                .attr("y1", function(d) {  return chart.yScale(d.y0)}) 
                .attr("y2", function(d) {  return chart.yScale(d.y)})
                .attr('id', function(d) {return 'tag'+ d.asset})
                .style("stroke", "grey")
                .style("display", function(d) { if (chart.groupObjs[d.asset].visible == true) { return null } else { return "none"}; })
                .style("opacity", 0.7)
                .style("stroke-dasharray", "3,1");
        }

        return chart;


        function mouseHover() {
            var x0 = chart.xScale.invert(d3.mouse(this)[0]), i = chart.bisectYear(dataset, x0, 1), d0 = chart.data[i - 1], d1 = chart.data[i];
            try {
                var d = x0 - chart.xFunct(d0) > chart.xFunct(d1) - x0 ? d1 : d0;
            } catch (e) { 
                return;
            }
            var minY = chart.height;
            for (var yName in chart.groupObjs) {
                var chartY = chart.groupObjs[yName];
                if (chartY.visible==false) {
                    continue;
                }
                chartY.objs.tooltip.attr("transform", "translate(" + chart.xScale(chart.xFunct(d)) + "," + chart.yScale(chartY.yFunct(d)) + ")");
                chartY.objs.tooltip.select("text").text( "$" + chart.formatAsFloat(chartY.yFunct(d))  );
                minY = Math.min(minY, chart.yScale(chartY.yFunct(d)));
            }

            chart.objs.tooltip.select(".tooltip .line").attr("transform", "translate(" + chart.xScale(chart.xFunct(d)) + ")").attr("y1", minY);
            chart.objs.tooltip.select(".tooltip .year").text("Date: " + chart.formatAsDay(chart.xFunct(d)));
        }

    };
    return chart;
}