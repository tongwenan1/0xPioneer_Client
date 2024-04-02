window.onProgress = null;
window.onGameStarted = function(cc) {
  var launchScene = "db://assets/scene/main.scene"; 
  // load scene
  cc.director.preloadScene(launchScene,onProgress,function(){
    cc.game.run()
  })
}
window.setLoadingDisplay = function  () {
  // Loading splash scene
  var splash = document.getElementById('splash');
  splash.style.display = 'block';
  // progressBar.style.width = '0%';
  cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
      splash.style.display = 'none';
  });
}