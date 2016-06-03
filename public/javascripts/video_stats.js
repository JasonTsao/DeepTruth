var videoID;

function getAudioToneWords() {
  $.ajax({
				url: 'http://localhost:8080/video/words?videoID=' + videoID,
				type: 'get',
				error: function(xhr,status,error) {

				},
				success: function(result) {
					console.log('returned from das server!');
          console.log(result);
				}
			});
}



$(document).ready(function(){

  getAudioToneWords();

	videoID = $("#video-section").attr("data-video-ID");
  console.log('videoID is: ' + videoID);
});
