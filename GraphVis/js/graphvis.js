
var width = 800,
    height = 500;

var color = d3.scale.category20();


var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip");

//Flexible force-directed graph
//https://github.com/mbostock/d3/wiki/Force-Layout
var force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([width, height]);

var svg = d3.select("#graph")
    .attr("width", width)
    .attr("height", height);
var graph;

d3.json("miserables2.json", function(error, graphP) {
  if (error) throw error;
    graph=graphP;

  force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();

  var link = svg.selectAll(".link")
      .data(graph.links)
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node=svg.selectAll(".node")
      .data(graph.nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 5)
      .style("fill", function(d) { return color(d.group); })
        .on("mouseover",function(d){

            $('#name').html(d.name);
            $('#group').html("<i>Classification 1: </i>"+d.group);
            $('#group2').html("<i>Classification 2: </i>"+d.group2);
            $('#group3').html("<i>Classification 3: </i>"+d.group3);
            $('#group4').html("<i>Classification 4: </i>"+d.group4);
            this.setAttribute('r',10);
            tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+12)+"px");
            tooltip.text(d.name);
            tooltip.style("visibility", "visible");
        })
        .on("mouseout",function(d){
            this.setAttribute('r',5);
            tooltip.style("visibility", "hidden");
        }).call(force.drag);

  force.on("tick", function(e) {
      var k = 6 * e.alpha;
  node.forEach(function(o, i) {
    o.y += i & 1 ? k : -k;
    o.x += i & 2 ? k : -k;
  });

    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
  });
});



function tick(e) {
  circle
      .each(cluster(10 * e.alpha * e.alpha))
      .each(collide(.5))
      .attr("cx", function(d) { return d.x; })
      .attr("cy", function(d) { return d.y; });
}

// Move d to be adjacent to the cluster node.
function cluster(alpha) {
  return function(d) {
    var cluster = clusters[d.cluster];
    if (cluster === d) return;
    var x = d.x - cluster.x,
        y = d.y - cluster.y,
        l = Math.sqrt(x * x + y * y),
        r = d.radius + cluster.radius;
    if (l != r) {
      l = (l - r) / l * alpha;
      d.x -= x *= l;
      d.y -= y *= l;
      cluster.x += x;
      cluster.y += y;
    }
  };
}

$('#clust').change(function(e){
    var typeClustering=$('#clust').val();

    svg.selectAll(".node")
      .data(graph.nodes)
      .style("fill", function(d) { return color(d[typeClustering]); });
});