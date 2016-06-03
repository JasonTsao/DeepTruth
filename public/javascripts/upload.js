/*document.getElementById('files').addEventListener('change', function(e) {
    var file = this.files[0];
    var xhr = new XMLHttpRequest();
    (xhr.upload || xhr).addEventListener('progress', function(e) {
        var done = e.position || e.loaded
        var total = e.totalSize || e.total;
        console.log('xhr progress: ' + Math.round(done/total*100) + '%');
    });
    xhr.addEventListener('load', function(e) {
        console.log('xhr upload complete', e, this.responseText);
    });
    xhr.open('post', '/upload', true);
    //xhr.send(file);
    var fd = new FormData;
    fd.append('video', file);
    xhr.send(fd);
});*/
