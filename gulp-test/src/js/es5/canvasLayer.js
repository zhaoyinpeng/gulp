let canvasLayer = function() {
    this.canvasDom = null;
    this.context = null;
    this.canvasBox = document.getElementsByClassName('ol-viewport')[0];
    this.creatCanvas();
}
canvasLayer.prototype.creatCanvas = function() {
    if (this.canvasDom) {
        this.remove();
    }
    this.canvasDom = document.createElement('canvas');
    this.canvasDom.id = 'canvasLayer';
    this.canvasDom.style.position = 'absolute';
    this.canvasDom.height = window.screen.height;
    this.canvasDom.width = window.screen.width;
    this.canvasDom.style.top = 0;
    this.canvasDom.style.left = 0;
    this.canvasBox.appendChild(this.canvasDom);
    this.context = this.canvasDom.getContext("2d");
}
canvasLayer.prototype.remove = function() {
    this.canvasDom.parentNode.removeChild(this.canvasDom);
}
canvasLayer.prototype.clear = function() {
    this.context.clearRect(0,0,this.canvasDom.width,this.canvasDom.height);
}
canvasLayer.prototype.drawRect = function() {
    let context = this.context;
    //起始点和终点
    context.moveTo(100, 100);
    context.lineTo(200, 100);
    context.lineTo(200, 200);
    context.lineTo(100, 200);
    //设置样式
    context.lineWidth = 2;
    context.strokeStyle = "red";
    context.stroke(); //绘制
    context.fillStyle = "#1424DE";
    context.strokeStyle = "#F5270B";
    context.strokeRect(310, 10, 100, 100);
    context.fillRect(310, 10, 100, 100);
    context.stroke(); //绘制
}
export default canvasLayer;