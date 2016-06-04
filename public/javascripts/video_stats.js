var videoName;

var fill = d3.scale.category20();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

function drawAudioWordCloud(words) {
  d3.layout.cloud().size([600, 400])
      .words(words)
      .rotate(function() { return ~~(Math.random() * 2) * 90; })
      .font("Impact")
      .fontSize(function(d) { return d.size; })
      .on("end", draw)
      .start();

  function draw(words) {
    d3.select("#audio-word-cloud").append("svg")
        .attr("width", 600)
        .attr("height", 400)
      .append("g")
        .attr("transform", "translate(300,200)")
      .selectAll("text")
        .data(words)
      .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("font-family", "Impact")
        .style("fill", function(d, i) { return fill(i); })
        .attr("text-anchor", "middle")
        .attr("transform", function(d) {
          return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
  }
}

function getAudioToneWords() {
  $.ajax({
				url: 'http://localhost:8080/video/words?videoName=' + videoName,
				type: 'get',
				error: function(xhr,status,error) {

				},
				success: function(result) {
					console.log('returned from das server!');
          console.log(result);
          drawAudioWordCloud(result.words || []);
				}
			});
}



$(document).ready(function(){
	videoName = $("#video-section").attr("data-video-name");
  console.log('video name is: ' + videoName);
  getAudioToneWords();
});
