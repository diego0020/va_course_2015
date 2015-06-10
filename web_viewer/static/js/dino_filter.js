/**
 *
 */
    var date_format = d3.time.format("%Y-%m-%d %H:%M:%S");
    var scale_x = d3.scale.linear();
    scale_x.domain([0, 100]);
    scale_x.range([0, 800]);

    var scale_y = d3.scale.linear();
    scale_y.domain([0, 100]);
    scale_y.range([800, 0]);

    var colors = colorbrewer.PuBuGn[9];
    var time_scale = d3.time.scale();
    var time_scale_aux = d3.time.scale();
    var open_time = date_format.parse("2014-6-06 08:00:00");
    var close_time = date_format.parse("2014-6-06 20:30:00");
    time_scale_aux.domain([open_time, close_time]);
    time_scale_aux.range([0,colors.length-1]);
    var time_domain=d3.range(colors.length).map(function(i){return time_scale_aux.invert(i);});
    time_scale.domain(time_domain);
    time_scale.range(colors);

    var t_width=800;
    var t_height=50;

    var time_line_scale = d3.time.scale();
    time_line_scale.domain([open_time,close_time]);
    time_line_scale.range([0,t_width]);

    var svg = d3.select("#main_svg");
    var scatter = svg.append("g");

    var paths = svg.append("g");

    function brushended(){
        var e=brush.extent();
        d3.select("#area_coords").html(
                '<p> x:['+e[0][0]+", "+e[1][0] +"]</p>"+"<p> y: ["+e[0][1]+", "+e[1][1] +"]</p>"
        );
    }

    var brush = d3.svg.brush()
        .x(scale_x)
        .y(scale_y)
        .on("brushend", brushended);

    d3.select("#main_svg").call(brush);

    var time_brush = d3.svg.brush()
        .x(time_line_scale)
        .on("brushend", brushended);
    d3.select("#main_svg").call(brush);

var time_svg = d3.select("#timeline_svg").append("g");

time_svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", t_width)
    .attr("height", t_height);

time_svg.append("g")
    .attr("class", "x grid")
    .attr("transform", "translate(0," + t_height + ")")
    .call(d3.svg.axis()
        .scale(time_line_scale)
        .orient("bottom")
        .ticks(d3.time.minutes,15)
        .tickSize(-t_height)
        .tickFormat(""))
  .selectAll(".tick")
    .classed("minor", function(d) { return d.getMinutes(); });

time_svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + t_height + ")")
    .call(d3.svg.axis()
      .scale(time_line_scale)
      .orient("bottom")
      .ticks(d3.time.hours)
      .tickPadding(0))
    .selectAll("text")
    .attr("x", 6)
    .style("text-anchor", null);

var tbrush = d3.svg.brush()
    .x(time_line_scale)
    .on("brushend", t_brushended);

function t_brushended() {
    var t=tbrush.extent();
    d3.select("#time_interval").html(
            "<p>"+t[0].toLocaleTimeString()+" - "+t[1].toLocaleTimeString()+"</p>"
    )
}

var gBrush = time_svg.append("g")
    .attr("class", "brush")
    .call(tbrush);

gBrush.selectAll("rect")
    .attr("height", 100);


function get_subjects(){
    d3.select("#subjects_list").selectAll("div").remove();
    var g_data;
    var e=brush.extent();
    var t=tbrush.extent();
    var url="filter_data?"+
            "x_min="+e[0][0]+"&"+
            "x_max="+e[1][0]+"&"+
            "y_min="+e[0][1]+"&"+
            "y_max="+e[1][1]+"&"+
            "t_min="+t[0].getTime()+"&"+
            "t_max="+t[1].getTime();
    d3.json(url,function(data){
        g_data = data;
        var labels=d3.select("#subjects_list").selectAll("div").data(g_data.guests).enter()
        .append("div").classed("checkbox",true)
        .append("label");

        labels.append("input").attr("type","checkbox").attr("value", function(d){return d});
        labels.append("spam").text(function(d){return d});

    })
}

d3.select("#get_subjects_btn").on("click",get_subjects);

function get_paths(){
    var x=d3.select("#subjects_list").selectAll("input").filter(function(){return this.checked})[0];
    var guests = x.map(function(i){return i.value});
    for (i=0; i<guests.length;i++){
        add_guest_path(guests[i]);
    }
}

function add_guest_path(g_id){
    var jitter_x = (Math.random()-0.5)*10;
    var jitter_y = (Math.random()-0.5)*10;

    var color=d3.rgb(Math.random()*255,Math.random()*255,Math.random()*255);


    var line = d3.svg.line()
    .x(function(d) { return scale_x(d.X)+jitter_x; })
    .y(function(d) { return scale_y(d.Y)+jitter_y; })
    .interpolate("basis");


    d3.json("data?id="+g_id, function(data){
    paths.append("g").append("path").datum(data.array).attr("d",line).attr("stroke",color);
    });

}

d3.select("#get_paths_btn").on("click",get_paths);

function clear_paths(){
    paths.selectAll("g").remove();
}

d3.select("#clear_paths_btn").on("click",clear_paths);